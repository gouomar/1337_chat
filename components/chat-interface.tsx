"use client"

import type React from "react"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useState, useRef, useEffect } from "react"
import { Send, Sparkles, Github, Terminal, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight } from "lucide-react"

// --- Background Slider Component ---

const images = [
  "https://placebostudio.ma/wp-content/uploads/2024/09/PBO08336-1024x683.jpg.webp", // Cyberpunk/Tech
  "https://pbs.twimg.com/media/G3ZzZcaXIAAG9_O?format=jpg&name=large", // Team working
  "https://pbs.twimg.com/media/G0GWLt_W0AAgAnU?format=jpg&name=large", // Code on screen
  "https://pbs.twimg.com/media/GfHXaswWsAAYPS0?format=jpg&name=large", // People working
]

const BackgroundSlider = () => {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length)
    }, 8000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 0.6, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2 }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${images[index]})` }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/70 to-black" />
    </div>
  )
}

// --- Inline Components for Preview Stability ---

const Logo1337 = () => (
  <div
    onClick={() => window.location.reload()}
    className="flex items-center gap-3 font-bold text-xl tracking-tighter cursor-pointer hover:opacity-80 transition-opacity"
  >
    <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 border border-white/20 backdrop-blur-md overflow-hidden group shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <Terminal className="h-5 w-5 text-white relative z-10" />
    </div>
    <div className="flex items-center gap-2">
      <span className="text-2xl font-medium bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
        <span className="text-primary font-bold">Ba3bou3</span>
      </span>
      <span className="text-white/30">•</span>
      <span className="text-sm text-white/60 font-medium tracking-wide">
        <span className="text-white/40">by</span>{" "}
        <span className="text-primary/80 hover:text-primary transition-colors">Omar_Gourragui</span>
        <span className="text-white/40"> & </span>
        <span className="text-primary/80 hover:text-primary transition-colors">Bazghoro</span>
      </span>
    </div>
  </div>
)

const GitHubLink = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-full">
        <MoreVertical className="h-5 w-5" />
        <span className="sr-only">GitHub Links</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="bg-black/80 border-white/10 backdrop-blur-xl text-white">
      <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white cursor-pointer">
        <a href="https://github.com/gouomar" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
          <Github className="h-4 w-4" />
          <span>gouomar</span>
        </a>
      </DropdownMenuItem>
      <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white cursor-pointer">
        <a href="https://github.com/mowardan" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
          <Github className="h-4 w-4" />
          <span>mowardan</span>
        </a>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
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

  const handleSend = async (message?: string | any) => {
    const messageText = typeof message === 'string' ? message : input
    if (!messageText.trim()) return

    // 1. Capture input and reset field immediately for better UX
    const currentMessage = messageText
    setInput("")

    // 2. Add User Message to UI
    const userMessage: Message = {
      id: Date.now().toString(),
      content: currentMessage,
      role: "user",
      timestamp: new Date(),
    }

    // Get PREVIOUS messages only (not including the current user message)
    // History should be the conversation BEFORE this new message
    const historyToSend = messages.slice(-10).map(msg => ({
      role: msg.role,
      content: msg.content
    }))
    
    // DEBUG: Log what we're sending - VERY VISIBLE
    console.log("==================================================");
    console.log("FRONTEND DEBUG - SENDING TO API");
    console.log("==================================================");
    console.log("Current message:", currentMessage);
    console.log("Messages state length:", messages.length);
    console.log("History to send:", JSON.stringify(historyToSend, null, 2));
    console.log("==================================================");
    
    setMessages((prev) => [...prev, userMessage])
    setIsTyping(true)

    try {
      // 3. Send to the Backend API with conversation history
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          message: currentMessage,
          history: historyToSend
        }),
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
    handleSend(prompt)
  }

  const suggestedPrompts = [
    "Explain the peer-learning methodology",
    "What are the rules for peer evaluations?",
    "Explain the Norminette coding standard",
    "What is the Black Hole system?",
    "How does the coalition system work?",
    "Explain memory management in C",
  ]

  return (
    <div className="relative h-screen flex flex-col overflow-hidden bg-black text-white font-sans selection:bg-primary/30">
      <div className="scanlines absolute inset-0 pointer-events-none z-50 opacity-10" />
      <BackgroundSlider />

      {/* Header */}
      <header className="relative z-20 border-b border-white/10 backdrop-blur-xl bg-black/20">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Logo1337 />
          <GitHubLink />
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto relative z-10 scrollbar-hide">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <AnimatePresence mode="wait">
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center"
              >
                <div className="mb-8 relative group cursor-default">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all duration-700" />
                  <Sparkles className="w-24 h-24 text-white/90 relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
                </div>

                <h1
                  onClick={() => window.location.reload()}
                  className="text-5xl md:text-7xl font-bold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-white/90 to-white/50 glitch cursor-pointer hover:scale-105 transition-transform duration-300"
                  data-text="Ba3bou3"
                >
                  Ba3bou3
                </h1>

                <p className="text-xl text-white/60 max-w-2xl mb-12 leading-relaxed font-light">
                  Open during lunch breaks. L'Ba3bou3 that works harder than the real one to debug your 1337 confusion.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl w-full px-4">
                  {suggestedPrompts.map((prompt, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handlePromptClick(prompt)}
                      className="group relative p-4 text-left bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Terminal className="w-5 h-5 text-primary/70 group-hover:text-primary transition-colors" />
                        <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors opacity-0 group-hover:opacity-100" />
                      </div>
                      <span className="text-sm text-white/80 group-hover:text-white font-medium">
                        {prompt}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-6 pb-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] md:max-w-[75%] rounded-3xl px-8 py-6 shadow-2xl backdrop-blur-xl ${message.role === "user"
                    ? "bg-primary text-primary-foreground ml-auto rounded-br-sm"
                    : "bg-white/10 border border-white/10 text-white rounded-bl-sm"
                    }`}
                >
                  <div className="prose prose-invert max-w-none text-base md:text-lg leading-relaxed">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        // Table components
                        table: ({ node, ...props }) => (
                          <div className="overflow-x-auto my-4 rounded-xl border border-white/10">
                            <table className="w-full border-collapse text-sm" {...props} />
                          </div>
                        ),
                        thead: ({ node, ...props }) => (
                          <thead className="bg-white/10 border-b border-white/10" {...props} />
                        ),
                        tbody: ({ node, ...props }) => (
                          <tbody className="divide-y divide-white/5" {...props} />
                        ),
                        tr: ({ node, ...props }) => (
                          <tr className="hover:bg-white/5 transition-colors" {...props} />
                        ),
                        th: ({ node, ...props }) => (
                          <th className="px-4 py-3 text-left font-semibold text-white/90 text-sm" {...props} />
                        ),
                        td: ({ node, ...props }) => (
                          <td className="px-4 py-3 text-white/70" {...props} />
                        ),
                        // Headers
                        h1: ({ node, ...props }) => (
                          <h1 className="text-2xl font-bold mb-4 text-white border-b border-white/10 pb-2" {...props} />
                        ),
                        h2: ({ node, ...props }) => (
                          <h2 className="text-xl font-bold mb-3 mt-6 text-white" {...props} />
                        ),
                        h3: ({ node, ...props }) => (
                          <h3 className="text-lg font-semibold mb-2 mt-4 text-white/90" {...props} />
                        ),
                        h4: ({ node, ...props }) => (
                          <h4 className="text-base font-semibold mb-2 mt-3 text-white/80" {...props} />
                        ),
                        // Lists
                        ul: ({ node, ...props }) => (
                          <ul className="list-disc list-inside space-y-1 mb-4 text-white/80" {...props} />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol className="list-decimal list-inside space-y-1 mb-4 text-white/80" {...props} />
                        ),
                        li: ({ node, ...props }) => (
                          <li className="text-white/80" {...props} />
                        ),
                        // Blockquote for summary boxes
                        blockquote: ({ node, ...props }) => (
                          <blockquote className="border-l-4 border-primary/50 bg-white/5 pl-4 py-2 my-4 rounded-r-lg italic text-white/80" {...props} />
                        ),
                        // Horizontal rule
                        hr: ({ node, ...props }) => (
                          <hr className="border-white/10 my-6" {...props} />
                        ),
                        // Strong/Bold
                        strong: ({ node, ...props }) => (
                          <strong className="font-semibold text-white" {...props} />
                        ),
                        // Code blocks
                        code: ({ node, className, children, ...props }) => {
                          const match = /language-(\w+)/.exec(className || '')
                          const isBlock = !!match || (String(children).includes('\n'));

                          if (isBlock) {
                            return (
                              <div className="rounded-xl overflow-hidden my-6 shadow-2xl border border-white/10 bg-[#1e1e2e]">
                                <div className="bg-[#181825] px-4 py-3 flex items-center gap-2 border-b border-white/5">
                                  <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                                    <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                                  </div>
                                  <span className="ml-4 text-xs text-white/40 font-mono uppercase tracking-wider">
                                    {match ? match[1] : 'code'}
                                  </span>
                                </div>
                                <SyntaxHighlighter
                                  {...props as any}
                                  style={dracula}
                                  language={match ? match[1] : 'text'}
                                  PreTag="div"
                                  customStyle={{
                                    margin: 0,
                                    padding: '1.5rem',
                                    background: 'transparent',
                                    fontSize: '0.9rem',
                                    lineHeight: '1.6',
                                  }}
                                >
                                  {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                              </div>
                            )
                          }

                          return (
                            <code className="font-mono text-sm px-2 py-1 rounded-md bg-white/10 text-primary-foreground/90 border border-white/10 mx-1" {...props}>
                              {children}
                            </code>
                          )
                        },
                        p: ({ node, ...props }) => <p className="mb-4 last:mb-0" {...props} />,
                        a: ({ node, ...props }) => <a className="text-blue-400 hover:underline" {...props} />,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                  <span className="text-xs text-white/30 mt-4 block font-medium tracking-wide">
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-white/5 border border-white/10 rounded-3xl rounded-bl-sm px-6 py-4 backdrop-blur-md">
                  <div className="flex gap-2">
                    <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="relative z-20 border-t border-white/10 backdrop-blur-2xl bg-black/40 pb-6 pt-4">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="relative group">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask anything about 1337..."
              className="pr-14 h-16 text-lg bg-white/5 border-white/10 backdrop-blur-xl focus:border-primary/50 focus:ring-primary/20 transition-all duration-300 rounded-2xl text-white placeholder:text-white/30 shadow-lg focus:shadow-[0_0_30px_-5px_rgba(var(--primary),0.3)]"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim()}
              size="icon"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:hover:bg-primary transition-all duration-300 rounded-xl shadow-lg hover:shadow-primary/25 hover:scale-105"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-xs text-white/30 text-center mt-4 font-light tracking-wider">
            Built by students for the 1337 struggle. Keep coding. Greatness awaits.
          </p>
        </div>
      </div>
    </div>
  )
}