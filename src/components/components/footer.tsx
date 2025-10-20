"use client"

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-border bg-background mt-20">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="text-sm text-muted-foreground">Built for Nosana Agents 102 Challenge</div>
          <div className="text-sm text-muted-foreground">
            Powered by <span className="text-primary font-semibold">Mastra</span> + Decentralized AI
          </div>
        </div>
      </div>
    </footer>
  )
}
