"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { MoonIcon, SunIcon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Wait for component to mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setIsTransitioning(true)

    // Small delay to allow transition overlay to appear
    setTimeout(() => {
      setTheme(theme === "dark" ? "light" : "dark")

      // Remove transition overlay after theme has changed
      setTimeout(() => {
        setIsTransitioning(false)
      }, 500)
    }, 100)
  }

  if (!mounted) return null

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={toggleTheme}
        className="rounded-full border border-primary/20 bg-background/50 backdrop-blur-sm"
        aria-label="Toggle theme"
      >
        <AnimatePresence mode="wait" initial={false}>
          {theme === "dark" ? (
            <motion.div
              key="moon"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MoonIcon className="h-[1.2rem] w-[1.2rem] text-primary" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <SunIcon className="h-[1.2rem] w-[1.2rem] text-primary" />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>

      {/* Theme transition overlay */}
      <div className={`mode-transition-overlay ${isTransitioning ? "active" : ""}`}></div>
    </>
  )
}
