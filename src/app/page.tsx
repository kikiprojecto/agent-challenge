"use client"

import { useState } from "react"
import Header from "@/components/header"
import Hero from "@/components/hero"
import ChatInterface from "@/components/chat-interface"
import Footer from "@/components/footer"

export default function Home() {
  const [showChat, setShowChat] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

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
