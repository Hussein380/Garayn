"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// This will be replaced with data from your backend
const FEATURED_PROJECTS = [
  {
    id: "1",
    title: "E-Commerce Platform",
    description: "A modern e-commerce platform with advanced filtering, cart functionality, and secure checkout.",
    image: "/placeholder.svg?height=600&width=800",
    tags: ["Next.js", "MongoDB", "Stripe", "Tailwind CSS"],
    category: "Web Development",
    url: "/projects/e-commerce-platform",
    liveUrl: "https://example.com",
  },
  {
    id: "2",
    title: "Healthcare Dashboard",
    description: "An intuitive dashboard for healthcare professionals to monitor patient data and trends.",
    image: "/placeholder.svg?height=600&width=800",
    tags: ["React", "Node.js", "Chart.js", "Material UI"],
    category: "Dashboard",
    url: "/projects/healthcare-dashboard",
    liveUrl: "https://example.com",
  },
  {
    id: "3",
    title: "Workflow Automation",
    description: "Custom workflow automation solution that reduced manual processes by 85%.",
    image: "/placeholder.svg?height=600&width=800",
    tags: ["Node.js", "Express", "MongoDB", "React"],
    category: "Automation",
    url: "/projects/workflow-automation",
    liveUrl: "https://example.com",
  },
]

export default function ProjectsSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <section id="projects" className="section-padding relative theme-transition">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between mb-16"
        >
          <div className="max-w-2xl mb-6 md:mb-0">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter gradient-text mb-4">Our Projects</h2>
            <p className="text-lg text-muted-foreground">
              Explore our portfolio of successful projects that have helped businesses achieve their goals.
            </p>
          </div>
          <Link href="/projects">
            <Button variant="outline" className="group">
              View All Projects
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURED_PROJECTS.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="glass-effect rounded-xl overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 theme-transition">
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={project.image || "/placeholder.svg"}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* External link button - separate from the main card link */}
                  <motion.div
                    className="absolute bottom-4 right-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hoveredIndex === index ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-primary/90 hover:bg-primary text-white p-2 rounded-full inline-flex items-center justify-center"
                      onClick={(e) => e.stopPropagation()} // Prevent triggering the card click
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </motion.div>
                </div>

                <div className="p-6 flex-grow flex flex-col">
                  <div className="mb-2">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {project.category}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                  <p className="text-muted-foreground mb-4 flex-grow">{project.description}</p>

                  <div className="flex flex-wrap gap-2 mt-auto">
                    {project.tags.map((tag) => (
                      <span key={tag} className="text-xs px-2 py-1 rounded-full bg-secondary/10 text-secondary">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Make the entire card clickable with an overlay link */}
                <Link href={project.url} className="absolute inset-0 z-10 focus:outline-none">
                  <span className="sr-only">View {project.title} details</span>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-1/4 left-10 w-40 h-40 bg-accent/5 rounded-full blur-3xl theme-transition"></div>
      <div className="absolute bottom-1/3 right-10 w-60 h-60 bg-primary/5 rounded-full blur-3xl theme-transition"></div>
    </section>
  )
}
