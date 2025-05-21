import Navbar from "@/components/layout/navbar"
import Hero from "@/components/sections/hero"
import About from "@/components/sections/about"
import Services from "@/components/sections/services"
import HowItWorks from "@/components/sections/how-it-works"
import Contact from "@/components/sections/contact"
import Footer from "@/components/layout/footer"
import ParticleBackground from "@/components/ui/particle-background"
import Chatbot from "@/components/features/chatbot/chatbot"

export default function Home() {
  return (
    <div className="min-h-screen relative theme-transition">
      <ParticleBackground />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <HowItWorks />
        <Contact />
      </main>
      <Footer />
      <Chatbot />
    </div>
  )
}
