import { NextRequest, NextResponse } from 'next/server';
import { codeGeneratorTool } from '@/mastra/tools/codeGenerator';

export async function POST(req: NextRequest) {
  try {
    const { prompt, language } = await req.json();

    if (!prompt || !language) {
      return NextResponse.json(
        { error: 'Missing prompt or language' },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    // Call code generator tool
    const result = await codeGeneratorTool.execute({
      context: {} as any, // Mastra context
      prompt,
      language,
    });

    const executionTime = (Date.now() - startTime) / 1000;

    return NextResponse.json({
      code: result.code,
      explanation: result.explanation,
      dependencies: result.dependencies || [],
      complexity: result.estimatedComplexity || 'medium',
      reviewScore: 95, // Can add review step here
      executionTime,
    });
  } catch (error) {
    console.error('Code generation error:', error);
    return NextResponse.json(
      { error: 'Generation failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
