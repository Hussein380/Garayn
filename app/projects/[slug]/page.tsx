import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ExternalLink, Calendar, User, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import ParticleBackground from "@/components/particle-background"
import RelatedProjects from "@/components/related-projects"
import { Badge } from "@/components/ui/badge"

// This would be fetched from your backend in a real implementation
const getProjectData = (slug: string) => {
  // Mock data for demonstration
  return {
    id: "1",
    title: "E-Commerce Platform",
    description:
      "A comprehensive e-commerce solution built for a fashion retailer, featuring product management, user authentication, shopping cart, and secure checkout integration.",
    fullDescription: `
      <h2>Project Overview</h2>
      <p>This e-commerce platform was built using modern web technologies to provide a seamless shopping experience. The platform includes advanced features like real-time inventory management, personalized recommendations, and secure payment processing.</p>
      
      <h2>Key Features</h2>
      <ul>
        <li>Responsive design that works on all devices</li>
        <li>Advanced product filtering and search</li>
        <li>Secure user authentication and authorization</li>
        <li>Real-time inventory management</li>
        <li>Integrated payment processing</li>
        <li>Admin dashboard for store management</li>
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
    isPaid: true,
    price: 299,
    previewFeatures: [
      "Complete source code",
      "Detailed documentation",
      "1 month of email support",
      "Installation guide",
      "Customization guide",
      "Future updates"
    ],
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
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tighter gradient-text">{project.title}</h1>
                  {project.isPaid && (
                    <Badge className="text-lg px-4 py-2 bg-primary text-primary-foreground">
                      ${project.price}
                    </Badge>
                  )}
                </div>
                <p className="text-xl text-muted-foreground">{project.description}</p>
              </div>

              <div className="relative w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden mb-8">
                <Image src={project.image || "/placeholder.svg"} alt={project.title} fill className="object-cover" />
                {project.isPaid && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center text-white">
                      <p className="text-lg mb-4">Preview Mode</p>
                      <Button size="lg" variant="default">
                        Purchase to View Full Project
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div
                className="prose prose-lg dark:prose-invert max-w-none mb-12"
                dangerouslySetInnerHTML={{ __html: project.fullDescription }}
              />

              {(!project.isPaid || project.gallery) && (
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
              )}

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
                {project.isPaid ? (
                  <>
                    <h3 className="text-xl font-semibold mb-6">Purchase Project</h3>
                    <div className="space-y-6">
                      <div className="text-3xl font-bold text-primary mb-4">${project.price}</div>

                      <div className="space-y-4">
                        <h4 className="font-medium">What's Included:</h4>
                        <ul className="space-y-3">
                          {project.previewFeatures.map((feature, index) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-2 text-primary">✓</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Button size="lg" className="w-full">
                        Purchase Now
                      </Button>

                      <p className="text-sm text-muted-foreground text-center">
                        Secure payment via Stripe
                      </p>
                    </div>
                  </>
                ) : (
                  <>
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
                  </>
                )}
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
