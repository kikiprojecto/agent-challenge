"use client"

const stats = [
  { value: "6", label: "AI Tools" },
  { value: "24", label: "Patterns" },
  { value: "7", label: "Workflow Steps" },
]

export default function StatsDisplay() {
  return (
    <div className="flex justify-center gap-16 mt-20">
      {stats.map((stat, i) => (
        <div key={i} className="text-center">
          <div className="text-5xl font-bold text-white mb-2">{stat.value}</div>
          <div className="text-sm text-gray-400">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}
