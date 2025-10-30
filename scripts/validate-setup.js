#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('🔍 Validating NeuroCoder Setup...\n');

// Load .env file
const envPath = path.join(__dirname, '../.env');
let modelName = 'qwen2.5-coder:7b'; // default

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/MODEL_NAME_AT_ENDPOINT=(.+)/);
  if (match) modelName = match[1].trim();
}

console.log(`✓ Model configured: ${modelName}`);

// Check Ollama
const options = {
  hostname: 'localhost',
  port: 11434,
  path: '/api/tags',
  method: 'GET',
  timeout: 3000
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      const modelExists = parsed.models?.some(m => m.name === modelName);
      
      if (modelExists) {
        console.log('✓ Ollama is running');
        console.log(`✓ Model ${modelName} is available`);
        
        // Memory recommendations
        const memory = {
          'qwen2.5-coder:7b': { ram: '4.3GB', status: '⚠️  MAY FAIL - Needs 4.3GB' },
          'qwen2.5-coder:3b': { ram: '2GB', status: '✓ RECOMMENDED - Needs 2GB' },
          'qwen2.5-coder:1.5b': { ram: '1GB', status: '✓ FAST - Needs 1GB' }
        };
        
        const info = memory[modelName];
        if (info) {
          console.log(`\n📊 Memory: ${info.ram} required`);
          console.log(`${info.status}\n`);
        }
        
        if (modelName === 'qwen2.5-coder:7b') {
          console.log('⚠️  WARNING: 7b model may fail due to memory constraints!');
          console.log('💡 RECOMMENDED: Switch to 3b model for reliability\n');
          console.log('   1. ollama pull qwen2.5-coder:3b');
          console.log('   2. Update .env: MODEL_NAME_AT_ENDPOINT=qwen2.5-coder:3b\n');
        }
        
        console.log('✅ Setup validation complete!\n');
        process.exit(0);
        
      } else {
        console.log(`❌ Model ${modelName} not found`);
        console.log(`\n📥 Download model:\n   ollama pull ${modelName}\n`);
        process.exit(1);
      }
    } catch (e) {
      console.log('❌ Failed to parse Ollama response');
      process.exit(1);
    }
  });
});

req.on('error', () => {
  console.log('❌ Ollama is not running');
  console.log('\n🚀 Start Ollama:\n   ollama serve\n');
  process.exit(1);
});

req.on('timeout', () => {
  console.log('❌ Ollama connection timeout');
  process.exit(1);
});

req.end();
