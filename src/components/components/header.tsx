"use client"

import { Github } from "lucide-react"

export default function Header() {
  return (
    <header className="relative z-50 border-b border-border bg-background">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
            </svg>
          </div>
          <span className="text-lg font-semibold text-foreground">NeuroCoder AI</span>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-sm border border-border text-xs font-medium text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            Production Ready
          </div>
          <a href="#" className="p-2 hover:bg-card transition-colors rounded-sm" aria-label="GitHub">
            <Github className="w-5 h-5 text-foreground" />
          </a>
        </div>
      </div>
    </header>
  )
}
