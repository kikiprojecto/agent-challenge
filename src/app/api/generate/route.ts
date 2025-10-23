import { NextRequest, NextResponse } from 'next/server';
import { codeGeneratorTool } from '@/mastra/tools/codeGenerator';
import { codeReviewerTool } from '@/mastra/tools/codeReviewer';

// Helper to create Mastra-compatible LLM context
function createLLMContext() {
  return {
    llm: {
      generate: async (config: any) => {
        try {
          const ollamaUrl = process.env.OLLAMA_API_URL || 'https://3yt39qx97wc9hqwwmylrphi4jsxrngjzxnjakkybnxbw.node.k8s.prd.nos.ci/api';
          const model = process.env.MODEL_NAME_AT_ENDPOINT || 'qwen3:8b';
          
          // Format messages for Ollama
          const prompt = config.messages.map((m: any) => m.content).join('\n\n');
          
          const response = await fetch(`${ollamaUrl}/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model,
              prompt,
              stream: false,
            }),
          });

          if (!response.ok) {
            throw new Error(`Ollama API error: ${response.statusText}`);
          }

          const data = await response.json();
          return { text: data.response || '' };
        } catch (error) {
          console.error('LLM generation error:', error);
          throw error;
        }
      }
    }
  };
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, language } = await req.json();

    if (!prompt || !language) {
      return NextResponse.json(
        { error: 'Missing prompt or language' },
        { status: 400 }
      );
    }

    const llmContext = createLLMContext();

    // Generate code
    console.log('Generating code...');
    // @ts-ignore - Bypassing Mastra's complex type system for direct tool invocation
    const genResult = await codeGeneratorTool.execute({
      context: llmContext,
      prompt,
      language,
    });

    // Review code
    console.log('Reviewing code...');
    // @ts-ignore - Bypassing Mastra's complex type system for direct tool invocation
    const reviewResult = await codeReviewerTool.execute({
      context: llmContext,
      code: genResult.code,
      language,
      reviewType: 'all',
    });

    return NextResponse.json({
      success: true,
      code: genResult.code,
      explanation: genResult.explanation,
      dependencies: genResult.dependencies,
      complexity: genResult.estimatedComplexity,
      reviewScore: reviewResult.overallScore,
      issues: reviewResult.issues.slice(0, 5), // Top 5 issues
    });

  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      {
        error: 'Generation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
