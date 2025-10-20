"use client"

export default function StatsDisplay() {
  const stats = [
    { label: "AI Tools", value: "6" },
    { label: "Patterns", value: "24" },
    { label: "Workflow Steps", value: "7" },
  ]

  return (
    <div className="flex flex-wrap justify-center gap-12 sm:gap-16">
      {stats.map((stat) => (
        <div key={stat.label} className="text-center">
          <div className="text-3xl sm:text-4xl font-bold text-foreground">{stat.value}</div>
          <div className="text-sm text-muted-foreground mt-2">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}
