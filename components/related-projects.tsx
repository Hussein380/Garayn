import Link from "next/link"
import Image from "next/image"

// This would be fetched from your backend in a real implementation
const getRelatedProjects = (currentProjectId: string) => {
  // Mock data for demonstration
  return [
    {
      id: "2",
      title: "Healthcare Dashboard",
      description: "An intuitive dashboard for healthcare professionals to monitor patient data and trends.",
      image: "/placeholder.svg?height=600&width=800",
      category: "Dashboard",
      url: "/projects/healthcare-dashboard",
    },
    {
      id: "3",
      title: "Workflow Automation",
      description: "Custom workflow automation solution that reduced manual processes by 85%.",
      image: "/placeholder.svg?height=600&width=800",
      category: "Automation",
      url: "/projects/workflow-automation",
    },
    {
      id: "4",
      title: "Mobile Fitness App",
      description: "A cross-platform fitness application with workout tracking and nutrition planning.",
      image: "/placeholder.svg?height=600&width=800",
      category: "Mobile App",
      url: "/projects/mobile-fitness-app",
    },
  ]
}

export default function RelatedProjects({ currentProjectId }: { currentProjectId: string }) {
  const relatedProjects = getRelatedProjects(currentProjectId)

  return (
    <section className="mt-20">
      <h2 className="text-3xl font-bold tracking-tighter gradient-text mb-8">Related Projects</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {relatedProjects.map((project) => (
          <Link key={project.id} href={project.url} className="group">
            <div className="glass-effect rounded-xl overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 theme-transition">
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={project.image || "/placeholder.svg"}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              <div className="p-6 flex-grow flex flex-col">
                <div className="mb-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">{project.category}</span>
                </div>
                <h3 className="text-lg font-bold mb-2">{project.title}</h3>
                <p className="text-sm text-muted-foreground">{project.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
