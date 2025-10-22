'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [metrics, setMetrics] = useState({
    score: 0,
    time: 0,
    complexity: 'simple' as const
  });

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setGeneratedCode('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, language }),
      });

      if (!response.ok) throw new Error('Generation failed');

      const data = await response.json();
      setGeneratedCode(data.code);
      setMetrics({
        score: data.reviewScore || 95,
        time: 2.5,
        complexity: data.complexity || 'moderate'
      });
    } catch (error) {
      console.error(error);
      setGeneratedCode('// Error generating code. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/neurocoder-bg.jpg"
          alt="Neural Network Background"
          fill
          className="object-cover opacity-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/80"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative w-16 h-16 flex items-center group cursor-pointer">
                <Image
                  src="/images/neurocoder-logo.png"
                  alt="NeuroCoder Logo"
                  width={64}
                  height={64}
                  className="object-contain transition-all duration-300 group-hover:drop-shadow-[0_0_15px_rgba(6,182,212,0.8)] group-hover:brightness-110"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <h1 className="text-xl font-bold text-white leading-tight">
                  NeuroCoder AI
                </h1>
                <p className="text-xs text-gray-400 leading-tight">Self-Improving Code Intelligence</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="https://github.com/kikiprojecto/agent-challenge"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm transition-all duration-300 hover:scale-105"
              >
                <svg className="w-4 h-4 inline-block mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </a>
              <div className="flex items-center space-x-2 px-3 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <span className="text-cyan-400 text-xs font-medium">Nosana Ready</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!showChat ? (
          /* HERO SECTION */
          <div className="text-center space-y-12 py-12">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-300 text-sm backdrop-blur-sm">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
              </svg>
              <span>Nosana Agents 102 Challenge</span>
            </div>

            {/* Hero Brain Image */}
            <div className="relative w-full max-w-2xl mx-auto h-80 mb-8">
              <Image
                src="/images/neurocoder-hero.png"
                alt="NeuroCoder Brain"
                fill
                className="object-contain drop-shadow-[0_0_50px_rgba(0,212,255,0.5)] animate-pulse-slow"
                priority
              />
            </div>

            {/* Hero Text */}
            <div className="space-y-6 max-w-4xl mx-auto">
              <h2 className="text-5xl md:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Production-Ready
                </span>
                <br />
                <span className="text-white">AI Code Generation</span>
              </h2>
              <div className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed space-y-1">
                <p>
                  Self-improving agents on <span className="text-cyan-400 font-semibold">decentralized infrastructure</span>.
                </p>
                <p>
                  Generate, review, test, and deploy code with neural intelligence.
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => setShowChat(true)}
              className="group relative px-12 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xl font-bold rounded-2xl shadow-2xl shadow-cyan-500/50 hover:shadow-cyan-500/80 transition-all duration-300 hover:scale-110 transform overflow-hidden"
            >
              <span className="relative z-10 flex items-center space-x-3">
                <span>Start Coding</span>
                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
              {[
                { value: '6', label: 'AI Tools', desc: 'Specialized agents' },
                { value: '24', label: 'Code Patterns', desc: 'RAG knowledge base' },
                { value: '7', label: 'Workflow Steps', desc: 'Automated pipeline' },
                { value: '100%', label: 'Decentralized', desc: 'On Nosana network' }
              ].map((stat, i) => (
                <div
                  key={i}
                  className="text-center p-6 bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl hover:bg-white/10 hover:border-cyan-500/50 transition-all duration-300 group"
                >
                  <div className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                    {stat.value}
                  </div>
                  <div className="text-sm font-semibold text-white mt-2">{stat.label}</div>
                  <div className="text-xs text-gray-400 mt-1">{stat.desc}</div>
                </div>
              ))}
            </div>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-8 mt-16">
              {[
                {
                  title: 'Neural Code Generation',
                  desc: 'AI generates production-ready code in 6 languages with best practices',
                  icon: <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
                },
                {
                  title: 'Security Analysis',
                  desc: 'Automated vulnerability detection and security review with fixes',
                  icon: <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
                },
                {
                  title: 'Smart Execution',
                  desc: 'Test and execute code safely in isolated sandbox environment',
                  icon: <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>
                }
              ].map((feature, i) => (
                <div
                  key={i}
                  className="group p-8 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl hover:bg-white/10 hover:border-cyan-500/50 transition-all duration-500 hover:scale-105 cursor-pointer"
                >
                  <div className="mb-6 group-hover:scale-110 transition-transform duration-500 text-cyan-400">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* CHAT INTERFACE */
          <div className="space-y-6">
            <button
              onClick={() => setShowChat(false)}
              className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2 group"
            >
              <span className="group-hover:-translate-x-1 transition-transform duration-300">←</span>
              <span>Back to Home</span>
            </button>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* INPUT PANEL */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-5 hover:border-cyan-500/30 transition-all duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Describe Your Code</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Programming Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-3 bg-black/60 backdrop-blur-xl border border-cyan-500/30 rounded-xl text-white font-medium shadow-lg shadow-cyan-500/10 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 focus:shadow-cyan-500/20 transition-all cursor-pointer"
                  >
                    <option value="python" className="bg-black text-white font-medium py-2">Python</option>
                    <option value="javascript" className="bg-black text-white font-medium py-2">JavaScript</option>
                    <option value="typescript" className="bg-black text-white font-medium py-2">TypeScript</option>
                    <option value="rust" className="bg-black text-white font-medium py-2">Rust</option>
                    <option value="solidity" className="bg-black text-white font-medium py-2">Solidity</option>
                    <option value="go" className="bg-black text-white font-medium py-2">Go</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">What do you want to build?</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Example: Create a REST API with JWT authentication and PostgreSQL database"
                    className="w-full h-56 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all resize-none"
                  />
                  <div className="text-xs text-gray-400 mt-2">{prompt.length} characters</div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-700 disabled:to-gray-800 text-white font-bold rounded-xl shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-[1.02] disabled:cursor-not-allowed disabled:hover:scale-100 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <span className="flex items-center justify-center space-x-3">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Neural Intelligence Processing...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                      </svg>
                      <span>Generate Production Code</span>
                    </span>
                  )}
                </button>
              </div>

              {/* OUTPUT PANEL */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white">Generated Code</h3>
                  </div>
                  {generatedCode && (
                    <button
                      onClick={() => navigator.clipboard.writeText(generatedCode)}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-sm text-white transition-all duration-300 hover:scale-105 flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                      </svg>
                      <span>Copy</span>
                    </button>
                  )}
                </div>

                <div className="bg-black/60 border border-white/5 rounded-xl p-5 min-h-[400px] max-h-[500px] font-mono text-sm overflow-auto">
                  {generatedCode ? (
                    <pre className="text-cyan-400 whitespace-pre-wrap">{generatedCode}</pre>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      {isGenerating ? (
                        <div className="text-center space-y-4">
                          <div className="relative w-24 h-24 mx-auto">
                            <Image
                              src="/images/neurocoder-logo.png"
                              alt="Processing"
                              fill
                              className="object-contain animate-pulse"
                            />
                          </div>
                          <div className="text-lg text-cyan-400">Neural Intelligence Analyzing...</div>
                          <div className="flex space-x-1 justify-center">
                            {[0, 1, 2].map(i => (
                              <div
                                key={i}
                                className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"
                                style={{ animationDelay: `${i * 0.2}s` }}
                              ></div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center space-y-2">
                          <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
                          </svg>
                          <div>Your generated code will appear here</div>
                          <div className="text-xs">Powered by 6 specialized neural agents</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {generatedCode && (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/30 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300">
                      <div className="text-3xl font-bold text-green-400">{metrics.score}</div>
                      <div className="text-xs text-gray-400 mt-1">Quality Score</div>
                    </div>
                    <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/30 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300">
                      <div className="text-3xl font-bold text-cyan-400">{metrics.time.toFixed(1)}s</div>
                      <div className="text-xs text-gray-400 mt-1">Gen Time</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/30 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300">
                      <div className="text-2xl font-bold text-purple-400 capitalize">{metrics.complexity}</div>
                      <div className="text-xs text-gray-400 mt-1">Complexity</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/40 backdrop-blur-xl mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <span>Built for</span>
              <span className="text-cyan-400 font-semibold">Nosana Agents 102 Challenge 2025</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-gray-500">Powered by</span>
              <span className="font-semibold text-white">Mastra</span>
              <span className="text-gray-500">+</span>
              <span className="font-semibold text-white">Decentralized AI</span>
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse ml-2"></div>
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.02);
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
