"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// These would come from your backend in a real implementation
const CATEGORIES = ["Web Development", "Mobile App", "Dashboard", "Automation", "AI Integration", "E-commerce"]

const TECHNOLOGIES = [
  "Next.js",
  "React",
  "Node.js",
  "MongoDB",
  "PostgreSQL",
  "Firebase",
  "Tailwind CSS",
  "React Native",
  "Python",
  "Express",
]

const YEARS = ["2023", "2022", "2021", "2020"]

export default function ProjectFilters() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([])
  const [selectedYears, setSelectedYears] = useState<string[]>([])

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const handleTechnologyToggle = (technology: string) => {
    setSelectedTechnologies((prev) =>
      prev.includes(technology) ? prev.filter((t) => t !== technology) : [...prev, technology],
    )
  }

  const handleYearToggle = (year: string) => {
    setSelectedYears((prev) => (prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]))
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedTechnologies([])
    setSelectedYears([])
    setSearchQuery("")
  }

  return (
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

        <div className="flex flex-wrap gap-2 min-w-0 w-full md:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 min-w-0 flex-shrink">
                <Filter className="h-4 w-4" />
                Category
                {selectedCategories.length > 0 && (
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
              <Button variant="outline" className="flex items-center gap-2 min-w-0 flex-shrink">
                <Filter className="h-4 w-4" />
                Technology
                {selectedTechnologies.length > 0 && (
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
              <Button variant="outline" className="flex items-center gap-2 min-w-0 flex-shrink">
                <Filter className="h-4 w-4" />
                Year
                {selectedYears.length > 0 && (
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

      {(selectedCategories.length > 0 || selectedTechnologies.length > 0 || selectedYears.length > 0) && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Active filters:</span>
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((category) => (
              <Badge key={category} variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {category} ×
              </Badge>
            ))}
            {selectedTechnologies.map((technology) => (
              <Badge key={technology} variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
                {technology} ×
              </Badge>
            ))}
            {selectedYears.map((year) => (
              <Badge key={year} variant="outline" className="bg-accent/10 text-accent border-accent/20">
                {year} ×
              </Badge>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}

// This is a placeholder component since we're not importing Badge from shadcn/ui
function Badge({ children, className, variant }: { children: React.ReactNode; className?: string; variant?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {children}
    </span>
  )
}
