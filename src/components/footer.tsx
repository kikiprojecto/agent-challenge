"use client"

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-lg mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <div className="flex items-center space-x-2">
            <span>Built for</span>
            <span className="text-purple-400 font-semibold">Nosana Agents 102 Challenge 2025</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-gray-500">Powered by</span>
            <span className="font-semibold text-white">Mastra</span>
            <span className="text-gray-500">+</span>
            <span className="font-semibold text-white">Decentralized AI</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-2"></div>
          </div>
        </div>
      </div>
    </footer>
  )
}
