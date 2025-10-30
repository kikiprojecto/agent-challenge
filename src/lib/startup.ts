/**
 * Server Startup Validation
 * Validates critical services before server starts
 */

import { validateOllamaConnection, logValidationResult } from './ollamaValidator';

export async function validateOnStartup(): Promise<void> {
  console.log('\n🚀 Starting NeuroCoder AI...\n');
  
  // Validate Ollama connection
  console.log('Validating Ollama connection...');
  const ollamaResult = await validateOllamaConnection();
  logValidationResult(ollamaResult);
  
  if (!ollamaResult.isConnected) {
    console.warn('⚠️  WARNING: Ollama is not connected!');
    console.warn('   Complex prompts will fail. Simple prompts will use fallback.');
    console.warn('   To fix: Update OLLAMA_API_URL in .env file\n');
  }
  
  // Validate environment variables
  console.log('Checking environment variables...');
  const requiredEnvVars = ['OLLAMA_API_URL', 'MODEL_NAME_AT_ENDPOINT'];
  const missingVars: string[] = [];
  
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length > 0) {
    console.warn('⚠️  Missing environment variables:');
    missingVars.forEach(varName => console.warn(`   - ${varName}`));
    console.warn('   Add these to your .env file\n');
  } else {
    console.log('✅ All environment variables configured\n');
  }
  
  // Summary
  console.log('=== STARTUP SUMMARY ===');
  console.log(`Ollama: ${ollamaResult.isConnected ? '✅ Connected' : '❌ Disconnected'}`);
  console.log(`Environment: ${missingVars.length === 0 ? '✅ Complete' : '⚠️  Incomplete'}`);
  console.log('=======================\n');
  
  if (ollamaResult.isConnected && missingVars.length === 0) {
    console.log('✅ All systems ready! Server starting...\n');
  } else {
    console.log('⚠️  Server starting with warnings. Some features may be limited.\n');
  }
}
