"use client"

import { motion } from "framer-motion"

export default function AnimatedOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Orb 1 - Purple */}
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl"
      />

      {/* Orb 2 - Blue */}
      <motion.div
        animate={{
          x: [0, -100, 0],
          y: [0, 100, 0],
        }}
        transition={{
          duration: 25,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        className="absolute top-1/2 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"
      />

      {/* Orb 3 - Pink */}
      <motion.div
        animate={{
          x: [0, 50, 0],
          y: [0, -100, 0],
        }}
        transition={{
          duration: 22,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        className="absolute bottom-20 left-1/2 w-80 h-80 bg-accent/20 rounded-full blur-3xl"
      />
    </div>
  )
}
