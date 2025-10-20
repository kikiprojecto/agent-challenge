"use client"

interface HeroProps {
  onStartCoding: () => void
}

export default function Hero({ onStartCoding }: HeroProps) {
  return (
    <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center space-y-16">
        {/* CTA Button */}
        <button
          onClick={onStartCoding}
          className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-all duration-200"
        >
          <span>Start Coding Now</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          {[
            {
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              ),
              title: "Code Generation",
              desc: "AI-powered code generation for any language",
            },
            {
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              ),
              title: "Security Review",
              desc: "Automatic security analysis and recommendations",
            },
            {
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              title: "Execution",
              desc: "Run and test code instantly",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="p-8 border border-gray-800 rounded-lg hover:border-blue-600 transition-all duration-200 hover:shadow-lg hover:shadow-blue-600/20"
            >
              <div className="text-blue-600 mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-16 mt-20">
          {[
            { value: "6", label: "AI Tools" },
            { value: "24", label: "Patterns" },
            { value: "7", label: "Workflow Steps" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-5xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Footer Text */}
        <div className="mt-20 pt-8 border-t border-gray-800">
          <p className="text-sm text-gray-400">
            Built for Nosana Agents 102 Challenge
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Powered by <span className="text-blue-600 font-semibold">Mastra</span> + Decentralized AI
          </p>
        </div>
      </div>
    </main>
  )
}
