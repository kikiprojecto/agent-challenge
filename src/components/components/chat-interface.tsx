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
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const sampleCode = {
      python: `def fibonacci(n):
    """Generate fibonacci sequence up to n terms"""
    a, b = 0, 1
    result = []
    for _ in range(n):
        result.append(a)
        a, b = b, a + b
    return result

# Example usage
print(fibonacci(10))`,
      javascript: `function fibonacci(n) {
  const result = [];
  let [a, b] = [0, 1];
  for (let i = 0; i < n; i++) {
    result.push(a);
    [a, b] = [b, a + b];
  }
  return result;
}

console.log(fibonacci(10));`,
      typescript: `function fibonacci(n: number): number[] {
  const result: number[] = [];
  let [a, b] = [0, 1];
  for (let i = 0; i < n; i++) {
    result.push(a);
    [a, b] = [b, a + b];
  }
  return result;
}

console.log(fibonacci(10));`,
      rust: `fn fibonacci(n: usize) -> Vec<u64> {
    let mut result = Vec::new();
    let mut a = 0u64;
    let mut b = 1u64;
    for _ in 0..n {
        result.push(a);
        let temp = a + b;
        a = b;
        b = temp;
    }
    result
}

fn main() {
    println!("{:?}", fibonacci(10));
}`,
      solidity: `pragma solidity ^0.8.0;

contract Fibonacci {
    function fibonacci(uint n) public pure returns (uint[] memory) {
        uint[] memory result = new uint[](n);
        uint a = 0;
        uint b = 1;
        for (uint i = 0; i < n; i++) {
            result[i] = a;
            uint temp = a + b;
            a = b;
            b = temp;
        }
        return result;
    }
}`,
      go: `package main

import "fmt"

func fibonacci(n int) []int {
    result := make([]int, n)
    a, b := 0, 1
    for i := 0; i < n; i++ {
        result[i] = a
        a, b = b, a+b
    }
    return result
}

func main() {
    fmt.Println(fibonacci(10))
}`,
    }

    setOutput(sampleCode[language as keyof typeof sampleCode] || "")
    setIsLoading(false)
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
