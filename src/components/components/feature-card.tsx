"use client"

interface FeatureCardProps {
  icon: "code" | "shield" | "play"
  title: string
  description: string
}

function IconComponent({ icon }: { icon: "code" | "shield" | "play" }) {
  switch (icon) {
    case "code":
      return (
        <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      )
    case "shield":
      return (
        <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      )
    case "play":
      return (
        <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      )
  }
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="p-6 rounded-sm border border-border hover:border-primary/50 transition-colors duration-200">
      <div className="mb-4">
        <IconComponent icon={icon} />
      </div>
      <h3 className="text-base font-semibold mb-2 text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
