"use client"

interface LanguageSelectorProps {
  value: string
  onChange: (value: string) => void
}

const languages = [
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "rust", label: "Rust" },
  { value: "solidity", label: "Solidity" },
  { value: "go", label: "Go" },
]

export default function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {languages.map((lang) => (
        <button
          key={lang.value}
          onClick={() => onChange(lang.value)}
          className={`px-4 py-2 rounded border text-sm font-medium transition-all ${
            value === lang.value
              ? "bg-blue-600 border-blue-600 text-white"
              : "border-gray-800 text-gray-400 hover:border-blue-600 hover:text-white"
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  )
}
