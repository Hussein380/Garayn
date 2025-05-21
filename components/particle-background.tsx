"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

interface Particle {
  id: number
  x: number
  y: number
  size: number
  color: string
  duration: number
  delay: number
}

export default function ParticleBackground() {
  const [particles, setParticles] = useState<Particle[]>([])
  const { theme } = useTheme()

  useEffect(() => {
    // Colors that work well in both light and dark modes
    const getColors = () => {
      if (theme === "dark") {
        return [
          "rgba(147, 51, 234, 0.2)", // primary (purple)
          "rgba(0, 191, 255, 0.2)", // secondary (cyan)
          "rgba(255, 0, 128, 0.2)", // accent (pink)
        ]
      } else {
        return [
          "rgba(147, 51, 234, 0.1)", // primary (purple) - lighter for light mode
          "rgba(0, 191, 255, 0.1)", // secondary (cyan) - lighter for light mode
          "rgba(255, 0, 128, 0.1)", // accent (pink) - lighter for light mode
        ]
      }
    }

    const generateParticles = () => {
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight
      const particleCount = Math.floor((windowWidth * windowHeight) / 25000)
      const colors = getColors()

      const newParticles: Particle[] = []

      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 10 + 5,
          color: colors[Math.floor(Math.random() * colors.length)],
          duration: Math.random() * 20 + 15,
          delay: Math.random() * 5,
        })
      }

      setParticles(newParticles)
    }

    generateParticles()

    window.addEventListener("resize", generateParticles)
    return () => window.removeEventListener("resize", generateParticles)
  }, [theme])

  return (
    <div className="particles-container theme-transition">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle theme-transition"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
