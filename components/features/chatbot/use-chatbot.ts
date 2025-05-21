"use client"

import { useState } from "react"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
}

export function useChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "👋 Hi there! I'm the Garayn AI assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [isTyping, setIsTyping] = useState(false)

  const sendMessage = (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: "user",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])

    // Simulate bot typing
    setIsTyping(true)
    setTimeout(() => {
      // This would be replaced with an actual API call to your AI backend
      const botResponse = getBotResponse(content)
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

  return {
    messages,
    isTyping,
    sendMessage,
  }
}

// This would be replaced with an actual API call to your AI backend
function getBotResponse(message: string): string {
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
