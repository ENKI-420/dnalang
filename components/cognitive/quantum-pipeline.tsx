"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowRight, Cpu, Database, Network, Zap, Play, Pause, Cloud, ShieldCheck, Monitor } from 'lucide-react'

interface PipelineStage {
  id: string
  name: string
  description: string
  status: "idle" | "processing" | "completed" | "error"
  progress: number
  throughput: number
  icon: any
}

interface DataFlow {
  id: string
  source: string
  target: string
  dataType: string
  volume: number
  latency: number
  active: boolean
}

interface FoundationStatus {
  id: string
  name: string
  status: "ready" | "complete" | "staged" | "error"
  description: string
  icon: any
}

export function QuantumPipeline() {
  const [isRunning, setIsRunning] = useState(true)
  const [stages, setStages] = useState<PipelineStage[]>([
    {
      id: "1",
      name: "NLP Processing",
      description: "Natural language understanding and semantic analysis",
      status: "processing",
      progress: 67,
      throughput: 1247,
      icon: Database,
    },
    {
      id: "2",
      name: "Quantum Encoding",
      description: "Convert classical data to quantum state representations",
      status: "processing",
      progress: 43,
      throughput: 892,
      icon: Zap,
    },
    {
      id: "3",
      name: "Quantum Processing",
      description: "Execute quantum algorithms and computations",
      status: "processing",
      progress: 78,
      throughput: 634,
      icon: Cpu,
    },
    {
      id: "4",
      name: "Swarm Distribution",
      description: "Distribute results across agent swarm network",
      status: "completed",
      progress: 100,
      throughput: 1456,
      icon: Network,
    },
  ])

  const [dataFlows] = useState<DataFlow[]>([
    { id: "1", source: "1", target: "2", dataType: "Semantic Vectors", volume: 2.4, latency: 12, active: true },
    { id: "2", source: "2", target: "3", dataType: "Quantum States", volume: 1.8, latency: 8, active: true },
    { id: "3", source: "3", target: "4", dataType: "Processed Results", volume: 3.1, latency: 15, active: true },
  ])

  const [systemMetrics, setSystemMetrics] = useState({
    quantumCoherence: 94.7,
    entanglementFidelity: 98.2,
    errorRate: 0.003,
    throughputTotal: 4229,
  })

  const [foundationStatus] = useState<FoundationStatus[]>([
    {
      id: "oss-p1.1",
      name: "IaC Scaffold",
      status: "complete",
      description: "Terraform blueprint for sovereign infrastructure.",
      icon: Cloud,
    },
    {
      id: "oss-p1.2",
      name: "Security Policies",
      status: "complete",
      description: "Open Policy Agent (OPA) Zero Trust model.",
      icon: ShieldCheck,
    },
    {
      id: "oss-p1.3",
      name: "Observability Stack",
      status: "complete",
      description: "Prometheus & Grafana for health monitoring.",
      icon: Monitor,
    },
  ])

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setStages((prev) =>
        prev.map((stage) => ({
          ...stage,
          progress: stage.status === "processing" ? Math.min(100, stage.progress + Math.random() * 5) : stage.progress,
          throughput: Math.max(0, stage.throughput + (Math.random() - 0.5) * 100),
        })),
      )

      setSystemMetrics((prev) => ({
        quantumCoherence: Math.max(90, Math.min(100, prev.quantumCoherence + (Math.random() - 0.5) * 2)),
        entanglementFidelity: Math.max(95, Math.min(100, prev.entanglementFidelity + (Math.random() - 0.5) * 1)),
        errorRate: Math.max(0, Math.min(0.01, prev.errorRate + (Math.random() - 0.5) * 0.001)),
        throughputTotal: Math.max(3000, prev.throughputTotal + (Math.random() - 0.5) * 200),
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processing":
        return "bg-blue-500"
      case "completed":
        return "bg-green-500"
      case "error":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "processing":
        return <Badge className="bg-blue-500">Processing</Badge>
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="secondary">Idle</Badge>
    }
  }

  const getFoundationStatusBadge = (status: string) => {
    switch (status) {
      case "complete":
        return <Badge className="bg-green-500">Complete</Badge>
      case "ready":
        return <Badge className="bg-blue-500">Ready</Badge>
      case "staged":
        return <Badge variant="secondary">Staged</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <div className="h-full p-6 space-y-6 overflow-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quantum Pipeline Explorer</h2>
          <p className="text-muted-foreground">Visualize NLP → Quantum → Swarm data flow</p>
        </div>
        <div className="flex space-x-2">
          <Button variant={isRunning ? "default" : "outline"} size="sm" onClick={() => setIsRunning(!isRunning)}>
            {isRunning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isRunning ? "Pause" : "Resume"}
          </Button>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Quantum Coherence</p>
                <p className="text-2xl font-bold text-blue-500">{systemMetrics.quantumCoherence.toFixed(1)}%</p>
              </div>
              <Zap className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Entanglement Fidelity</p>
                <p className="text-2xl font-bold text-purple-500">{systemMetrics.entanglementFidelity.toFixed(1)}%</p>
              </div>
              <Network className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Error Rate</p>
                <p className="text-2xl font-bold text-red-500">{(systemMetrics.errorRate * 100).toFixed(3)}%</p>
              </div>
              <Database className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Throughput</p>
                <p className="text-2xl font-bold text-green-500">{systemMetrics.throughputTotal.toFixed(0)}</p>
              </div>
              <Cpu className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operational Foundation Status */}
      <Card>
        <CardHeader>
          <CardTitle>Operational Foundation Status</CardTitle>
          <p className="text-sm text-muted-foreground">Fortified infrastructure for Operation Sovereign Sky</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {foundationStatus.map((item) => {
              const IconComponent = item.icon
              return (
                <Card key={item.id} className="bg-muted/20 border-border/40">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <IconComponent className="h-6 w-6 text-primary" />
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                    {getFoundationStatusBadge(item.status)}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Stages */}
      <Card>
        <CardHeader>
          <CardTitle>Processing Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {stages.map((stage, index) => {
              const IconComponent = stage.icon
              return (
                <div key={stage.id}>
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${getStatusColor(stage.status)}`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold">{stage.name}</h3>
                          <p className="text-sm text-muted-foreground">{stage.description}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          {getStatusBadge(stage.status)}
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Throughput</p>
                            <p className="font-medium">{stage.throughput.toFixed(0)} ops/s</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{stage.progress.toFixed(0)}%</span>
                        </div>
                        <Progress value={stage.progress} className="h-2" />
                      </div>
                    </div>
                  </div>

                  {index < stages.length - 1 && (
                    <div className="flex justify-center my-4">
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <ArrowRight className="h-4 w-4" />
                        <span className="text-xs">
                          {dataFlows[index]?.dataType} ({dataFlows[index]?.volume.toFixed(1)} GB/s)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Data Flow Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Data Flow Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dataFlows.map((flow) => (
                <div key={flow.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{flow.dataType}</p>
                    <p className="text-sm text-muted-foreground">
                      Stage {flow.source} → Stage {flow.target}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{flow.volume.toFixed(1)} GB/s</p>
                    <p className="text-xs text-muted-foreground">{flow.latency}ms latency</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quantum State Monitor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-blue-500">|0⟩</p>
                  <p className="text-sm text-muted-foreground">Ground State</p>
                  <p className="text-xs">67.3% probability</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-purple-500">|1⟩</p>
                  <p className="text-sm text-muted-foreground">Excited State</p>
                  <p className="text-xs">32.7% probability</p>
                </div>
              </div>
              <div className="text-center p-4 border rounded-lg bg-muted/20">
                <p className="text-lg font-bold">|ψ⟩ = α|0⟩ + β|1⟩</p>
                <p className="text-sm text-muted-foreground">Current Superposition</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
