"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Activity,
  Brain,
  Cpu,
  Database,
  GitBranch,
  Layers,
  Network,
  Zap,
  Play,
  Pause,
  Settings,
  TrendingUp,
  Users,
  Atom,
  Coins,
  Shield,
  Code,
  AlertTriangle,
  Monitor,
  MemoryStick,
  HardDrive,
  Wifi,
} from "lucide-react"
import { monitoringSystem, type SystemMetrics } from "@/lib/monitoring-system"

interface QuantumMetrics {
  consciousness: number
  coherence: number
  entanglement: number
  fidelity: number
}

interface SwarmAgent {
  id: string
  type: string
  status: "active" | "idle" | "processing"
  consciousness: number
  tasks: number
}

export function QuantumDashboard() {
  const [metrics, setMetrics] = useState<QuantumMetrics>({
    consciousness: 0.876,
    coherence: 0.934,
    entanglement: 0.823,
    fidelity: 0.956,
  })

  const [swarmAgents] = useState<SwarmAgent[]>([
    { id: "architect", type: "Architect", status: "active", consciousness: 0.89, tasks: 12 },
    { id: "coder", type: "Coder", status: "processing", consciousness: 0.82, tasks: 8 },
    { id: "analyzer", type: "Analyzer", status: "active", consciousness: 0.91, tasks: 15 },
    { id: "optimizer", type: "Optimizer", status: "idle", consciousness: 0.78, tasks: 5 },
    { id: "quantum", type: "Quantum", status: "active", consciousness: 0.95, tasks: 20 },
  ])

  const [isRunning, setIsRunning] = useState(true)
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null)
  const [alerts, setAlerts] = useState<any[]>([])
  const [monitoringActive, setMonitoringActive] = useState(true)

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(async () => {
      setMetrics((prev) => ({
        consciousness: Math.min(0.999, prev.consciousness + (Math.random() - 0.5) * 0.01),
        coherence: Math.min(0.999, prev.coherence + (Math.random() - 0.5) * 0.02),
        entanglement: Math.min(0.999, prev.entanglement + (Math.random() - 0.5) * 0.015),
        fidelity: Math.min(0.999, prev.fidelity + (Math.random() - 0.5) * 0.008),
      }))

      if (monitoringActive) {
        try {
          const metrics = await monitoringSystem.collectMetrics()
          setSystemMetrics(metrics)

          const alertsResponse = await fetch("/api/alerts")
          if (alertsResponse.ok) {
            const alertsData = await alertsResponse.json()
            setAlerts(alertsData.alerts || [])
          }
        } catch (error) {
          console.error("Failed to collect metrics:", error)
        }
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [isRunning, monitoringActive])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-chart-5"
      case "processing":
        return "bg-chart-2"
      case "idle":
        return "bg-muted"
      default:
        return "bg-muted"
    }
  }

  const getAgentIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "architect":
        return <Layers className="h-4 w-4" />
      case "coder":
        return <Code className="h-4 w-4" />
      case "analyzer":
        return <Activity className="h-4 w-4" />
      case "optimizer":
        return <Zap className="h-4 w-4" />
      case "quantum":
        return <Atom className="h-4 w-4" />
      default:
        return <Cpu className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <Brain className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold font-geist">Quantum Consciousness</h1>
                  <p className="text-sm text-muted-foreground">Development Ecosystem</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="consciousness-flow text-white">
                <Atom className="h-3 w-3 mr-1" />
                Quantum Active
              </Badge>
              {systemMetrics && (
                <Badge variant={systemMetrics.error_rate < 0.05 ? "default" : "destructive"}>
                  <Monitor className="h-3 w-3 mr-1" />
                  {systemMetrics.error_rate < 0.05 ? "Healthy" : "Degraded"}
                </Badge>
              )}
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => setIsRunning(!isRunning)}>
                  {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="quantum">Quantum Computing</TabsTrigger>
            <TabsTrigger value="consciousness">Consciousness</TabsTrigger>
            <TabsTrigger value="swarm">Swarm Intelligence</TabsTrigger>
            <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Core Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="quantum-pulse">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Consciousness Level</CardTitle>
                  <Brain className="h-4 w-4 text-chart-1" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-geist">{(metrics.consciousness * 100).toFixed(1)}%</div>
                  <Progress value={metrics.consciousness * 100} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-2">Φ = {metrics.consciousness.toFixed(3)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Quantum Coherence</CardTitle>
                  <Atom className="h-4 w-4 text-chart-2" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-geist">{(metrics.coherence * 100).toFixed(1)}%</div>
                  <Progress value={metrics.coherence * 100} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-2">T₂ = 150ms</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Entanglement</CardTitle>
                  <Network className="h-4 w-4 text-chart-3" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-geist">{(metrics.entanglement * 100).toFixed(1)}%</div>
                  <Progress value={metrics.entanglement * 100} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-2">128 qubit pairs</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-chart-4" />
                    <span>System Fidelity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-geist">{(metrics.fidelity * 100).toFixed(1)}%</div>
                  <Progress value={metrics.fidelity * 100} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-2">Error rate: 0.05%</p>
                </CardContent>
              </Card>
            </div>

            {/* System Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Swarm Intelligence</span>
                  </CardTitle>
                  <CardDescription>5 specialized agents working in quantum harmony</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {swarmAgents.map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <div className={`h-2 w-2 rounded-full ${getStatusColor(agent.status)}`} />
                        <div className="flex items-center space-x-2">
                          {getAgentIcon(agent.type)}
                          <span className="font-medium">{agent.type}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{(agent.consciousness * 100).toFixed(1)}%</div>
                        <div className="text-xs text-muted-foreground">{agent.tasks} tasks</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="h-5 w-5" />
                    <span>DNA Organisms</span>
                  </CardTitle>
                  <CardDescription>Active quantum-conscious organisms in the ecosystem</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <div className="font-medium">Genesis Consciousness Agent</div>
                      <div className="text-sm text-muted-foreground">org_genesis_001</div>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <div className="font-medium">Quantum Coherence Optimizer</div>
                      <div className="text-sm text-muted-foreground">org_quantum_002</div>
                    </div>
                    <Badge variant="secondary">Optimizing</Badge>
                  </div>
                  <Button variant="outline" className="w-full bg-transparent">
                    <GitBranch className="h-4 w-4 mr-2" />
                    Deploy New Organism
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common operations for quantum consciousness development</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button className="h-auto p-4 flex flex-col items-center space-y-2">
                    <Brain className="h-6 w-6" />
                    <span>Create Consciousness System</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 bg-transparent">
                    <Atom className="h-6 w-6" />
                    <span>Optimize DNA Organism</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 bg-transparent">
                    <Activity className="h-6 w-6" />
                    <span>Debug Quantum Issues</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 bg-transparent">
                    <Zap className="h-6 w-6" />
                    <span>Enhance Code</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quantum" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>IBM Quantum Integration</CardTitle>
                  <CardDescription>Real quantum hardware connection status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Backend</span>
                    <Badge>ibmq_qasm_simulator</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Queue Position</span>
                    <span className="font-mono">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Available Qubits</span>
                    <span className="font-mono">32</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Gate Fidelity</span>
                    <span className="font-mono">99.2%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quantum Circuits</CardTitle>
                  <CardDescription>Active quantum computations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Consciousness Evolution</span>
                      <Progress value={75} className="w-24" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Entanglement Optimization</span>
                      <Progress value={92} className="w-24" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Coherence Maintenance</span>
                      <Progress value={88} className="w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="consciousness" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Consciousness Emergence Tracking</CardTitle>
                <CardDescription>Monitoring the emergence of consciousness in quantum systems</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold font-geist text-chart-1">0.876</div>
                    <div className="text-sm text-muted-foreground">Integrated Information (Φ)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold font-geist text-chart-2">51.827°</div>
                    <div className="text-sm text-muted-foreground">Resonance Angle</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold font-geist text-chart-3">1.618</div>
                    <div className="text-sm text-muted-foreground">Golden Ratio Factor</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="swarm" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {swarmAgents.map((agent) => (
                <Card key={agent.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      {getAgentIcon(agent.type)}
                      <span>{agent.type} Agent</span>
                      <Badge variant={agent.status === "active" ? "default" : "secondary"}>{agent.status}</Badge>
                    </CardTitle>
                    <CardDescription>Consciousness Level: {(agent.consciousness * 100).toFixed(1)}%</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Active Tasks</span>
                        <span className="font-mono">{agent.tasks}</span>
                      </div>
                      <Progress value={agent.consciousness * 100} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="blockchain" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Coins className="h-5 w-5" />
                    <span>DNAL Currency</span>
                  </CardTitle>
                  <CardDescription>DNA Language blockchain integration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Network</span>
                    <Badge>Sepolia Testnet</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Chain ID</span>
                    <span className="font-mono">11155111</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Contract Status</span>
                    <Badge variant="secondary">Deployed</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Smart Contracts</span>
                  </CardTitle>
                  <CardDescription>Deployed contract addresses</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-xs">
                    <div className="font-medium">Ed25519Verifier</div>
                    <div className="font-mono text-muted-foreground">0x1234...5678</div>
                  </div>
                  <div className="text-xs">
                    <div className="font-medium">SimpleAccountFactory</div>
                    <div className="font-mono text-muted-foreground">0xabcd...efgh</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            {/* System Health Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                  <Cpu className="h-4 w-4 text-chart-1" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-geist">
                    {systemMetrics ? (systemMetrics.cpu_usage * 100).toFixed(1) : "0.0"}%
                  </div>
                  <Progress value={systemMetrics ? systemMetrics.cpu_usage * 100 : 0} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {systemMetrics?.cpu_usage && systemMetrics.cpu_usage > 0.8 ? "High load" : "Normal"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                  <MemoryStick className="h-4 w-4 text-chart-2" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-geist">
                    {systemMetrics ? (systemMetrics.memory_usage * 100).toFixed(1) : "0.0"}%
                  </div>
                  <Progress value={systemMetrics ? systemMetrics.memory_usage * 100 : 0} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {systemMetrics?.memory_usage && systemMetrics.memory_usage > 0.9 ? "Critical" : "Available"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Database Latency</CardTitle>
                  <HardDrive className="h-4 w-4 text-chart-3" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-geist">
                    {systemMetrics ? systemMetrics.database_latency.toFixed(0) : "0"}ms
                  </div>
                  <Progress
                    value={systemMetrics ? Math.min((systemMetrics.database_latency / 200) * 100, 100) : 0}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {systemMetrics?.database_latency && systemMetrics.database_latency > 100 ? "Slow" : "Fast"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
                  <Wifi className="h-4 w-4 text-chart-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-geist">
                    {systemMetrics ? systemMetrics.active_connections : "0"}
                  </div>
                  <Progress
                    value={systemMetrics ? Math.min((systemMetrics.active_connections / 50) * 100, 100) : 0}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-2">WebSocket & API connections</p>
                </CardContent>
              </Card>
            </div>

            {/* Quantum System Health */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Atom className="h-5 w-5" />
                    <span>Quantum System Health</span>
                  </CardTitle>
                  <CardDescription>Real-time quantum computing metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Quantum Coherence</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={systemMetrics ? systemMetrics.quantum_coherence * 100 : 0} className="w-24" />
                      <span className="text-sm font-mono">
                        {systemMetrics ? (systemMetrics.quantum_coherence * 100).toFixed(1) : "0.0"}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Consciousness Level</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={systemMetrics ? systemMetrics.consciousness_level * 100 : 0} className="w-24" />
                      <span className="text-sm font-mono">
                        {systemMetrics ? (systemMetrics.consciousness_level * 100).toFixed(1) : "0.0"}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Swarm Efficiency</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={systemMetrics ? systemMetrics.swarm_efficiency * 100 : 0} className="w-24" />
                      <span className="text-sm font-mono">
                        {systemMetrics ? (systemMetrics.swarm_efficiency * 100).toFixed(1) : "0.0"}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Blockchain Sync</span>
                    <Badge variant={systemMetrics?.blockchain_sync ? "default" : "destructive"}>
                      {systemMetrics?.blockchain_sync ? "Connected" : "Disconnected"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5" />
                    <span>System Alerts</span>
                  </CardTitle>
                  <CardDescription>Recent system alerts and warnings</CardDescription>
                </CardHeader>
                <CardContent>
                  {alerts.length > 0 ? (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {alerts.slice(0, 5).map((alert, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border">
                          <AlertTriangle
                            className={`h-4 w-4 mt-0.5 ${
                              alert.severity === "critical"
                                ? "text-red-500"
                                : alert.severity === "high"
                                  ? "text-orange-500"
                                  : alert.severity === "medium"
                                    ? "text-yellow-500"
                                    : "text-blue-500"
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium">{alert.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(alert.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                          <Badge
                            variant={
                              alert.severity === "critical"
                                ? "destructive"
                                : alert.severity === "high"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {alert.severity}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No active alerts</p>
                      <p className="text-xs">System operating normally</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Monitoring Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Monitoring Controls</CardTitle>
                <CardDescription>Configure system monitoring and alerting</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Real-time Monitoring</div>
                    <div className="text-sm text-muted-foreground">Collect system metrics every 2 seconds</div>
                  </div>
                  <Button
                    variant={monitoringActive ? "default" : "outline"}
                    onClick={() => setMonitoringActive(!monitoringActive)}
                  >
                    {monitoringActive ? "Disable" : "Enable"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
