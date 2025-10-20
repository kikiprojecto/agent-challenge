"use client"

interface CodeOutputProps {
  code: string
  language: string
  isGenerating: boolean
  onCopy: () => void
}

export default function CodeOutput({ code, language, isGenerating, onCopy }: CodeOutputProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Generated Code</h3>
        {code && (
          <button
            onClick={onCopy}
            className="px-3 py-1.5 text-sm border border-gray-800 rounded hover:border-blue-600 text-gray-400 hover:text-white transition-all"
          >
            Copy
          </button>
        )}
      </div>

      <div className="bg-gray-950 border border-gray-800 rounded-lg p-4 min-h-[400px] font-mono text-sm overflow-auto">
        {isGenerating ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center space-y-4">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <div>Generating code...</div>
            </div>
          </div>
        ) : code ? (
          <pre className="text-gray-300 whitespace-pre-wrap">{code}</pre>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">→</div>
              <div>Your generated code will appear here</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
