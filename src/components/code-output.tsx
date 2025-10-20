"use client"

import { useEffect, useState } from "react"

interface CodeOutputProps {
  code: string
  language: string
}

export default function CodeOutput({ code, language }: CodeOutputProps) {
  const [highlighted, setHighlighted] = useState(code)

  useEffect(() => {
    // Simple syntax highlighting
    let result = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

    // Basic keyword highlighting
    const keywords = [
      "def",
      "function",
      "const",
      "let",
      "var",
      "return",
      "if",
      "else",
      "for",
      "while",
      "class",
      "import",
      "from",
      "pragma",
      "contract",
      "fn",
      "pub",
      "mut",
      "package",
      "main",
    ]

    keywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, "g")
      result = result.replace(regex, `<span class="text-primary font-semibold">${keyword}</span>`)
    })

    setHighlighted(result)
  }, [code])

  return (
    <div 
      className="bg-card border border-border rounded-sm p-4 overflow-auto max-h-64 font-mono text-sm"
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(59, 130, 246, 0.5) transparent'
      }}
    >
      <pre className="text-foreground" dangerouslySetInnerHTML={{ __html: highlighted }} />
    </div>
  )
}
