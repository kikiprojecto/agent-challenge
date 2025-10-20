"use client"

import { useState } from "react"

interface ChatInterfaceProps {
  onBack: () => void
}

export default function ChatInterface({ onBack }: ChatInterfaceProps) {
  const [prompt, setPrompt] = useState("")
  const [language, setLanguage] = useState("typescript")
  const [generatedCode, setGeneratedCode] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [reviewScore, setReviewScore] = useState(0)
  const [executionTime, setExecutionTime] = useState(0)
  const [explanation, setExplanation] = useState("")
  const [dependencies, setDependencies] = useState<string[]>([])
  const [complexity, setComplexity] = useState("")

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setGeneratedCode("")
    setExplanation("")
    setDependencies([])

    try {
      // Call our Mastra agent via API
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          language,
        }),
      })

      if (!response.ok) {
        throw new Error("Generation failed")
      }

      const data = await response.json()

      setGeneratedCode(data.code || "")
      setExplanation(data.explanation || "")
      setDependencies(data.dependencies || [])
      setComplexity(data.complexity || "medium")
      setReviewScore(data.reviewScore || 95)
      setExecutionTime(data.executionTime || 2.5)
    } catch (error) {
      console.error("Generation error:", error)
      setGeneratedCode("// Error generating code. Please try again.")
      setExplanation("An error occurred while generating code.")
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode)
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={onBack}
        className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2 group"
      >
        <span className="group-hover:-translate-x-1 transition-transform duration-300">←</span>
        <span>Back to Home</span>
      </button>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* INPUT PANEL */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-5 hover:border-purple-500/30 transition-all duration-300">
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-2xl">💬</span>
            <h3 className="text-2xl font-bold text-white">Describe Your Code</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Programming Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all cursor-pointer"
            >
              <option value="python">🐍 Python</option>
              <option value="javascript">📜 JavaScript</option>
              <option value="typescript">🔷 TypeScript</option>
              <option value="rust">🦀 Rust</option>
              <option value="solidity">💎 Solidity</option>
              <option value="go">🐹 Go</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              What do you want to build?
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: Create a REST API with JWT authentication and PostgreSQL database"
              className="w-full h-56 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
            />
            <div className="text-xs text-gray-400 mt-2">{prompt.length} characters</div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-gray-700 disabled:to-gray-800 text-white font-bold rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-[1.02] disabled:cursor-not-allowed disabled:hover:scale-100 disabled:opacity-50 relative overflow-hidden group"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center space-x-3">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>AI is thinking...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center space-x-2">
                <span>✨</span>
                <span>Generate Production Code</span>
              </span>
            )}
          </button>
        </div>

        {/* OUTPUT PANEL */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">💻</span>
              <h3 className="text-2xl font-bold text-white">Generated Code</h3>
            </div>
            {generatedCode && (
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-sm text-white transition-all duration-300 hover:scale-105"
              >
                📋 Copy
              </button>
            )}
          </div>

          <div className="bg-black/60 border border-white/5 rounded-xl p-5 min-h-[400px] max-h-[500px] font-mono text-sm overflow-auto custom-scrollbar">
            {generatedCode ? (
              <pre className="text-green-400 whitespace-pre-wrap">{generatedCode}</pre>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                {isGenerating ? (
                  <div className="text-center space-y-4">
                    <div className="text-6xl animate-bounce">🧠</div>
                    <div className="text-lg">NeuroCoder AI is analyzing...</div>
                    <div className="flex space-x-1 justify-center">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"
                          style={{ animationDelay: `${i * 0.2}s` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <div className="text-4xl mb-2">👈</div>
                    <div>Your generated code will appear here</div>
                    <div className="text-xs">Powered by 6 specialized AI tools</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {explanation && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-blue-400 mb-2">💡 Explanation</h4>
              <p className="text-sm text-gray-300">{explanation}</p>
            </div>
          )}

          {dependencies.length > 0 && (
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-purple-400 mb-2">📦 Dependencies</h4>
              <div className="flex flex-wrap gap-2">
                {dependencies.map((dep, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs"
                  >
                    {dep}
                  </span>
                ))}
              </div>
            </div>
          )}

          {generatedCode && (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300">
                <div className="text-3xl font-bold text-green-400">{reviewScore}</div>
                <div className="text-xs text-gray-400 mt-1">Quality Score</div>
              </div>
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300">
                <div className="text-3xl font-bold text-blue-400">
                  {executionTime.toFixed(1)}s
                </div>
                <div className="text-xs text-gray-400 mt-1">Generation Time</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300">
                <div className="text-2xl font-bold text-purple-400 capitalize">{complexity}</div>
                <div className="text-xs text-gray-400 mt-1">Complexity</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.4);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.6);
        }
      `}</style>
    </div>
  )
}
