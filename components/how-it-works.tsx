"use client"

import { CheckCircle2, MessageSquare, Code2, HeartHandshake } from "lucide-react"
import { motion } from "framer-motion"

export default function HowItWorks() {
  const steps = [
    {
      title: "Share your idea",
      description:
        "Tell us about your project, goals, and requirements. We'll discuss your vision and how we can help bring it to life.",
      icon: <MessageSquare className="h-10 w-10 text-primary" />,
    },
    {
      title: "We design & build",
      description:
        "Our team creates a tailored solution using modern technologies and best practices, keeping you involved throughout the process.",
      icon: <Code2 className="h-10 w-10 text-primary" />,
    },
    {
      title: "You get the solution",
      description:
        "We deliver a polished, tested product that meets your requirements and is ready to drive results for your business.",
      icon: <CheckCircle2 className="h-10 w-10 text-primary" />,
    },
    {
      title: "Ongoing support",
      description:
        "Our relationship doesn't end at launch. We provide continued support, maintenance, and improvements as your needs evolve.",
      icon: <HeartHandshake className="h-10 w-10 text-primary" />,
    },
  ]

  return (
    <section id="how-it-works" className="section-padding gradient-bg relative theme-transition">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16 md:mb-20"
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-6 gradient-text">How It Works</h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            Our streamlined process ensures a smooth journey from concept to completion.
          </p>
        </motion.div>

        <div className="relative">
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/30 via-secondary/30 to-accent/30 -translate-x-1/2 theme-transition"></div>

          <div className="space-y-20 md:space-y-0 relative">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.1 }}
                className={`md:flex items-start ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} gap-8 md:mb-32`}
              >
                <div className={`flex-1 ${i % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                  <div className="glass-effect rounded-xl p-8 border border-white/10 shadow-lg hover:shadow-primary/10 transition-all duration-300 theme-transition">
                    <h3 className="text-2xl font-semibold mb-4 gradient-text">{step.title}</h3>
                    <p className="text-lg text-muted-foreground">{step.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-center mt-8 md:mt-0">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-full blur-md theme-transition"></div>
                    <div className="relative z-10 h-20 w-20 hexagon bg-card/50 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-lg theme-transition">
                      {step.icon}
                    </div>
                  </div>
                </div>

                <div className="flex-1 hidden md:block"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl theme-transition"></div>
      <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-secondary/5 rounded-full blur-3xl theme-transition"></div>
    </section>
  )
}
