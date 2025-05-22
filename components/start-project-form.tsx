import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

const PROJECT_TYPES = ["Website", "Web App", "Mobile App", "E-commerce", "Other"]
const BUDGETS = ["< $1k", "$1k–$5k", "$5k–$10k", "$10k+", "Not sure"]
const TIMELINES = ["ASAP", "1 month", "3 months", "Flexible", "Specific date"]
const SOURCES = ["Google", "Referral", "Social Media", "Other"]

export default function StartProjectForm() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        company: "",
        projectType: "",
        budget: "",
        timeline: "",
        description: "",
        references: "",
        source: "",
        file: undefined as File | undefined,
    })
    const [submitted, setSubmitted] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
        setForm((prev) => ({ ...prev, file: e.target.files?.[0] }))
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSubmitting(true)
        setTimeout(() => {
            setSubmitting(false)
            setSubmitted(true)
        }, 1200)
    }

    if (submitted) {
        return (
            <div className="p-6 text-center">
                <div className="text-2xl font-bold mb-2">Thank you!</div>
                <div className="text-muted-foreground mb-4">Your project inquiry has been received. We'll get in touch soon.</div>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Full Name *</label>
                    <Input name="name" value={form.name} onChange={handleChange} required autoComplete="name" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Email Address *</label>
                    <Input name="email" type="email" value={form.email} onChange={handleChange} required autoComplete="email" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Phone Number</label>
                    <Input name="phone" value={form.phone} onChange={handleChange} autoComplete="tel" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Company/Organization</label>
                    <Input name="company" value={form.company} onChange={handleChange} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Project Type *</label>
                    <select name="projectType" value={form.projectType} onChange={handleChange} required className="w-full rounded-md border bg-background p-2">
                        <option value="">Select...</option>
                        {PROJECT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Budget *</label>
                    <select name="budget" value={form.budget} onChange={handleChange} required className="w-full rounded-md border bg-background p-2">
                        <option value="">Select...</option>
                        {BUDGETS.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Timeline *</label>
                    <select name="timeline" value={form.timeline} onChange={handleChange} required className="w-full rounded-md border bg-background p-2">
                        <option value="">Select...</option>
                        {TIMELINES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">How did you hear about us?</label>
                    <select name="source" value={form.source} onChange={handleChange} className="w-full rounded-md border bg-background p-2">
                        <option value="">Select...</option>
                        {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Project Description *</label>
                <Textarea name="description" value={form.description} onChange={handleChange} required rows={4} placeholder="Describe your idea, goals, and any features you want..." />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Reference Links</label>
                <Input name="references" value={form.references} onChange={handleChange} placeholder="e.g. https://example.com" />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">File Upload</label>
                <Input name="file" type="file" onChange={handleFile} />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Project"}
            </Button>
        </form>
    )
} 