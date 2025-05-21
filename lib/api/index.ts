/**
 * API client for making requests to the backend
 * This file will be used to interact with your backend API once it's implemented
 */

/**
 * Base API client for making HTTP requests
 */
export async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `/api${endpoint}`

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    // Handle error responses
    const error = await response.json().catch(() => ({
      message: "An unknown error occurred",
    }))

    throw new Error(error.message || `API error: ${response.status}`)
  }

  // For 204 No Content responses
  if (response.status === 204) {
    return {} as T
  }

  return response.json()
}

/**
 * Example API functions that will be implemented when you add your backend
 */

// Example function for future implementation
export async function sendContactForm(data: {
  name: string
  email: string
  message: string
}) {
  return apiClient("/contact", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

// Example function for future implementation
export async function getChatbotResponse(message: string) {
  return apiClient<{ response: string }>("/chatbot", {
    method: "POST",
    body: JSON.stringify({ message }),
  })
}
