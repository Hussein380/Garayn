import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ExternalLink, Calendar, User, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import ParticleBackground from "@/components/particle-background"
import RelatedProjects from "@/components/related-projects"

// This would be fetched from your backend in a real implementation
const getProjectData = (slug: string) => {
  // Mock data for demonstration
  return {
    id: "1",
    title: "E-Commerce Platform",
    description:
      "A comprehensive e-commerce solution built for a fashion retailer, featuring product management, user authentication, shopping cart, and secure checkout integration.",
    fullDescription: `
      <p>Our client, a growing fashion retailer, needed a modern e-commerce platform to expand their online presence and streamline their sales process. They were facing challenges with their existing solution, including poor performance, limited customization options, and difficulty managing their inventory.</p>
      
      <h3>The Challenge</h3>
      <p>The main challenges we faced included:</p>
      <ul>
        <li>Creating a high-performance, responsive website that would work seamlessly across all devices</li>
        <li>Implementing a robust product management system with advanced filtering and search capabilities</li>
        <li>Developing a secure and intuitive checkout process with multiple payment options</li>
        <li>Integrating with their existing inventory management system</li>
      </ul>
      
      <h3>Our Approach</h3>
      <p>We took a user-centered approach to design and development, focusing on creating an intuitive and engaging shopping experience. We used Next.js for the frontend to ensure fast page loads and SEO optimization, and built a custom API with Node.js and MongoDB for the backend.</p>
      
      <h3>Key Features</h3>
      <ul>
        <li>Responsive design optimized for mobile, tablet, and desktop</li>
        <li>Advanced product filtering and search functionality</li>
        <li>User account management with order history</li>
        <li>Secure checkout with Stripe integration</li>
        <li>Admin dashboard for product and order management</li>
        <li>Real-time inventory synchronization</li>
      </ul>
      
      <h3>Results</h3>
      <p>The new e-commerce platform launched successfully and has delivered significant results for our client:</p>
      <ul>
        <li>45% increase in conversion rate</li>
        <li>60% reduction in cart abandonment</li>
        <li>30% increase in average order value</li>
        <li>Significant improvement in page load times (from 4.2s to 1.3s)</li>
      </ul>
    `,
    image: "/placeholder.svg?height=600&width=800",
    gallery: [
      "/placeholder.svg?height=600&width=800",
      "/placeholder.svg?height=600&width=800",
      "/placeholder.svg?height=600&width=800",
      "/placeholder.svg?height=600&width=800",
    ],
    tags: ["Next.js", "MongoDB", "Stripe", "Tailwind CSS", "Node.js", "Redux"],
    category: "Web Development",
    client: "Fashion Retailer",
    year: "2023",
    duration: "3 months",
    liveUrl: "https://example.com",
    testimonial: {
      quote:
        "Garayn delivered an exceptional e-commerce platform that has transformed our online business. The team was professional, responsive, and truly understood our needs.",
      author: "Jane Smith",
      position: "Digital Director, Fashion Retailer",
    },
  }
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const project = getProjectData(params.slug)

  return {
    title: `${project.title} | Garayn Projects`,
    description: project.description,
  }
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const project = getProjectData(params.slug)

  return (
    <div className="min-h-screen relative theme-transition">
      <ParticleBackground />
      <Navbar />

      <main className="pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="container px-4 md:px-6">
          <Link
            href="/projects"
            className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="mb-8">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter gradient-text mb-4">{project.title}</h1>
                <p className="text-xl text-muted-foreground">{project.description}</p>
              </div>

              <div className="relative w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden mb-8">
                <Image src={project.image || "/placeholder.svg"} alt={project.title} fill className="object-cover" />
              </div>

              <div
                className="prose prose-lg dark:prose-invert max-w-none mb-12"
                dangerouslySetInnerHTML={{ __html: project.fullDescription }}
              />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                {project.gallery.map((image, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${project.title} gallery image ${index + 1}`}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>

              {project.testimonial && (
                <div className="glass-effect rounded-xl p-8 mb-12 relative">
                  <div className="absolute -top-4 -left-4 text-4xl text-primary opacity-50">"</div>
                  <blockquote className="text-lg italic mb-4">{project.testimonial.quote}</blockquote>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-primary/20 mr-3"></div>
                    <div>
                      <div className="font-semibold">{project.testimonial.author}</div>
                      <div className="text-sm text-muted-foreground">{project.testimonial.position}</div>
                    </div>
                  </div>
                  <div className="absolute -bottom-4 -right-4 text-4xl text-primary opacity-50">"</div>
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="glass-effect rounded-xl p-6 sticky top-32">
                <h3 className="text-xl font-semibold mb-6">Project Details</h3>

                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Client</div>
                      <div className="font-medium">{project.client}</div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Timeline</div>
                      <div className="font-medium">
                        {project.year} • {project.duration}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                      <Tag className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Category</div>
                      <div className="font-medium">{project.category}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Technologies</div>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span key={tag} className="text-xs px-2 py-1 rounded-full bg-secondary/10 text-secondary">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full" asChild>
                    <Link
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center"
                    >
                      Visit Live Site
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <RelatedProjects currentProjectId={project.id} />
        </div>
      </main>

      <Footer />
    </div>
  )
}
