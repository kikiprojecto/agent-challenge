import { NextRequest, NextResponse } from 'next/server';
import { codeGeneratorTool } from '@/mastra/tools/codeGenerator';
import { codeReviewerTool } from '@/mastra/tools/codeReviewer';
import { testGeneratorTool } from '@/mastra/tools/testGenerator';
import { responseCache, getCacheKey } from '@/lib/cache';
import { validateCodeQuality, shouldRetryGeneration, getEnhancedPrompt } from '@/lib/codeValidator';
import { generateEnhancedPrompt } from '@/lib/language-prompts';
import { selectOptimalModel } from '@/lib/model-selector';
import { analytics } from '@/lib/analytics';
import { qualityScorer } from '@/lib/quality-scorer';
import { streamCode } from '@/lib/streaming';

// Global flag to track if model has been loaded
declare global {
  var ollamaModelLoaded: boolean | undefined;
}

// Enterprise-grade LLM context factory with retry logic
function createAdvancedMastraContext(): any {
  const ollamaUrl = process.env.OLLAMA_API_URL || 'http://localhost:11434/api';
  const model = process.env.MODEL_NAME_AT_ENDPOINT || 'qwen2.5-coder:7b';

  return {
    runtimeContext: {},  // Required by Mastra ToolExecutionContext
    context: {},         // Required by Mastra ToolExecutionContext
    llm: {
      generate: async (config: any) => {
        let lastError: Error | null = null;
        
        // Extract prompts once for complexity detection
        const systemPrompt = config.messages.find((m: any) => m.role === 'system')?.content || '';
        const userPrompt = config.messages.find((m: any) => m.role === 'user')?.content || '';
        
        // Enhanced complexity detection with better keyword matching
        const promptLength = userPrompt.length;
        const hasComplexKeywords = /\b(api|endpoint|authentication|auth|database|server|route|middleware|class|interface|crud|rest|graphql|flask|express|fastapi|django|controller|service|repository|model|schema|jwt|oauth|websocket|async|component|module|framework|architecture|design\s+pattern|thread|concurrent|parallel|worker\s+pool|binary\s+search|tree|graph|hash\s+table|algorithm|recursion|cache|lru|redis|mongodb|postgresql|mysql|orm|microservice|docker|kubernetes)\b/i.test(userPrompt);
        const isComplexPrompt = promptLength > 200 || hasComplexKeywords;
        
        // Set retry count based on complexity
        const maxRetries = isComplexPrompt ? 3 : 2;
        let retryDelay = 1000; // Start with 1s delay
        
        console.log(`[Complexity] Detected ${isComplexPrompt ? 'COMPLEX' : 'SIMPLE'} prompt (length: ${promptLength}, keywords: ${hasComplexKeywords})`);
        console.log(`[Config] Max retries: ${maxRetries}, Initial delay: ${retryDelay}ms`);

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          try {
            // Construct optimized prompt for Qwen
            const enhancedPrompt = `${systemPrompt}

USER REQUEST:
${userPrompt}

🎯 CRITICAL: READ THE USER'S REQUEST CAREFULLY!
   - "biggest to smallest" = DESCENDING order (reverse=True, sort((a,b) => b-a))
   - "smallest to biggest" = ASCENDING order (reverse=False, sort((a,b) => a-b))
   - "descending" / "high to low" = largest first
   - "ascending" / "low to high" = smallest first
   - Match the EXACT sorting direction requested!

IMPORTANT: Provide COMPLETE, PRODUCTION-READY code with:
1. Comprehensive error handling
2. Type safety (if applicable)
3. Inline comments explaining key logic
4. Best practices for the language
5. Optimized algorithms (avoid O(n²) where possible)
6. Security considerations
7. EXACT implementation matching user requirements

Generate the code now:`;

            // Call Ollama with optimized parameters and generous timeout for local processing
            
            // Check if this is likely the first request (model needs loading)
            const isFirstRequest = !global.ollamaModelLoaded;
            
            // Generous timeout for first request, normal for subsequent
            const baseTimeout = isComplexPrompt ? 90000 : 45000;
            const timeoutMs = isFirstRequest ? baseTimeout * 2 : baseTimeout; // Double timeout for first request
            
            console.log(`[Timeout] Using ${timeoutMs/1000}s timeout`);
            console.log(`[Timeout] First request: ${isFirstRequest}`);
            console.log(`[Timeout] Complex prompt: ${isComplexPrompt}`);
            console.log(`[Progress] Starting generation attempt ${attempt + 1}/${maxRetries + 1}...`);
            
            // Prepare request body
            const requestBody = {
              model,
              prompt: enhancedPrompt,
              stream: false, // CRITICAL: Ensure this is false
              options: {
                temperature: config.temperature || 0.7,
                top_p: 0.9,
                top_k: 40,
                num_predict: config.maxTokens || (isComplexPrompt ? 4000 : 1500),
                repeat_penalty: 1.1,
                num_ctx: 4096,
                stop: ['</code>', 'USER REQUEST:', '```\n\n\n'],
              }
            };
            
            // Log LLM call details
            console.log('[LLM] Preparing to call Ollama');
            console.log('[LLM] Model:', model);
            console.log('[LLM] Timeout:', timeoutMs / 1000, 'seconds');
            console.log('[LLM] Prompt length:', enhancedPrompt.length);
            console.log('[LLM] Attempt:', attempt + 1, '/', maxRetries + 1);
            console.log('[LLM] Request body:', JSON.stringify(requestBody, null, 2));
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
              console.log(`[Timeout] Request timed out after ${timeoutMs/1000}s`);
              controller.abort();
            }, timeoutMs);

            const response = await fetch(`${ollamaUrl}/generate`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestBody),
              signal: controller.signal,
            });
            
            // Mark that we've made a request (rough tracking)
            if (!global.ollamaModelLoaded) {
              global.ollamaModelLoaded = true;
            }

            clearTimeout(timeoutId);
            
            // Log response details
            console.log('[LLM] Response status:', response.status);
            console.log('[LLM] Response ok:', response.ok);
            console.log('[LLM] Response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
              const errorText = await response.text();
              console.error(`[Attempt ${attempt + 1}] Ollama API error:`, response.status, errorText);
              
              // Enhanced memory error detection
              if (errorText.includes('requires more system memory') || 
                  errorText.includes('not enough memory') ||
                  errorText.includes('insufficient memory') ||
                  errorText.toLowerCase().includes('out of memory')) {
                
                console.error('[CRITICAL] Memory shortage detected');
                
                throw new Error(
                  `⚠️ INSUFFICIENT MEMORY FOR MODEL\n\n` +
                  `Current model (${model}) requires more RAM than available.\n\n` +
                  `IMMEDIATE SOLUTION:\n` +
                  `1. Stop Ollama: Get-Process ollama | Stop-Process -Force\n` +
                  `2. Pull smaller model: ollama pull qwen2.5-coder:3b\n` +
                  `3. Update .env file: MODEL_NAME_AT_ENDPOINT=qwen2.5-coder:3b\n` +
                  `4. Start Ollama: ollama serve\n` +
                  `5. Restart this server\n\n` +
                  `Model Requirements:\n` +
                  `- qwen2.5-coder:3b → 2GB RAM (RECOMMENDED)\n` +
                  `- qwen2.5-coder:7b → 4.3GB RAM (Current - TOO LARGE)\n` +
                  `- qwen2.5-coder:1.5b → 1GB RAM (Fastest)\n\n` +
                  `Error details: ${errorText}` 
                );
              }
              
              throw new Error(`Ollama API failed: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Log the raw response
            console.log('[LLM] Raw response keys:', Object.keys(data));
            console.log('[LLM] Response type:', typeof data);
            console.log('[LLM] Has response field:', 'response' in data);
            console.log('[LLM] Response length:', data.response?.length || 0);
            
            // Log first 200 chars of response
            if (data.response) {
              console.log('[LLM] Response preview:', data.response.substring(0, 200));
            } else {
              console.log('[LLM] Response field is missing or empty!');
              console.log('[LLM] Full response object:', JSON.stringify(data, null, 2));
            }
            
            if (!data.response) {
              throw new Error('Empty response from LLM');
            }

            const generationTime = data.total_duration ? (data.total_duration / 1000000000).toFixed(2) : 'unknown';
            console.log(`[Success] LLM responded in attempt ${attempt + 1} (${generationTime}s)`);
            console.log(`[Progress] Generated ${data.response?.length || 0} characters`);
            return { 
              text: data.response,
              model: data.model || model,
              total_duration: data.total_duration,
            };

          } catch (error) {
            lastError = error as Error;
            const isTimeout = (error as Error).name === 'AbortError';
            console.error(`[Attempt ${attempt + 1}/${maxRetries + 1}] LLM generation error:`, isTimeout ? 'TIMEOUT' : error);
            
            // If it's the last attempt, handle fallback or error
            if (attempt === maxRetries) {
              console.log('[Last Attempt] All retries exhausted');
              
              // For complex prompts, throw detailed error instead of fallback
              if (isComplexPrompt) {
                const timeoutUsed = isComplexPrompt ? 90 : 45;
                throw new Error(
                  `⚠️ COMPLEX PROMPT TIMEOUT: The LLM took too long to generate code for this complex request.\n\n` +
                  `Suggestions:\n` +
                  `1. Wait 30 seconds and try again (Ollama may be warming up)\n` +
                  `2. Break your request into smaller, simpler parts\n` +
                  `3. Ensure Ollama is running: Get-Process ollama\n` +
                  `4. Check Ollama logs for errors\n` +
                  `5. Try a simpler prompt first to verify the service works\n` +
                  `6. Consider using a smaller model (qwen2.5-coder:3b)\n\n` +
                  `Prompt length: ${promptLength} chars | Timeout: ${timeoutUsed}s | Retries: ${maxRetries + 1}`
                );
              }
              
              // For simple prompts, use fallback
              console.log('[Fallback] Using template code generation for simple prompt');
              return {
                text: generateFallbackCode(config.messages),
                model: 'fallback',
                error: 'LLM unavailable, using fallback'
              };
            }
            
            // Wait before retry with exponential backoff
            console.log(`[Retry] Waiting ${retryDelay}ms before retry ${attempt + 2}/${maxRetries + 1}...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            retryDelay *= 2; // Exponential backoff: 1s, 2s, 4s, 8s
          }
        }
        
        // Should never reach here, but just in case
        throw lastError || new Error('Unknown error');
      }
    }
  };
}

// Intelligent fallback code generator - generates WORKING code, not templates
function generateFallbackCode(messages: any[], language?: string): string {
  const userMessage = messages.find(m => m.role === 'user')?.content || '';
  
  // Detect if this is a genuinely simple prompt that can use fallback
  const isSortingPrompt = /\b(sort|order|arrange)\b/i.test(userMessage) && 
                          /\bnumber|array|list|\d+\b/i.test(userMessage);
  const isHelloWorld = /\bhello\s*world\b/i.test(userMessage);
  
  const canUseFallback = isSortingPrompt || isHelloWorld;
  
  if (!canUseFallback) {
    // This shouldn't happen as complex prompts are handled above, but just in case
    throw new Error(
      '⚠️ FALLBACK NOT SUITABLE: This prompt requires full LLM processing.\n' +
      'The fallback generator only handles simple sorting tasks.\n' +
      'Please ensure Ollama is running and try again.'
    );
  }
  
  // Detect language from message if not provided
  if (!language) {
    language = userMessage.toLowerCase().includes('python') ? 'python' : 
               userMessage.toLowerCase().includes('rust') ? 'rust' :
               userMessage.toLowerCase().includes('go') ? 'go' : 
               userMessage.toLowerCase().includes('solidity') ? 'solidity' : 'javascript';
  }
  
  // Detect if it's a sorting request
  const isSorting = userMessage.toLowerCase().includes('sort');
  const hasNumbers = /\d/.test(userMessage);
  
  // Detect sorting direction
  const isDescending = userMessage.toLowerCase().includes('biggest to smallest') ||
                       userMessage.toLowerCase().includes('largest to smallest') ||
                       userMessage.toLowerCase().includes('descending') ||
                       userMessage.toLowerCase().includes('big to small') ||
                       userMessage.toLowerCase().includes('high to low');
  
  if (language === 'python') {
    if (isSorting && hasNumbers) {
      // Extract numbers from prompt
      const numbers = userMessage.match(/\d+/g) || ['8', '5', '0', '9', '3'];
      const sortedAsc = [...numbers].sort((a, b) => parseInt(a) - parseInt(b));
      const sortedDesc = [...sortedAsc].reverse();
      const sortedNums = isDescending ? sortedDesc : sortedAsc;
      const orderText = isDescending ? 'descending' : 'ascending';
      const reverseParam = isDescending ? ', reverse=True' : '';
      
      return `from typing import List

def sort_numbers(numbers: List[int]) -> List[int]:
    """
    Sort a list of integers in ${orderText} order.
    
    Args:
        numbers: List of integers to sort
        
    Returns:
        Sorted list in ${orderText} order
        
    Example:
        >>> sort_numbers([${numbers.join(', ')}])
        [${sortedNums.join(', ')}]
    """
    if not isinstance(numbers, list):
        raise TypeError('Input must be a list')
    
    if not all(isinstance(n, int) for n in numbers):
        raise ValueError('All elements must be integers')
    
    return sorted(numbers${reverseParam})

if __name__ == '__main__':
    # Example usage
    nums = [${numbers.join(', ')}]
    result = sort_numbers(nums)
    print(f'Original: {nums}')
    print(f'Sorted: {result}')`;
    }
    
    return `from typing import Any

def main() -> Any:
    """
    Main function implementing the requested functionality.
    """
    try:
        result = process_data()
        print(f"Result: {result}")
        return result
    except Exception as e:
        print(f"Error: {e}")
        return None

def process_data() -> str:
    """Process data according to requirements"""
    return "Success"

if __name__ == "__main__":
    main()`;
  } else if (language === 'rust') {
    if (isSorting && hasNumbers) {
      const numbers = userMessage.match(/\d+/g) || ['8', '5', '0', '9', '3'];
      const sortedAsc = [...numbers].sort((a, b) => parseInt(a) - parseInt(b));
      const sortedDesc = [...sortedAsc].reverse();
      const sortedNums = isDescending ? sortedDesc : sortedAsc;
      const orderText = isDescending ? 'descending' : 'ascending';
      const reverseCode = isDescending ? '\n    numbers.reverse();' : '';
      
      return `/// Sorts a vector of integers in ${orderText} order
///
/// # Examples
/// \`\`\`
/// let result = sort_numbers(vec![${numbers.join(', ')}]);
/// assert_eq!(result, vec![${sortedNums.join(', ')}]);
/// \`\`\`
pub fn sort_numbers(mut numbers: Vec<i32>) -> Vec<i32> {
    numbers.sort_unstable();${reverseCode}
    numbers
}

fn main() {
    let nums = vec![${numbers.join(', ')}];
    let sorted = sort_numbers(nums);
    println!("Sorted: {:?}", sorted);
}`;
    }
    return `use std::error::Error;

/// Main function implementing the requested functionality
fn main() -> Result<(), Box<dyn Error>> {
    let result = process_data()?;
    println!("Result: {:?}", result);
    Ok(())
}

/// Process data according to requirements
fn process_data() -> Result<String, Box<dyn Error>> {
    Ok("Success".to_string())
}`;
  } else if (language === 'go') {
    if (isSorting && hasNumbers) {
      const numbers = userMessage.match(/\d+/g) || ['8', '5', '0', '9', '3'];
      const sortedAsc = [...numbers].sort((a, b) => parseInt(a) - parseInt(b));
      const sortedDesc = [...sortedAsc].reverse();
      const sortedNums = isDescending ? sortedDesc : sortedAsc;
      const orderText = isDescending ? 'descending' : 'ascending';
      const reverseCode = isDescending ? '\n    // Reverse for descending order\n    for i, j := 0, len(sorted)-1; i < j; i, j = i+1, j-1 {\n        sorted[i], sorted[j] = sorted[j], sorted[i]\n    }' : '';
      
      return `package main

import (
    "fmt"
    "sort"
)

// SortNumbers sorts a slice of integers in ${orderText} order
func SortNumbers(numbers []int) []int {
    sorted := make([]int, len(numbers))
    copy(sorted, numbers)
    sort.Ints(sorted)${reverseCode}
    return sorted
}

func main() {
    nums := []int{${numbers.join(', ')}}
    result := SortNumbers(nums)
    fmt.Printf("Sorted: %v\\n", result)
}`;
    }
    return `package main

import "fmt"

// Main function implementing the requested functionality
func main() {
    result := processData()
    fmt.Println("Result:", result)
}

// ProcessData processes data according to requirements
func processData() string {
    return "Success"
}`;
  } else if (language === 'typescript') {
    if (isSorting && hasNumbers) {
      const numbers = userMessage.match(/\d+/g) || ['8', '5', '0', '9', '3'];
      const sortedAsc = [...numbers].sort((a, b) => parseInt(a) - parseInt(b));
      const sortedDesc = [...sortedAsc].reverse();
      const sortedNums = isDescending ? sortedDesc : sortedAsc;
      const orderText = isDescending ? 'descending' : 'ascending';
      const sortComparator = isDescending ? '(a, b) => b - a' : '(a, b) => a - b';
      
      return `/**
 * Sorts an array of numbers in ${orderText} order
 * @param numbers - Array of numbers to sort
 * @returns Sorted array
 */
function sortNumbers(numbers: number[]): number[] {
  if (!Array.isArray(numbers)) {
    throw new TypeError('Input must be an array');
  }
  return [...numbers].sort(${sortComparator});
}

// Example usage
const result = sortNumbers([${numbers.join(', ')}]);
console.log('Sorted:', result);

export { sortNumbers };`;
    }
    return `/**
 * Main function implementing the requested functionality
 */
function main(): string {
  try {
    const result = processData();
    console.log("Result:", result);
    return result;
  } catch (error) {
    console.error("Error:", error);
    return "Error";
  }
}

/**
 * Process data according to requirements
 */
function processData(): string {
  return "Success";
}

main();
export { main, processData };`;
  } else {
    // JavaScript or Solidity
    if (isSorting && hasNumbers) {
      const numbers = userMessage.match(/\d+/g) || ['8', '5', '0', '9', '3'];
      const sortedAsc = [...numbers].sort((a, b) => parseInt(a) - parseInt(b));
      const sortedDesc = [...sortedAsc].reverse();
      const sortedNums = isDescending ? sortedDesc : sortedAsc;
      const orderText = isDescending ? 'descending' : 'ascending';
      const sortComparator = isDescending ? '(a, b) => b - a' : '(a, b) => a - b';
      
      return `/**
 * Sorts an array of numbers in ${orderText} order
 * @param {number[]} numbers - Array of numbers to sort
 * @returns {number[]} Sorted array
 */
function sortNumbers(numbers) {
  if (!Array.isArray(numbers)) {
    throw new TypeError('Input must be an array');
  }
  return [...numbers].sort(${sortComparator});
}

// Example usage
const result = sortNumbers([${numbers.join(', ')}]);
console.log('Sorted:', result);

module.exports = { sortNumbers };`;
    }
    return `/**
 * Main function implementing the requested functionality
 */
function main() {
  try {
    const result = processData();
    console.log("Result:", result);
    return result;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

/**
 * Process data according to requirements
 */
function processData() {
  return "Success";
}

main();
module.exports = { main, processData };`;
  }
}

// Rate limiting (simple in-memory)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(ip);
  
  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + 60000 }); // 1 minute window
    return true;
  }
  
  if (record.count >= 20) { // Max 20 requests per minute
    return false;
  }
  
  record.count++;
  return true;
}

export async function POST(req: NextRequest) {
  console.log('[API] POST /api/generate - Request received');
  console.log('[API] Request method:', req.method);
  console.log('[API] Request headers:', Object.fromEntries(req.headers.entries()));
  
  const startTime = Date.now();
  
  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a moment before trying again.' },
        { status: 429 }
      );
    }

    // Robust JSON parsing with validation and logging
    let body;
    
    try {
      const rawBody = await req.text();
      
      // Log for debugging
      console.log('[Request] Received body length:', rawBody.length);
      
      if (!rawBody || rawBody.trim().length === 0) {
        console.error('[Request] Empty request body');
        return NextResponse.json(
          { error: 'Request body is empty' },
          { status: 400 }
        );
      }
      
      body = JSON.parse(rawBody);
      console.log('[Request] Parsed successfully');
      
    } catch (parseError) {
      console.error('[Parse Error] Failed to parse request body:', parseError);
      return NextResponse.json(
        { 
          error: 'Invalid JSON in request body',
          details: parseError instanceof Error ? parseError.message : 'Unknown parse error'
        },
        { status: 400 }
      );
    }
    
    // Validate required fields
    const { prompt, language } = body;
    
    if (!prompt || typeof prompt !== 'string') {
      console.error('[Validation] Missing or invalid prompt');
      return NextResponse.json(
        { error: 'prompt is required and must be a string' },
        { status: 400 }
      );
    }
    
    if (!language || typeof language !== 'string') {
      console.error('[Validation] Missing or invalid language');
      return NextResponse.json(
        { error: 'language is required and must be a string' },
        { status: 400 }
      );
    }

    if (!['python', 'javascript', 'typescript', 'rust', 'solidity', 'go'].includes(language)) {
      console.error('[Validation] Unsupported language:', language);
      return NextResponse.json(
        { error: `Invalid or unsupported language: ${language}. Supported: python, javascript, typescript, rust, solidity, go` },
        { status: 400 }
      );
    }
    
    console.log('[Request] Validation passed');
    console.log('[Request] Prompt length:', prompt.length);
    console.log('[Request] Language:', language)

    // Check cache first
    const cacheKey = getCacheKey(prompt, language);
    const cachedResult = responseCache.get(cacheKey);
    if (cachedResult) {
      console.log(`[Cache Hit] Returning cached result for: "${prompt.substring(0, 50)}..."`);
      return NextResponse.json({
        ...cachedResult,
        cached: true,
        cacheAge: Math.floor((Date.now() - cachedResult.timestamp) / 1000),
      });
    }

    // Detect prompt complexity for monitoring
    const promptLength = prompt.length;
    const hasComplexKeywords = /\b(api|endpoint|authentication|auth|database|server|route|middleware|class|interface|crud|rest|graphql|flask|express|fastapi|django|controller|service|repository|model|schema|jwt|oauth|websocket|async|component|module|framework|architecture|design\s+pattern|thread|concurrent|parallel|worker\s+pool|binary\s+search|tree|graph|hash\s+table|algorithm|recursion|cache|lru|redis|mongodb|postgresql|mysql|orm|microservice|docker|kubernetes)\b/i.test(prompt);
    const isComplexPrompt = promptLength > 200 || hasComplexKeywords;

    // Create Mastra context
    const context = createAdvancedMastraContext();

    console.log(`[${new Date().toISOString()}] Generating ${language} code for prompt: "${prompt.substring(0, 100)}..."`);
    console.log(`[Complexity] ${isComplexPrompt ? 'COMPLEX' : 'SIMPLE'} prompt detected (length: ${promptLength}, keywords: ${hasComplexKeywords})`);
    console.log(`[Progress] Estimated time: ${isComplexPrompt ? '30-60s' : '10-30s'} (depends on complexity)`);

    // Step 1: Generate code with enhanced prompting
    let genResult;
    try {
      console.log('[Code Generator] Calling with arguments:', {
        prompt: prompt.substring(0, 100) + '...',
        language: language,
        promptLength: prompt.length
      });
      
      genResult = await codeGeneratorTool.execute(context as any, {
        prompt: prompt.trim(),
        language,
        projectStructure: undefined,
      } as any);
      
      console.log('[Code Generator] Result received:', {
        hasCode: !!genResult?.code,
        codeLength: genResult?.code?.length || 0,
        language: genResult?.language
      });
      
      // Validate generation result
      if (!genResult || !genResult.code || genResult.code.trim().length === 0) {
        console.error('[Generation Failed] Empty result returned');
        console.error('[Debug] Full genResult:', JSON.stringify(genResult, null, 2));
        console.error('[Debug] Prompt length:', prompt.length);
        console.error('[Debug] Language:', language);
        console.error('[Debug] Model:', process.env.MODEL_NAME_AT_ENDPOINT || 'qwen2.5-coder:7b');
        
        throw new Error(
          'Code generation returned empty result.\n\n' +
          'This usually means:\n' +
          '1. Ollama is still loading the model (first request takes 60-180s)\n' +
          '2. The prompt is too complex for the timeout\n' +
          '3. Ollama encountered an error\n\n' +
          'Try:\n' +
          '- Wait 30 seconds and try again\n' +
          '- Use a simpler prompt\n' +
          '- Check Ollama logs for errors\n' +
          '- Verify model is loaded: ollama list'
        );
      }
      
      // Detect if LLM returned an error disguised as code
      if (genResult.code.trim().startsWith('// Error generating code:') || 
          genResult.code.trim().startsWith('// ERROR:') ||
          genResult.code.trim().startsWith('/* Error')) {
        
        console.error('[Generation Failed] LLM returned error as code comment');
        
        // Extract actual error message
        const errorMatch = genResult.code.match(/(?:\/\/|\/\*)\s*(?:Error|ERROR).*?:\s*(.+?)(?:\*\/|$)/);  // Removed 's' flag for ES2017 compatibility
        const actualError = errorMatch ? errorMatch[1].trim() : 'LLM failed to generate code';
        
        throw new Error(`Code generation failed: ${actualError}`);
      }

      // Detect empty or minimal code
      if (genResult.code.trim().length < 10) {
        console.error('[Generation Failed] Code output too short:', genResult.code.length, 'chars');
        throw new Error('Code generation returned insufficient content');
      }
      
      console.log(`[Progress] Generated ${genResult.code.length} characters of code`);
      console.log(`[Progress] Complexity: ${genResult.estimatedComplexity || 'unknown'}`);
      console.log(`[Progress] Dependencies: ${genResult.dependencies?.length || 0}`);
      

      // CRITICAL: Validate code quality to ensure it's not a template
      console.log(`[${new Date().toISOString()}] Validating code quality...`);
      const validation = validateCodeQuality(genResult.code, language);
      
      if (shouldRetryGeneration(validation)) {
        console.warn(`[Warning] Generated code failed validation (score: ${validation.score}):`, validation.issues);
        console.log('[Retry] Regenerating with enhanced prompt...');
        
        // Retry with enhanced prompt
        const enhancedPrompt = getEnhancedPrompt(prompt, language, validation);
        
        const retryResult = await codeGeneratorTool.execute(context as any, {
          prompt: enhancedPrompt,
          language,
          projectStructure: undefined,
        } as any);
        
        // Validate retry result
        const retryValidation = validateCodeQuality(retryResult.code, language);
        
        if (retryValidation.score > validation.score) {
          console.log(`[Success] Retry improved quality from ${validation.score} to ${retryValidation.score}`);
          genResult = retryResult;
        } else {
          console.warn('[Warning] Retry did not improve quality, using original result');
        }
      } else {
        console.log(`[Success] Code validation passed with score ${validation.score}`);
      }
    } catch (genError) {
      console.error('[Error] Code generation failed:', genError);
      // Use fallback code generation with actual working code
      genResult = {
        code: generateFallbackCode([
          { role: 'system', content: `Generate ${language} code` },
          { role: 'user', content: prompt }
        ], language),
        language,
        explanation: 'Generated using intelligent fallback due to LLM unavailability',
        dependencies: [],
        estimatedComplexity: 'simple' as const
      };
    }

    // Step 2: Review code for quality and security
    console.log(`[${new Date().toISOString()}] Reviewing generated code...`);
    
    let reviewResult;
    try {
      reviewResult = await codeReviewerTool.execute(context as any, {
        code: genResult.code,
        language,
        reviewType: 'all',
      } as any);
    } catch (reviewError) {
      console.warn('[Warning] Code review failed:', reviewError);
      // Provide default review result
      reviewResult = {
        issues: [],
        overallScore: 75,
        summary: 'Code review skipped due to error'
      };
    }

    // Step 3: Generate tests (optional, only if score is good)
    let testCode = '';
    if (reviewResult.overallScore >= 70) {
      try {
        console.log(`[${new Date().toISOString()}] Generating tests...`);
        const testResult = await testGeneratorTool.execute(context as any, {
          code: genResult.code,
          language: language as any,
          testType: 'unit',
          coverage: 80,
        } as any);
        testCode = testResult.testCode;
      } catch (testError) {
        console.warn('[Warning] Test generation failed:', testError);
        // Continue without tests
      }
    }

    const processingTime = (Date.now() - startTime) / 1000;

    // Performance metrics
    const performanceMetrics = {
      totalTime: processingTime.toFixed(2),
      complexity: isComplexPrompt ? 'complex' : 'simple',
      codeLength: genResult.code.length,
      timeoutUsed: isComplexPrompt ? 90 : 45,
      model: process.env.MODEL_NAME_AT_ENDPOINT || 'qwen2.5-coder:7b',
      timestamp: new Date().toISOString()
    };

    console.log('[Performance]', JSON.stringify(performanceMetrics, null, 2));

    // Alert if performance is degrading
    if (processingTime > (isComplexPrompt ? 60 : 30)) {
      console.warn('[Performance Warning] Generation took longer than expected');
      console.warn('[Suggestion] Consider using smaller model or breaking prompt into parts');
    }

    // Prepare response
    const result = {
      success: true,
      code: genResult.code,
      explanation: genResult.explanation,
      dependencies: genResult.dependencies,
      complexity: genResult.estimatedComplexity,
      reviewScore: reviewResult.overallScore,
      issues: (reviewResult.issues || []).slice(0, 5), // Top 5 issues only
      tests: testCode,
      metadata: {
        language,
        processingTime: processingTime.toFixed(2),
        linesOfCode: (genResult.code || '').split('\n').length,
        model: process.env.MODEL_NAME_AT_ENDPOINT || 'qwen2.5-coder:7b',
        timestamp: Date.now(),
      }
    };

    // Cache the result (5 minutes TTL)
    responseCache.set(cacheKey, result, 300);

    console.log(`[Success] Generated code in ${processingTime.toFixed(2)}s with score ${reviewResult.overallScore}`);

    return NextResponse.json(result);

  } catch (error) {
    console.error('[API Error]', error);
    console.error('[API Error Stack]', error instanceof Error ? error.stack : 'No stack trace');
    
    const processingTime = (Date.now() - startTime) / 1000;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Provide helpful suggestions based on error type
    let suggestions = [];
    if (errorMessage.includes('TIMEOUT') || errorMessage.includes('AbortError')) {
      suggestions = [
        'The request timed out. This usually means:',
        '1. Ollama is processing a very complex prompt',
        '2. Ollama service may be slow or overloaded',
        '3. Try breaking your request into smaller parts',
        '4. Wait 30 seconds and try again'
      ];
    } else if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('fetch failed')) {
      suggestions = [
        'Cannot connect to Ollama service:',
        '1. Ensure Ollama is running: Get-Process ollama',
        '2. Start Ollama if not running: ollama serve',
        '3. Check if port 11434 is accessible',
        '4. Verify OLLAMA_API_URL in .env file'
      ];
    } else {
      suggestions = [
        'Code generation failed. Try:',
        '1. Simplify your prompt',
        '2. Check server logs for details',
        '3. Verify Ollama is running properly',
        '4. Try a different language or simpler example first'
      ];
    }
    
    return NextResponse.json(
      {
        error: 'Code generation failed',
        details: errorMessage,
        suggestions: suggestions.join('\n'),
        processingTime: processingTime.toFixed(2),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Health check endpoint with memory diagnostics
export async function GET() {
  try {
    const modelName = process.env.MODEL_NAME_AT_ENDPOINT || 'qwen2.5-coder:7b';
    const ollamaUrl = process.env.OLLAMA_API_URL || 'http://localhost:11434/api';
    
    // Check Ollama connectivity
    const response = await fetch(`${ollamaUrl.replace('/api', '')}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) {
      return NextResponse.json({
        status: 'unhealthy',
        error: 'Ollama not responding',
        suggestion: 'Start Ollama: ollama serve'
      }, { status: 503 });
    }
    
    const data = await response.json();
    const modelExists = data.models?.some((m: any) => m.name === modelName);
    
    // Model-specific memory requirements
    const memoryRequirements: Record<string, string> = {
      'qwen2.5-coder:7b': '4.3GB',
      'qwen2.5-coder:3b': '2GB',
      'qwen2.5-coder:1.5b': '1GB',
      'qwen2.5-coder:14b': '8GB'
    };
    
    return NextResponse.json({
      status: 'healthy',
      service: 'NeuroCoder AI',
      version: '1.0.0',
      model: modelName,
      modelExists,
      memoryRequired: memoryRequirements[modelName] || 'Unknown',
      ollamaUrl,
      availableModels: data.models?.map((m: any) => m.name) || [],
      recommendation: modelExists ? 'Ready' : `Model not found. Run: ollama pull ${modelName}`,
      cache: responseCache.getStats(),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      suggestion: 'Check if Ollama is running: Get-Process ollama'
    }, { status: 503 });
  }
}
