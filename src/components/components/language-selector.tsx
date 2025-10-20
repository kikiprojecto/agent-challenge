"use client"

interface LanguageSelectorProps {
  value: string
  onChange: (language: string) => void
}

export default function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  const languages = [
    { id: "python", label: "Python" },
    { id: "javascript", label: "JavaScript" },
    { id: "typescript", label: "TypeScript" },
    { id: "rust", label: "Rust" },
    { id: "solidity", label: "Solidity" },
    { id: "go", label: "Go" },
  ]

  return (
    <div>
      <label className="block text-sm font-medium mb-3">Language</label>
      <div className="grid grid-cols-3 gap-2">
        {languages.map((lang) => (
          <button
            key={lang.id}
            onClick={() => onChange(lang.id)}
            className={`py-2 px-3 rounded-sm font-medium text-sm transition-all duration-200 ${
              value === lang.id
                ? "bg-primary text-white"
                : "bg-card border border-border text-muted-foreground hover:border-primary/50"
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>
    </div>
  )
}
