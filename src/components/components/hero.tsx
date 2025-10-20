"use client"

import { Button } from "@/components/ui/button"
import FeatureCard from "@/components/feature-card"
import StatsDisplay from "@/components/stats-display"

interface HeroProps {
  onStartCoding: () => void
}

export default function Hero({ onStartCoding }: HeroProps) {
  return (
    <section className="relative min-h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
        {/* Subtitle Badge */}
        <div className="inline-block px-3 py-1 border border-border rounded-sm text-xs font-medium text-muted-foreground">
          Production-Ready AI Code Generation
        </div>

        {/* Main Title */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
          Build with AI-Powered Code
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Generate, review, and execute production-ready code instantly. Powered by decentralized AI infrastructure.
        </p>

        {/* CTA Button */}
        <div>
          <Button
            onClick={onStartCoding}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-base font-semibold rounded-sm glow-button"
          >
            Start Coding Now
            <span className="ml-2">→</span>
          </Button>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
          <FeatureCard title="Code Generation" description="AI-powered code generation for any language" icon="code" />
          <FeatureCard
            title="Security Review"
            description="Automatic security analysis and recommendations"
            icon="shield"
          />
          <FeatureCard title="Execution" description="Run and test code instantly" icon="play" />
        </div>

        {/* Stats */}
        <div className="pt-8">
          <StatsDisplay />
        </div>
      </div>
    </section>
  )
}
