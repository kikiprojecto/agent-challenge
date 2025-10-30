import { NextResponse } from 'next/server';
import { quickHealthCheck } from '@/lib/ollamaValidator';

export async function GET() {
  const startTime = Date.now();
  
  // Check Ollama connection
  const ollamaHealthy = await quickHealthCheck();
  const responseTime = Date.now() - startTime;
  
  return NextResponse.json({
    status: ollamaHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    service: 'NeuroCoder AI',
    version: '1.0.0',
    ollama: {
      connected: ollamaHealthy,
      endpoint: process.env.OLLAMA_API_URL || 'NOT_CONFIGURED',
      model: process.env.MODEL_NAME_AT_ENDPOINT || 'qwen3:8b',
      responseTime: `${responseTime}ms`
    },
    uptime: process.uptime(),
  });
}
