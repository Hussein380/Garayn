"use client"

import Link from "next/link"
import Image from "next/image"
import { Twitter, Github, Linkedin, Mail } from "lucide-react"
import { motion } from "framer-motion"

export default function Footer() {
  return (
    <footer className="bg-background/50 backdrop-blur-md border-t border-primary/10 py-16 relative theme-transition">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <Link href="/" className="inline-block">
              <Image src="/images/logo.png" alt="Garayn Logo" width={120} height={35} className="h-10 w-auto" />
            </Link>
            <p className="text-muted-foreground max-w-xs">
              Custom websites, web apps, and intelligent automation tools for modern businesses.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-semibold gradient-text">Quick Links</h3>
            <nav className="flex flex-col space-y-3">
              {["About", "Services", "How It Works", "Contact"].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.2 + i * 0.1 }}
                >
                  <Link
                    href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-muted-foreground hover:text-primary transition-colors duration-300 relative group inline-block animated-underline"
                  >
                    {item}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-semibold gradient-text">Connect With Us</h3>
            <div className="flex space-x-5">
              {[
                { icon: <Twitter className="h-6 w-6" />, label: "Twitter", href: "https://twitter.com" },
                { icon: <Github className="h-6 w-6" />, label: "GitHub", href: "https://github.com" },
                { icon: <Linkedin className="h-6 w-6" />, label: "LinkedIn", href: "https://linkedin.com" },
              ].map((social, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
                >
                  <Link
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-card/50 backdrop-blur-sm border border-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all duration-300 theme-transition"
                  >
                    <span className="sr-only">{social.label}</span>
                    {social.icon}
                  </Link>
                </motion.div>
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="pt-2"
            >
              <Link
                href="mailto:contact@garayn.com"
                className="flex items-center text-muted-foreground hover:text-primary transition-colors duration-300 group"
              >
                <Mail className="h-5 w-5 mr-2 group-hover:text-primary transition-colors duration-300" />
                contact@garayn.com
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16 pt-8 border-t border-primary/10 flex flex-col md:flex-row justify-between items-center"
        >
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Garayn. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground mt-4 md:mt-0">
            Designed and built with <span className="text-accent">❤️</span> using Next.js and Tailwind CSS
          </p>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 w-full h-80 bg-gradient-to-t from-primary/5 to-transparent -z-10 theme-transition"></div>
    </footer>
  )
}
