"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Copy, Zap } from "lucide-react"
import CodeOutput from "@/components/code-output"
import LanguageSelector from "@/components/language-selector"

interface ChatInterfaceProps {
  onBack: () => void
}

export default function ChatInterface({ onBack }: ChatInterfaceProps) {
  const [language, setLanguage] = useState("python")
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [output, setOutput] = useState("")

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsLoading(true)
    setOutput("")

    try {
      // Call our Mastra backend API
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, language }),
      })

      if (!response.ok) {
        throw new Error("Generation failed")
      }

      const data = await response.json()
      setOutput(data.code || "// No code generated")
    } catch (error) {
      console.error("Generation error:", error)
      setOutput("// Error generating code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
  }

  return (
    <div className="relative min-h-[calc(100vh-80px)] pt-12 pb-12">
      <div className="max-w-6xl mx-auto px-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        {/* Main Chat Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="space-y-4">
            <div className="p-6 rounded-sm border border-border bg-card">
              <h2 className="text-lg font-semibold mb-4">Code Generator</h2>

              {/* Language Selector */}
              <LanguageSelector value={language} onChange={setLanguage} />

              {/* Prompt Textarea */}
              <div className="mt-6">
                <label className="block text-sm font-medium mb-2">Describe what you want to build</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., Create a function that generates fibonacci sequence..."
                  className="w-full h-40 p-4 rounded-sm bg-input border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(59, 130, 246, 0.5) transparent'
                  }}
                />
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={isLoading || !prompt.trim()}
                className="w-full mt-4 bg-primary hover:bg-primary/90 text-white font-semibold py-2 rounded-sm transition-all duration-200 glow-button"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin mr-2">⚙️</span>
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Generate Code
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Output Panel */}
          <div className="space-y-4">
            <div className="p-6 rounded-sm border border-border bg-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Generated Code</h2>
                {output && (
                  <Button
                    onClick={handleCopy}
                    size="sm"
                    variant="outline"
                    className="gap-2 bg-transparent border-border hover:bg-card"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </Button>
                )}
              </div>

              {output ? (
                <CodeOutput code={output} language={language} />
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <p>Your generated code will appear here</p>
                  </div>
                </div>
              )}
            </div>

            {/* Metrics Cards */}
            {output && (
              <div className="grid grid-cols-3 gap-3">
                <MetricCard label="Quality Score" value="98%" />
                <MetricCard label="Gen Time" value="2.1s" />
                <MetricCard label="Complexity" value="Low" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 rounded-sm border border-border bg-card text-center">
      <div className="text-2xl font-bold text-primary">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  )
}
