"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Sparkles, Github, Terminal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// --- Inline Components for Preview Stability ---

const Logo1337 = () => (
  <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
    <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <Terminal className="h-5 w-5 text-primary relative z-10" />
    </div>
    <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
      1337<span className="text-primary">AI</span>
    </span>
  </div>
)

const GitHubLink = () => (
  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground transition-colors">
    <Github className="h-5 w-5" />
    <span className="sr-only">GitHub</span>
  </Button>
)

// --- Main Chat Interface ---

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    // 1. Capture input and reset field immediately for better UX
    const currentMessage = input
    setInput("")
    
    // 2. Add User Message to UI
    const userMessage: Message = {
      id: Date.now().toString(),
      content: currentMessage,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsTyping(true)

    try {
      // 3. Send to the Backend API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: currentMessage }),
      })

      if (!response.ok) {
        throw new Error("Network response was not ok")
      }

      const data = await response.json()

      // 4. Create Assistant Message from API Data
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message, // The text from Gemini
        role: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Error fetching chat response:", error)
      
      // Optional: Add an error message so the user knows it failed
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I'm having trouble connecting to the server. Please try again. (Make sure your API key is set in .env.local)",
        role: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Helper to populate input when clicking suggested prompts
  const handlePromptClick = (prompt: string) => {
    setInput(prompt)
    // Optional: Auto-send when clicking a prompt?
    // handleSend() 
  }

  const suggestedPrompts = [
    "Tell me about 1337's peer-learning model",
    "What projects are in the common core?",
    "How do I prepare for my defense?",
    "Explain the 1337 network and community",
    "What's the application process like?",
    "Help me debug my C project",
  ]

  return (
    <div className="relative h-screen flex flex-col">
      {/* Header */}
      <header className="relative z-10 border-b border-border/50 backdrop-blur-xl bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo1337 />
            <div>
              <p className="text-sm text-muted-foreground hidden sm:block">
                Made by <span className="text-primary font-medium">Omar_Gourragui</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <GitHubLink />
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto relative">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
              <div className="mb-6 relative">
                <div className="absolute inset-0 animate-ping opacity-20">
                  <Sparkles className="w-16 h-16 text-primary mx-auto" />
                </div>
                <Sparkles className="w-16 h-16 text-primary relative z-10" />
              </div>
              <h2 className="text-3xl font-bold mb-4 glow-text">Your 1337 AI Companion</h2>
              <p className="text-muted-foreground max-w-md mb-8">
                Get instant answers about curriculum, projects, campus life, or explore what makes 1337 unique.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
                {suggestedPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handlePromptClick(prompt)}
                    className="px-4 py-3 text-sm text-left bg-card/30 hover:bg-card/50 border border-border/50 hover:border-primary/50 rounded-lg backdrop-blur-md transition-all duration-300 hover:scale-105 hover:glow-border"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-6 flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-4 duration-500`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-6 py-4 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] ${
                  message.role === "user"
                    ? "bg-primary/20 border border-primary/30 glow-border text-foreground ml-auto"
                    : "bg-card/50 border border-border/50 text-card-foreground"
                }`}
              >
                <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                <span className="text-xs text-muted-foreground mt-2 block">
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="mb-6 flex justify-start animate-in fade-in duration-300">
              <div className="bg-card/50 border border-border/50 rounded-2xl px-6 py-4 backdrop-blur-md">
                <div className="flex gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="relative z-10 border-t border-border/50 backdrop-blur-xl bg-background/80">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="relative group">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about curriculum, projects, campus life, or admission..."
              className="pr-12 h-14 text-base bg-secondary/50 border-border/50 backdrop-blur-md focus:border-primary/50 focus:ring-primary/30 transition-all duration-300 group-hover:glow-border"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim()}
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/90 disabled:opacity-50 transition-all duration-300 hover:glow-strong"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            Empowering 1337 students and future innovators
          </p>
        </div>
      </div>
    </div>
  )
}