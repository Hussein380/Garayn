import { NextResponse } from "next/server"

/**
 * API route for handling chatbot interactions
 * This is a placeholder that you can implement when adding your AI backend
 */
export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json()
    const { message } = body

    // Validate the request data
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Here you would typically:
    // 1. Send the message to your AI service (OpenAI, etc.)
    // 2. Process the response
    // 3. Store the conversation history if needed

    // For now, we'll return a simple mock response
    const mockResponses: Record<string, string> = {
      pricing:
        "Our pricing is customized based on your specific project requirements. We'd be happy to provide a detailed quote after understanding your needs.",
      timeline:
        "Project timelines vary based on complexity and scope. Typically, our web development projects take 4-8 weeks from concept to launch.",
      contact:
        "You can reach our team directly at contact@garayn.com, or we can schedule a call with one of our consultants.",
    }

    // Simple keyword matching for demo purposes
    let response =
      "Thanks for your message! I'd be happy to help with that. Could you provide more details about your project?"

    const lowerMessage = message.toLowerCase()
    for (const [keyword, reply] of Object.entries(mockResponses)) {
      if (lowerMessage.includes(keyword)) {
        response = reply
        break
      }
    }

    return NextResponse.json({ response }, { status: 200 })
  } catch (error) {
    console.error("Error processing chatbot message:", error)
    return NextResponse.json({ error: "Failed to process chatbot message" }, { status: 500 })
  }
}
