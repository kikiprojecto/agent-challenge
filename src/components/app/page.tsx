"use client"

import { useState } from "react"
import Header from "@/components/header"
import Hero from "@/components/hero"
import ChatInterface from "@/components/chat-interface"
import Footer from "@/components/footer"

export default function Home() {
  const [showChat, setShowChat] = useState(false)

  return (
    <div className="min-h-screen bg-background grid-pattern">
      <Header />
      {!showChat ? (
        <Hero onStartCoding={() => setShowChat(true)} />
      ) : (
        <ChatInterface onBack={() => setShowChat(false)} />
      )}
      <Footer />
    </div>
  )
}
