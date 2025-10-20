"use client"

interface HeroProps {
  onStartCoding: () => void
}

export default function Hero({ onStartCoding }: HeroProps) {
  return (
    <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center space-y-12 py-20">
        <div className="space-y-6 animate-fade-in">
          <div className="inline-block px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-300 text-sm mb-4">
            🏆 Nosana Agents 102 Challenge
          </div>
          <h2 className="text-6xl md:text-7xl font-bold text-white">
            Build Smarter with
            <span className="block mt-2 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-gradient">
              AI-Powered Coding
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Generate, review, test, and deploy production-ready code using{" "}
            <span className="text-purple-400 font-semibold">self-improving AI agents</span> on
            decentralized infrastructure
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-16 px-4">
          {[
            {
              icon: "🤖",
              title: "AI Code Generation",
              desc: "Natural language to production code in 6 languages",
              color: "purple",
            },
            {
              icon: "🔒",
              title: "Security Review",
              desc: "Automated vulnerability detection and fixes",
              color: "blue",
            },
            {
              icon: "⚡",
              title: "Real-time Execution",
              desc: "Test code in secure sandbox instantly",
              color: "pink",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="group relative p-8 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl transition-all duration-500 hover:bg-white/10 hover:border-purple-500/50 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer"
            >
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-500">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={onStartCoding}
          className="group mt-16 px-10 py-5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xl font-bold rounded-2xl shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/80 transition-all duration-300 hover:scale-110 transform relative overflow-hidden"
        >
          <span className="relative z-10 flex items-center space-x-2">
            <span>Start Coding Now</span>
            <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 mt-20">
          {[
            { value: "6", label: "AI Tools", icon: "🛠️" },
            { value: "24", label: "Code Patterns", icon: "📚" },
            { value: "7", label: "Workflow Steps", icon: "🔄" },
            { value: "100%", label: "Decentralized", icon: "🌐" },
          ].map((stat, i) => (
            <div
              key={i}
              className="text-center px-6 py-4 bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300"
            >
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-4xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes gradient {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </main>
  )
}
