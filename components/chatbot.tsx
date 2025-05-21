"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, X, Send, Minimize2, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "👋 Hi there! I'm the Garayn AI assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInputValue("")

    // Simulate bot typing
    setIsTyping(true)
    setTimeout(() => {
      // This would be replaced with an actual API call to your AI backend
      const botResponse = getBotResponse(inputValue)
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botResponse,
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])
      setIsTyping(false)
    }, 1500)
  }

  // This would be replaced with an actual API call to your AI backend
  const getBotResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase()

    if (lowerMessage.includes("pricing") || lowerMessage.includes("cost") || lowerMessage.includes("price")) {
      return "Our pricing is customized based on your specific project requirements. We'd be happy to provide a detailed quote after understanding your needs. Would you like to schedule a consultation call?"
    }

    if (lowerMessage.includes("timeline") || lowerMessage.includes("how long") || lowerMessage.includes("duration")) {
      return "Project timelines vary based on complexity and scope. Typically, our web development projects take 4-8 weeks from concept to launch, while more complex applications may take 8-12 weeks or more. Would you like to discuss your specific project timeline?"
    }

    if (lowerMessage.includes("contact") || lowerMessage.includes("talk to") || lowerMessage.includes("human")) {
      return "I'd be happy to connect you with our team. You can reach us directly at contact@garayn.com, or I can help schedule a call with one of our consultants. What would you prefer?"
    }

    return "Thanks for your message! I'd be happy to help with that. Could you provide a bit more detail about your project or question so I can give you the most relevant information?"
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  const toggleChat = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setIsMinimized(false)
    }
  }

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? "auto" : "500px",
            }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className={`fixed bottom-24 right-6 w-[350px] md:w-[400px] rounded-2xl shadow-xl z-50 overflow-hidden glass-effect border border-primary/20 flex flex-col ${
              isMinimized ? "h-auto" : "h-[500px]"
            }`}
          >
            {/* Chat header */}
            <div className="p-4 border-b border-primary/10 flex items-center justify-between bg-primary/5">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-3">
                  <AvatarImage src="/placeholder.svg" alt="Garayn AI" />
                  <AvatarFallback className="bg-primary/20 text-primary">GA</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">Garayn AI Assistant</h3>
                  <p className="text-xs text-muted-foreground">Ask me anything about our services</p>
                </div>
              </div>
              <div className="flex items-center">
                <Button variant="ghost" size="icon" onClick={toggleMinimize} className="h-8 w-8 mr-1">
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={toggleChat} className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Chat messages */}
                <div className="flex-grow p-4 overflow-y-auto">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl p-3 ${
                            message.sender === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-card/50 border border-primary/10"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1 text-right">
                            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="max-w-[80%] rounded-2xl p-3 bg-card/50 border border-primary/10">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce"></div>
                            <div
                              className="w-2 h-2 rounded-full bg-primary/50 animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                            <div
                              className="w-2 h-2 rounded-full bg-primary/50 animate-bounce"
                              style={{ animationDelay: "0.4s" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Chat input */}
                <div className="p-4 border-t border-primary/10 bg-card/30">
                  <div className="flex items-center">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-grow mr-2"
                    />
                    <Button onClick={handleSendMessage} size="icon" disabled={!inputValue.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2 text-center">
                    Powered by Garayn AI • Not a replacement for human assistance
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat button */}
      <motion.button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary flex items-center justify-center text-white shadow-lg hover:bg-primary/90 transition-all z-50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <MessageSquare className="h-6 w-6" />
      </motion.button>
    </>
  )
}
