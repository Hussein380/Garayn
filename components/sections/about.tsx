"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

export default function About() {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
  const y = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [100, 0, 0, 100])

  return (
    <motion.section
      id="about"
      ref={sectionRef}
      style={{ opacity, y }}
      className="section-padding gradient-bg relative theme-transition"
    >
      <div className="container px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="space-y-6"
          >
            <div className="inline-block">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tighter gradient-text">About Garayn</h2>
              <div className="h-1 w-1/2 bg-gradient-to-r from-primary to-secondary mt-2"></div>
            </div>
            <p className="text-lg md:text-xl text-muted-foreground">
              At Garayn, we blend technical expertise with creative problem-solving to deliver digital solutions that
              drive real business results. Our mission is to empower organizations with custom technology that adapts to
              their unique challenges and goals, not the other way around.
            </p>
            <p className="text-lg md:text-xl text-muted-foreground">
              We believe in building long-term partnerships with our clients, focusing on solutions that scale with your
              business and provide lasting value.
            </p>
          </motion.div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-xl transform rotate-3"></div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative glass-effect rounded-3xl p-8 md:p-10 border border-white/10 theme-transition"
            >
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold">Our Approach</h3>
                <ul className="space-y-4">
                  {[
                    "User-centered design principles",
                    "Modern, scalable architecture",
                    "Agile development methodology",
                    "Continuous improvement mindset",
                  ].map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                      className="flex items-start"
                    >
                      <div className="mr-3 mt-1 h-6 w-6 rounded-full bg-gradient-to-r from-primary/30 to-secondary/30 flex items-center justify-center theme-transition">
                        <span className="text-xs font-bold">✓</span>
                      </div>
                      <span className="text-lg">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl theme-transition"></div>
      <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-secondary/5 rounded-full blur-3xl theme-transition"></div>
    </motion.section>
  )
}
