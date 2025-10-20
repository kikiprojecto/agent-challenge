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

        {/* Scrollbar Test Box */}
        <div className="pt-8">
          <div className="max-w-md mx-auto p-4 border border-primary rounded-sm bg-card">
            <h3 className="text-sm font-semibold mb-2 text-primary">✨ Custom Scrollbar Test</h3>
            <div 
              className="h-32 overflow-y-auto bg-background/50 p-3 rounded text-xs"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(59, 130, 246, 0.6) transparent'
              }}
            >
              <p className="text-muted-foreground leading-relaxed">
                Scroll here to see the custom 4px ultra-slim circular scrollbar in action! 
                The scrollbar is electric blue and fully rounded. 
                Hover over it to see it brighten and expand slightly.
                This demonstrates the custom scrollbar styling applied throughout the application.
                Keep scrolling to see more...
                The scrollbar should be barely visible but functional.
                It matches the minimalist design of NeuroCoder AI.
                Production-ready and beautiful!
                Try hovering over the scrollbar to see the hover effect.
                The color will brighten and it will expand slightly for better visibility.
                This is the same scrollbar used in the code output and prompt areas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
