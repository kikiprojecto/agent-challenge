"use client"

export default function Header() {
  return (
    <header className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/50">
              <span className="text-2xl">🧠</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                NeuroCoder AI
              </h1>
              <p className="text-xs text-gray-400">Powered by Decentralized AI</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href="https://github.com/kikiprojecto/agent-challenge"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm transition-all duration-300 hover:scale-105"
            >
              ⭐ GitHub
            </a>
            <div className="flex items-center space-x-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-xs">Nosana Ready</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
