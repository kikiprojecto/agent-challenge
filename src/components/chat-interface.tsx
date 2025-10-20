"use client"

import { useState } from "react"
import LanguageSelector from "./language-selector"
import CodeOutput from "./code-output"

interface ChatInterfaceProps {
  onBack: () => void
}

export default function ChatInterface({ onBack }: ChatInterfaceProps) {
  const [prompt, setPrompt] = useState("")
  const [language, setLanguage] = useState("typescript")
  const [generatedCode, setGeneratedCode] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setGeneratedCode("")

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, language }),
      })

      if (!response.ok) throw new Error("Generation failed")

      const data = await response.json()
      setGeneratedCode(data.code || "")
    } catch (error) {
      console.error("Generation error:", error)
      setGeneratedCode("// Error generating code. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={onBack}
        className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 mb-8"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span>Back</span>
      </button>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Panel */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Language</h3>
            <LanguageSelector value={language} onChange={setLanguage} />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Prompt</h3>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to build..."
              className="w-full h-64 px-4 py-3 bg-gray-950 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-600 transition-all resize-none"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 text-white font-semibold rounded-lg transition-all disabled:cursor-not-allowed"
          >
            {isGenerating ? "Generating..." : "Generate Code"}
          </button>
        </div>

        {/* Output Panel */}
        <div>
          <CodeOutput
            code={generatedCode}
            language={language}
            isGenerating={isGenerating}
            onCopy={copyToClipboard}
          />
        </div>
      </div>
    </div>
  )
}
