"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Code, Database, Workflow, Brain, LineChart } from "lucide-react"
import { motion } from "framer-motion"

export default function Services() {
  const services = [
    {
      title: "Full-Stack Development",
      description: "Custom websites and web applications built with modern frameworks like Next.js and React.",
      icon: <Code className="h-10 w-10 text-primary" />,
    },
    {
      title: "Backend & API Development",
      description: "Robust backend systems and APIs using Node.js, Express, and MongoDB.",
      icon: <Database className="h-10 w-10 text-primary" />,
    },
    {
      title: "Automation Workflows",
      description: "Streamline your business processes with custom automation using Zapier and n8n.",
      icon: <Workflow className="h-10 w-10 text-primary" />,
    },
    {
      title: "AI Integration",
      description: "Leverage the power of AI to enhance your applications with intelligent features.",
      icon: <Brain className="h-10 w-10 text-primary" />,
    },
    {
      title: "Technical Consulting",
      description: "Expert guidance on technology strategy, architecture, and implementation.",
      icon: <LineChart className="h-10 w-10 text-primary" />,
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <section id="services" className="section-padding relative theme-transition">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16 md:mb-20"
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-6 gradient-text">Our Services</h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            We offer a comprehensive range of technical services to help you build, scale, and optimize your digital
            presence.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10"
        >
          {services.map((service, i) => (
            <motion.div key={i} variants={cardVariants}>
              <Card className="gradient-border bg-card/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 h-full theme-transition">
                <CardHeader className="pb-2">
                  <div className="mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center theme-transition">
                    {service.icon}
                  </div>
                  <CardTitle className="text-2xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{service.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-1/4 left-10 w-40 h-40 bg-accent/5 rounded-full blur-3xl theme-transition"></div>
      <div className="absolute bottom-1/3 right-10 w-60 h-60 bg-primary/5 rounded-full blur-3xl theme-transition"></div>
    </section>
  )
}
