"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import ValuePropositions from "@/components/sections/value-propositions"
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog"
import StartProjectForm from "@/components/start-project-form"

export default function Hero() {
  return (
    <section className="pt-32 pb-12 md:pt-56 md:pb-24 overflow-hidden relative">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-8 md:space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4 max-w-full sm:max-w-3xl px-2"
          >
            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-tight text-center">
              We Build Custom{' '}
              <span className="rotating-words inline-block align-middle whitespace-nowrap">
                <span className="text-primary">Websites</span>
                <span className="text-secondary">Applications</span>
                <span className="text-accent">Automations</span>
                <span style={{ wordBreak: 'break-word' }}>Solutions</span>
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-2xl text-muted-foreground mt-4 sm:mt-6">
              Fast, tailored solutions built around your goals.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-none justify-center"
          >
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" className="rounded-full px-6 text-base sm:px-8 sm:text-lg h-12 sm:h-14 group w-full sm:w-auto">
                  Start Your Project
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <StartProjectForm />
              </DialogContent>
            </Dialog>

            <Link href="/projects" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="rounded-full px-6 text-base sm:px-8 sm:text-lg h-12 sm:h-14 group w-full sm:w-auto">
                View Projects
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>

          <div className="relative w-full max-w-5xl mt-12 md:mt-20">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-3xl blur-xl"></div>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="relative glass-effect rounded-3xl p-8 md:p-12 border border-white/10"
            >
              <ValuePropositions />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-1/4 left-10 w-20 h-20 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-secondary/10 rounded-full blur-3xl"></div>
    </section>
  )
}
