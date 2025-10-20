"use client"

import { useState } from "react"
import Hero from "@/components/hero"
import ChatInterface from "@/components/chat-interface"

export default function Home() {
  const [showChat, setShowChat] = useState(false)

  return (
    <div className="min-h-screen bg-black">
      {!showChat ? (
        <Hero onStartCoding={() => setShowChat(true)} />
      ) : (
        <ChatInterface onBack={() => setShowChat(false)} />
      )}
    </div>
  )
}
