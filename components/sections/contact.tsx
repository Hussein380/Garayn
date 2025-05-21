"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, Calendar, MessageSquare } from "lucide-react"
import { motion } from "framer-motion"

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      setFormData({ name: "", email: "", message: "" })

      // Reset success message after 5 seconds
      setTimeout(() => setIsSubmitted(false), 5000)
    }, 1500)
  }

  return (
    <section id="contact" className="section-padding relative theme-transition">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16 md:mb-20"
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-6 gradient-text">Get In Touch</h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            Ready to start your project? Reach out to us and let's discuss how we can help.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <Card className="gradient-border bg-card/50 backdrop-blur-sm shadow-lg h-full theme-transition">
              <CardHeader>
                <CardTitle className="text-2xl gradient-text">Contact Us</CardTitle>
                <CardDescription className="text-base">
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="rounded-lg bg-card/50 backdrop-blur-sm border-primary/20 focus:border-primary/50 theme-transition"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="rounded-lg bg-card/50 backdrop-blur-sm border-primary/20 focus:border-primary/50 theme-transition"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell us about your project..."
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="min-h-[120px] rounded-lg bg-card/50 backdrop-blur-sm border-primary/20 focus:border-primary/50 theme-transition"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full rounded-lg bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-300"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                    <Send className="ml-2 h-4 w-4" />
                  </Button>

                  {isSubmitted && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-green-500/20 backdrop-blur-sm text-green-500 dark:text-green-300 rounded-lg text-center theme-transition"
                    >
                      Thank you! Your message has been sent successfully.
                    </motion.div>
                  )}
                </form>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex flex-col gap-6"
          >
            <Card className="gradient-border bg-card/50 backdrop-blur-sm shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 theme-transition">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3 theme-transition">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  Schedule a Call
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Prefer to talk directly? Schedule a video call with our team to discuss your project in detail.
                </p>
                <Button
                  variant="outline"
                  className="w-full rounded-lg border-primary/20 hover:bg-primary/10 transition-all duration-300 theme-transition"
                  onClick={() => window.open('https://calendly.com/huznigarane/new-meeting', '_blank')}
                >
                  Book a Meeting
                </Button>
              </CardContent>
            </Card>

            <Card className="gradient-border bg-card/50 backdrop-blur-sm shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 theme-transition">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center mr-3 theme-transition">
                    <MessageSquare className="h-5 w-5 text-secondary" />
                  </div>
                  Quick Chat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Have a quick question? Reach out to us on WhatsApp for faster responses.
                </p>
                <Button
                  variant="outline"
                  className="w-full rounded-lg border-secondary/20 hover:bg-secondary/10 transition-all duration-300 theme-transition"
                  onClick={() => window.open('https://wa.me/254725996394?text=Hello%2C%20I%20would%20like%20to%20discuss%20a%20project.', '_blank')}
                >
                  Chat on WhatsApp
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-1/4 left-10 w-40 h-40 bg-accent/5 rounded-full blur-3xl theme-transition"></div>
      <div className="absolute bottom-1/3 right-10 w-60 h-60 bg-primary/5 rounded-full blur-3xl theme-transition"></div>
    </section>
  )
}
