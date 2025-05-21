"use client"

import { motion } from "framer-motion"
import { Zap, Clock, Lightbulb, TrendingUp } from "lucide-react"
import { useState } from "react"

export default function ValuePropositions() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const valueProps = [
    {
      title: "Faster Time to Market",
      description: "Launch your digital products in weeks, not months",
      icon: <Clock className="h-6 w-6 text-primary" />,
      stat: "60%",
      statText: "faster delivery",
    },
    {
      title: "Increased Efficiency",
      description: "Automate repetitive tasks and streamline workflows",
      icon: <Zap className="h-6 w-6 text-secondary" />,
      stat: "85%",
      statText: "reduction in manual work",
    },
    {
      title: "Innovative Solutions",
      description: "Cutting-edge technology tailored to your needs",
      icon: <Lightbulb className="h-6 w-6 text-accent" />,
      stat: "100%",
      statText: "custom built",
    },
    {
      title: "Business Growth",
      description: "Scale your operations with robust digital infrastructure",
      icon: <TrendingUp className="h-6 w-6 text-primary" />,
      stat: "3x",
      statText: "average ROI",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
      {valueProps.map((prop, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 + i * 0.1, duration: 0.5 }}
          className="value-prop-card"
          onMouseEnter={() => setHoveredIndex(i)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <div className="content">
            <div className="icon-container">{prop.icon}</div>
            <h3 className="text-lg font-semibold mb-2">{prop.title}</h3>
            <p className="text-sm text-muted-foreground">{prop.description}</p>

            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{
                opacity: hoveredIndex === i ? 1 : 0,
                height: hoveredIndex === i ? "auto" : 0,
              }}
              transition={{ duration: 0.3 }}
              className="mt-4 pt-4 border-t border-primary/10"
            >
              <div className="counter-value">{prop.stat}</div>
              <div className="text-sm text-muted-foreground">{prop.statText}</div>
            </motion.div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
