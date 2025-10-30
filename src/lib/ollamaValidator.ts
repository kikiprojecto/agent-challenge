/**
 * Ollama Connection Validator
 * Validates and tests the Ollama API endpoint on server startup
 */

export interface OllamaValidationResult {
  isConnected: boolean;
  endpoint: string;
  model: string;
  responseTime: number;
  error?: string;
  warnings: string[];
}

/**
 * Validates the Ollama connection
 */
export async function validateOllamaConnection(): Promise<OllamaValidationResult> {
  const endpoint = process.env.OLLAMA_API_URL || '';
  const model = process.env.MODEL_NAME_AT_ENDPOINT || 'qwen3:8b';
  const warnings: string[] = [];
  
  // Check if endpoint is configured
  if (!endpoint) {
    return {
      isConnected: false,
      endpoint: 'NOT_CONFIGURED',
      model,
      responseTime: 0,
      error: 'OLLAMA_API_URL environment variable is not set',
      warnings: ['Add OLLAMA_API_URL to your .env file']
    };
  }
  
  // Check if endpoint is a placeholder
  if (endpoint.includes('your-nosana-endpoint') || endpoint.includes('localhost')) {
    warnings.push('Endpoint appears to be a placeholder or localhost');
  }
  
  // Test connection
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${endpoint}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        prompt: 'test',
        stream: false,
      }),
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });
    
    const responseTime = Date.now() - startTime;
    
    if (!response.ok) {
      return {
        isConnected: false,
        endpoint,
        model,
        responseTime,
        error: `HTTP ${response.status}: ${response.statusText}`,
        warnings
      };
    }
    
    const data = await response.json();
    
    // Verify response structure
    if (!data.model || !data.response) {
      warnings.push('Unexpected response structure from Ollama');
    }
    
    // Check response time
    if (responseTime > 5000) {
      warnings.push(`Slow response time: ${responseTime}ms (expected < 5000ms)`);
    }
    
    return {
      isConnected: true,
      endpoint,
      model: data.model || model,
      responseTime,
      warnings
    };
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return {
      isConnected: false,
      endpoint,
      model,
      responseTime,
      error: error instanceof Error ? error.message : 'Unknown error',
      warnings
    };
  }
}

/**
 * Logs validation results to console
 */
export function logValidationResult(result: OllamaValidationResult): void {
  console.log('\n=== OLLAMA CONNECTION VALIDATION ===');
  console.log(`Endpoint: ${result.endpoint}`);
  console.log(`Model: ${result.model}`);
  
  if (result.isConnected) {
    console.log(`✅ Status: CONNECTED`);
    console.log(`⚡ Response Time: ${result.responseTime}ms`);
    
    if (result.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      result.warnings.forEach(warning => console.log(`   - ${warning}`));
    }
  } else {
    console.log(`❌ Status: DISCONNECTED`);
    console.log(`❌ Error: ${result.error}`);
    
    if (result.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      result.warnings.forEach(warning => console.log(`   - ${warning}`));
    }
    
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Check that OLLAMA_API_URL is set in .env file');
    console.log('   2. Verify the endpoint URL is correct');
    console.log('   3. Ensure the Ollama service is running');
    console.log('   4. Test connection with: npm run test:ollama');
  }
  
  console.log('=====================================\n');
}

/**
 * Validates connection with retry logic
 */
export async function validateWithRetry(maxRetries: number = 3): Promise<OllamaValidationResult> {
  let lastResult: OllamaValidationResult | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`[Attempt ${attempt}/${maxRetries}] Testing Ollama connection...`);
    
    lastResult = await validateOllamaConnection();
    
    if (lastResult.isConnected) {
      return lastResult;
    }
    
    if (attempt < maxRetries) {
      console.log(`   Failed. Retrying in ${attempt} second(s)...`);
      await new Promise(resolve => setTimeout(resolve, attempt * 1000));
    }
  }
  
  return lastResult!;
}

/**
 * Quick health check (for API endpoint)
 */
export async function quickHealthCheck(): Promise<boolean> {
  const endpoint = process.env.OLLAMA_API_URL;
  
  if (!endpoint) {
    return false;
  }
  
  try {
    const response = await fetch(`${endpoint}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.MODEL_NAME_AT_ENDPOINT || 'qwen3:8b',
        prompt: 'ping',
        stream: false,
      }),
      signal: AbortSignal.timeout(5000),
    });
    
    return response.ok;
  } catch {
    return false;
  }
}
