'use client';

import { useState } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setShowChat(true);
    
    // Simulate generation for now
    setTimeout(() => {
      setGeneratedCode(`// Generated ${language} code\n// Your NeuroCoder AI agent will generate this\n\nfunction example() {\n  console.log("Hello from NeuroCoder!");\n  return true;\n}`);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🧠</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  NeuroCoder AI
                </h1>
                <p className="text-xs text-gray-400">Self-Improving Code Agent</p>
              </div>
            </div>
            <a 
              href="https://github.com/kikiprojecto/agent-challenge" 
              target="_blank"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm transition-all duration-300 hover:scale-105"
            >
              ⭐ GitHub
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!showChat ? (
          // Hero Section
          <div className="text-center space-y-12 py-20">
            {/* Hero Title */}
            <div className="space-y-4">
              <h2 className="text-6xl font-bold text-white animate-fade-in">
                Build Smarter with
                <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  AI-Powered Coding
                </span>
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Generate, review, test, and deploy production-ready code using decentralized AI infrastructure
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-6 mt-16">
              {[
                { icon: '🤖', title: 'AI Code Generation', desc: 'Natural language to production code' },
                { icon: '🔒', title: 'Security Review', desc: 'Automated vulnerability detection' },
                { icon: '⚡', title: 'Real-time Execution', desc: 'Test code in secure sandbox' }
              ].map((feature, i) => (
                <div key={i} className="group p-6 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.desc}</p>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <button
              onClick={() => setShowChat(true)}
              className="mt-12 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-lg font-semibold rounded-xl shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 transition-all duration-300 hover:scale-105 transform"
            >
              Start Coding Now →
            </button>

            {/* Stats */}
            <div className="flex justify-center space-x-12 mt-16 text-center">
              <div>
                <div className="text-3xl font-bold text-white">6</div>
                <div className="text-sm text-gray-400">AI Tools</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">24</div>
                <div className="text-sm text-gray-400">Code Patterns</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">7</div>
                <div className="text-sm text-gray-400">Workflow Steps</div>
              </div>
            </div>
          </div>
        ) : (
          // Chat Interface
          <div className="space-y-6">
            {/* Back Button */}
            <button
              onClick={() => setShowChat(false)}
              className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2"
            >
              <span>←</span>
              <span>Back to Home</span>
            </button>

            {/* Main Chat Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Input Panel */}
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 space-y-4">
                <h3 className="text-xl font-bold text-white mb-4">💬 Describe Your Code</h3>
                
                {/* Language Selector */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                  >
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="rust">Rust</option>
                    <option value="solidity">Solidity</option>
                    <option value="go">Go</option>
                  </select>
                </div>

                {/* Prompt Textarea */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">What do you want to build?</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., Create a REST API with authentication using JWT tokens"
                    className="w-full h-48 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                  />
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt}
                  className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-[1.02] disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isGenerating ? (
                    <span className="flex items-center justify-center space-x-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Generating...</span>
                    </span>
                  ) : (
                    '✨ Generate Code'
                  )}
                </button>
              </div>

              {/* Output Panel */}
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">💻 Generated Code</h3>
                  {generatedCode && (
                    <button
                      onClick={() => navigator.clipboard.writeText(generatedCode)}
                      className="px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded text-sm text-white transition-colors"
                    >
                      📋 Copy
                    </button>
                  )}
                </div>

                {/* Code Display */}
                <div className="bg-black/50 border border-white/5 rounded-lg p-4 min-h-[400px] font-mono text-sm overflow-auto">
                  {generatedCode ? (
                    <pre className="text-green-400">{generatedCode}</pre>
                  ) : (
                    <div className="text-gray-500 flex items-center justify-center h-full">
                      {isGenerating ? (
                        <div className="text-center">
                          <div className="animate-pulse text-4xl mb-4">🧠</div>
                          <div>AI is thinking...</div>
                        </div>
                      ) : (
                        'Your generated code will appear here'
                      )}
                    </div>
                  )}
                </div>

                {/* Metrics */}
                {generatedCode && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-green-400">95</div>
                      <div className="text-xs text-gray-400">Quality Score</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-blue-400">2.3s</div>
                      <div className="text-xs text-gray-400">Gen Time</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-purple-400">Medium</div>
                      <div className="text-xs text-gray-400">Complexity</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-lg mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div>Built for <span className="text-purple-400 font-semibold">Nosana Agents 102 Challenge</span></div>
            <div className="flex items-center space-x-4">
              <span>Powered by Mastra + Decentralized AI</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
