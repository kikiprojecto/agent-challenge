"use client"

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="p-8 border border-gray-800 rounded-lg hover:border-blue-600 transition-all duration-200 hover:shadow-lg hover:shadow-blue-600/20">
      <div className="text-blue-600 mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  )
}
