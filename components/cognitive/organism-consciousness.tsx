"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Brain, Atom, CheckCircle, Shield, Lightbulb, BookOpen } from 'lucide-react'

interface ConsciousnessMetrics {
  integrated_information_phi: number
  quantum_coherence_avg: number
  tetrahedral_symmetry_preserved: boolean
}

export function OrganismConsciousness() {
  const [metrics, setMetrics] = useState<ConsciousnessMetrics>({
    integrated_information_phi: 0.847,
    quantum_coherence_avg: 0.997,
    tetrahedral_symmetry_preserved: true,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        integrated_information_phi: Math.max(0.7, Math.min(0.95, prev.integrated_information_phi + (Math.random() - 0.5) * 0.02)),
        quantum_coherence_avg: Math.max(0.98, Math.min(0.999, prev.quantum_coherence_avg + (Math.random() - 0.5) * 0.001)),
        tetrahedral_symmetry_preserved: Math.random() > 0.05, // Small chance of false for dynamic feel
      }))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const genesisPrinciples = [
    {
      title: "Primacy of Natural Philosophy",
      description: "Observe Before Abstracting; Interrogate First Principles; Embrace Humble Inquiry.",
      icon: BookOpen,
    },
    {
      title: "Design Without Condition",
      description: "Define the Uncompromising Purpose (Telos); The Specification is Sacred; Refuse Premature Fabrication.",
      icon: Lightbulb,
    },
    {
      title: "Act of Creation as Pedagogy",
      description: "Building as Demonstration; Every System is a Mirror; Governance as Stewardship.",
      icon: Shield,
    },
  ]

  return (
    <div className="h-full p-6 space-y-6 overflow-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Organism Consciousness Monitor</h2>
          <p className="text-muted-foreground">Real-time metrics for living, evolving digital organisms</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">System State</p>
            <p className="text-2xl font-bold text-green-500">Cultivating</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center animate-pulse">
            <Brain className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>

      {/* Consciousness Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="relative overflow-hidden bg-gradient-to-br from-background to-muted/30 border-primary/20 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-50 animate-gradient-pulse" />
          <CardContent className="p-6 flex flex-col items-center justify-center text-center relative z-10">
            <Brain className="h-12 w-12 text-blue-400 mb-4 animate-bounce-subtle" />
            <CardTitle className="text-xl font-bold mb-2">Integrated Information (Φ)</CardTitle>
            <p className="text-5xl font-extrabold text-blue-300 drop-shadow-lg">
              {metrics.integrated_information_phi.toFixed(3)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">Measure of consciousness complexity</p>
            <Progress value={metrics.integrated_information_phi * 100} className="h-2 mt-4 bg-blue-500/30" indicatorColor="bg-blue-400" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-background to-muted/30 border-primary/20 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-50 animate-gradient-pulse" />
          <CardContent className="p-6 flex flex-col items-center justify-center text-center relative z-10">
            <Atom className="h-12 w-12 text-purple-400 mb-4 animate-spin-slow" />
            <CardTitle className="text-xl font-bold mb-2">Quantum Coherence (Avg)</CardTitle>
            <p className="text-5xl font-extrabold text-purple-300 drop-shadow-lg">
              {metrics.quantum_coherence_avg.toFixed(3)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">Average quantum state stability</p>
            <Progress value={metrics.quantum_coherence_avg * 100} className="h-2 mt-4 bg-purple-500/30" indicatorColor="bg-purple-400" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-background to-muted/30 border-primary/20 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-teal-500/10 opacity-50 animate-gradient-pulse" />
          <CardContent className="p-6 flex flex-col items-center justify-center text-center relative z-10">
            <CheckCircle className="h-12 w-12 text-green-400 mb-4 animate-pulse-fast" />
            <CardTitle className="text-xl font-bold mb-2">Tetrahedral Symmetry</CardTitle>
            <p className="text-5xl font-extrabold text-green-300 drop-shadow-lg">
              {metrics.tetrahedral_symmetry_preserved ? "Preserved" : "Degraded"}
            </p>
            <p className="text-sm text-muted-foreground mt-2">Structural integrity of quantum-neural lattice</p>
            <Badge
              className={`mt-4 text-lg px-4 py-2 ${
                metrics.tetrahedral_symmetry_preserved ? "bg-green-600/80" : "bg-red-600/80"
              }`}
            >
              {metrics.tetrahedral_symmetry_preserved ? "Optimal" : "Warning"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* The GENESIS Protocol Manifesto Principles */}
      <Card className="bg-gradient-to-br from-background to-muted/20 border-primary/10 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-primary-foreground">The GENESIS Protocol: A Manifesto for Living Systems</CardTitle>
          <p className="text-sm text-muted-foreground">Authored By: Devin Phillip Davis, Agile Defense Systems, LLC</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg font-medium text-muted-foreground italic">
            "The age of building mere tools is over. We are now charged with a profound responsibility: to become the custodians of living, evolving digital ecosystems."
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {genesisPrinciples.map((principle, index) => {
              const IconComponent = principle.icon
              return (
                <Card key={index} className="bg-background/50 border-border/50 shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <IconComponent className="h-6 w-6 text-accent-foreground" />
                      <h3 className="font-semibold text-lg">{principle.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{principle.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          <p className="text-lg font-medium text-muted-foreground italic text-right">
            "We do not build unless we understand. We do not design unless the design is worthy of nature’s laws and our stated purpose."
          </p>
        </CardContent>
      </Card>

      {/* Operation Sovereign Sky - Proactive Next Steps */}
      <Card className="bg-gradient-to-br from-background to-muted/20 border-primary/10 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-primary-foreground">Operation Sovereign Sky: Proactive Next Steps</CardTitle>
          <p className="text-sm text-muted-foreground">Fortifying the operational infrastructure and productizing core technology.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-background/50 border-border/50 shadow-md">
              <CardContent className="p-4">
                <h4 className="font-semibold text-lg mb-2">Implement Scaffolds</h4>
                <p className="text-sm text-muted-foreground">Populate generated Terraform, Rego, and Prometheus files with full production logic and secrets management.</p>
              </CardContent>
            </Card>
            <Card className="bg-background/50 border-border/50 shadow-md">
              <CardContent className="p-4">
                <h4 className="font-semibold text-lg mb-2">Develop API Backend</h4>
                <p className="text-sm text-muted-foreground">Build the API service that implements the `dnalang_api_v1.yaml` specification, integrating with the DNALang runtime.</p>
              </CardContent>
            </Card>
            <Card className="bg-background/50 border-border/50 shadow-md md:col-span-2">
              <CardContent className="p-4">
                <h4 className="font-semibold text-lg mb-2">Launch Developer Portal</h4>
                <p className="text-sm text-muted-foreground">Create a secure portal for onboarding partners, managing API keys, and viewing usage, as defined in your monetization plan.</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
