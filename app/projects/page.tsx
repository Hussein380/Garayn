import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import ProjectFilters from "@/components/project-filters"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import ParticleBackground from "@/components/particle-background"

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
  },
]

export const metadata = {
  title: "Projects | Garayn",
  description: "Explore our portfolio of successful projects that have helped businesses achieve their goals.",
}

export default function ProjectsPage() {
  return (
    <div className="min-h-screen relative theme-transition">
      <ParticleBackground />
      <Navbar />

      <main className="pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
            <div>
              <Link
                href="/"
                className="inline-flex items-center text-muted-foreground hover:text-primary mb-4 transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tighter gradient-text">Our Projects</h1>
              <p className="text-xl text-muted-foreground mt-4 max-w-2xl">
                Explore our portfolio of successful projects that showcase our expertise in web development, automation,
                and digital transformation.
              </p>
            </div>
          </div>

          <ProjectFilters />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {ALL_PROJECTS.map((project) => (
              <Link key={project.id} href={project.url} className="group">
                <div className="glass-effect rounded-xl overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 theme-transition">
                  <div className="relative h-56 overflow-hidden">
                    <Image
                      src={project.image || "/placeholder.svg"}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  <div className="p-6 flex-grow flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        {project.category}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{project.year}</span>
                    </div>
                    <h2 className="text-xl font-bold mb-2">{project.title}</h2>
                    <p className="text-muted-foreground mb-4 flex-grow">{project.description}</p>

                    <div className="mt-auto">
                      <div className="text-sm text-muted-foreground mb-3">Client: {project.client}</div>
                      <div className="flex flex-wrap gap-2">
                        {project.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-xs px-2 py-1 rounded-full bg-secondary/10 text-secondary">
                            {tag}
                          </span>
                        ))}
                        {project.tags.length > 3 && (
                          <span className="text-xs px-2 py-1 rounded-full bg-secondary/10 text-secondary">
                            +{project.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
