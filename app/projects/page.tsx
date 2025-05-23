"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowLeft, ExternalLink, Filter, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import ParticleBackground from "@/components/particle-background"
import ProjectCard from "@/components/ProjectCard"

// Categories and technologies for filtering
const CATEGORIES = ["All", "Web Development", "Dashboard", "Automation", "Mobile App", "AI Integration"]
const TECHNOLOGIES = ["All", "Next.js", "React", "Node.js", "MongoDB", "Stripe", "Tailwind CSS", "Material UI", "Express", "Python", "OpenAI", "FastAPI"]
const YEARS = ["All", "2023", "2022", "2021"]

// This will be replaced with data from your backend
const ALL_PROJECTS = [
  {
    id: "1",
    title: "E-Commerce Platform",
    description: "A modern e-commerce platform with advanced filtering, cart functionality, and secure checkout.",
    image: "/placeholder.svg?height=600&width=800",
    tags: ["Next.js", "MongoDB", "Stripe", "Tailwind CSS"],
    category: "Web Development",
    url: "/projects/e-commerce-platform",
    client: "Fashion Retailer",
    year: "2023",
    isPaid: true,
    price: 299,
    previewFeatures: ["Source Code", "Documentation", "1 Month Support"],
    liveUrl: "https://example.com",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    id: "2",
    title: "Healthcare Dashboard",
    description: "An intuitive dashboard for healthcare professionals to monitor patient data and trends.",
    image: "/placeholder.svg?height=600&width=800",
    tags: ["React", "Node.js", "Chart.js", "Material UI"],
    category: "Dashboard",
    url: "/projects/healthcare-dashboard",
    client: "Medical Center",
    year: "2023",
    isPaid: false,
    liveUrl: "",
    videoUrl: "",
  },
  {
    id: "3",
    title: "Workflow Automation",
    description: "Custom workflow automation solution that reduced manual processes by 85%.",
    image: "/placeholder.svg?height=600&width=800",
    tags: ["Node.js", "Express", "MongoDB", "React"],
    category: "Automation",
    url: "/projects/workflow-automation",
    client: "Financial Services",
    year: "2022",
    isPaid: false,
    liveUrl: "",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    id: "4",
    title: "Mobile Fitness App",
    description: "A cross-platform fitness application with workout tracking and nutrition planning.",
    image: "/placeholder.svg?height=600&width=800",
    tags: ["React Native", "Firebase", "Redux", "Node.js"],
    category: "Mobile App",
    url: "/projects/mobile-fitness-app",
    client: "Fitness Brand",
    year: "2022",
    isPaid: true,
    price: 199,
    previewFeatures: ["Source Code", "Documentation", "Setup Guide"],
    liveUrl: "",
    videoUrl: "",
  },
  {
    id: "5",
    title: "Real Estate Platform",
    description: "Property listing and management platform with advanced search and filtering capabilities.",
    image: "/placeholder.svg?height=600&width=800",
    tags: ["Next.js", "PostgreSQL", "Google Maps API", "Tailwind CSS"],
    category: "Web Development",
    url: "/projects/real-estate-platform",
    client: "Property Management Company",
    year: "2023",
    isPaid: true,
    price: 399,
    previewFeatures: ["Source Code", "Documentation", "3 Months Support", "Customization Guide"],
    liveUrl: "",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    id: "6",
    title: "AI Content Generator",
    description: "AI-powered content generation tool for marketing teams to create engaging copy.",
    image: "/placeholder.svg?height=600&width=800",
    tags: ["Python", "OpenAI", "React", "FastAPI"],
    category: "AI Integration",
    url: "/projects/ai-content-generator",
    client: "Marketing Agency",
    year: "2023",
    isPaid: true,
    price: 249,
    previewFeatures: ["Source Code", "API Access", "Documentation", "1 Month Support"],
    liveUrl: "",
    videoUrl: "",
  },
]

// Add a filter for 'All' vs 'For Sale'
const SALE_FILTERS = ["All", "For Sale"];

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["All"])
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>(["All"])
  const [selectedYears, setSelectedYears] = useState<string[]>(["All"])
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [saleFilter, setSaleFilter] = useState("All");

  // Filter projects based on search and filters
  const filteredProjects = ALL_PROJECTS.filter((project) => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = selectedCategories.includes("All") || selectedCategories.includes(project.category)
    const matchesTechnology = selectedTechnologies.includes("All") ||
      project.tags.some(tag => selectedTechnologies.includes(tag))
    const matchesYear = selectedYears.includes("All") || selectedYears.includes(project.year)
    const matchesSale = saleFilter === "All" || (saleFilter === "For Sale" && project.isPaid);

    return matchesSearch && matchesCategory && matchesTechnology && matchesYear && matchesSale
  })

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : category === "All"
          ? ["All"]
          : prev.filter(c => c !== "All").concat(category)
    )
  }

  const handleTechnologyToggle = (technology: string) => {
    setSelectedTechnologies(prev =>
      prev.includes(technology)
        ? prev.filter(t => t !== technology)
        : technology === "All"
          ? ["All"]
          : prev.filter(t => t !== "All").concat(technology)
    )
  }

  const handleYearToggle = (year: string) => {
    setSelectedYears(prev =>
      prev.includes(year)
        ? prev.filter(y => y !== year)
        : year === "All"
          ? ["All"]
          : prev.filter(y => y !== "All").concat(year)
    )
  }

  return (
    <div className="min-h-screen relative theme-transition">
      <ParticleBackground />
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 relative overflow-hidden">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Link
              href="/"
              className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter gradient-text mb-6">
              Our Projects
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Explore our portfolio of successful projects that showcase our expertise in web development,
              automation, and digital transformation.
            </p>

            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        Category
                        {selectedCategories.length > 0 && selectedCategories[0] !== "All" && (
                          <span className="ml-1 rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">
                            {selectedCategories.length}
                          </span>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {CATEGORIES.map((category) => (
                        <DropdownMenuCheckboxItem
                          key={category}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => handleCategoryToggle(category)}
                        >
                          {category}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        Technology
                        {selectedTechnologies.length > 0 && selectedTechnologies[0] !== "All" && (
                          <span className="ml-1 rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">
                            {selectedTechnologies.length}
                          </span>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Filter by Technology</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {TECHNOLOGIES.map((technology) => (
                        <DropdownMenuCheckboxItem
                          key={technology}
                          checked={selectedTechnologies.includes(technology)}
                          onCheckedChange={() => handleTechnologyToggle(technology)}
                        >
                          {technology}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        Year
                        {selectedYears.length > 0 && selectedYears[0] !== "All" && (
                          <span className="ml-1 rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">
                            {selectedYears.length}
                          </span>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuLabel>Filter by Year</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {YEARS.map((year) => (
                        <DropdownMenuCheckboxItem
                          key={year}
                          checked={selectedYears.includes(year)}
                          onCheckedChange={() => handleYearToggle(year)}
                        >
                          {year}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Sale Filter */}
            <div className="flex justify-center gap-4 mb-6">
              {SALE_FILTERS.map((filter) => (
                <Button
                  key={filter}
                  variant={saleFilter === filter ? "default" : "outline"}
                  onClick={() => setSaleFilter(filter)}
                  className="rounded-full px-6"
                >
                  {filter}
                </Button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/4 left-10 w-40 h-40 bg-accent/5 rounded-full blur-3xl theme-transition"></div>
        <div className="absolute bottom-1/3 right-10 w-60 h-60 bg-primary/5 rounded-full blur-3xl theme-transition"></div>
      </section>

      {/* Projects Grid */}
      <section className="pb-16 md:pb-24">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">No projects found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters to find what you're looking for.
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
