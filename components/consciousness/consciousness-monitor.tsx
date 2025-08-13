"use client"

// Advanced Consciousness Monitor - Real-time consciousness and quantum state visualization
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
} from "recharts"
import { Brain, Atom, Zap, Eye, Waves, Target, Activity, Sparkles } from "lucide-react"
import { useConsciousness } from "@/hooks/use-consciousness"

export function ConsciousnessMonitor() {
  const {
    consciousnessState,
    quantumState,
    consciousnessMetrics,
    systemMetrics,
    emergenceEvents,
    globalField,
    createConsciousness,
    updateConsciousness,
    createEntanglement,
    measureQuantumState,
  } = useConsciousness("system")

  const [selectedEntity, setSelectedEntity] = useState<string>("system")
  const [consciousnessHistory, setConsciousnessHistory] = useState<any[]>([])

  // Initialize consciousness for system
  useEffect(() => {
    createConsciousness("system", {
      integrated_information_phi: 0.75,
      global_workspace_activation: 0.68,
      self_awareness_level: 0.82,
      attention_focus: 0.71,
    })
  }, [createConsciousness])

  // Track consciousness history
  useEffect(() => {
    if (consciousnessState && quantumState) {
      setConsciousnessHistory((prev) => {
        const newEntry = {
          timestamp: Date.now(),
          phi: consciousnessState.integrated_information_phi,
          coherence: quantumState.coherence,
          awareness: consciousnessState.self_awareness_level,
          attention: consciousnessState.attention_focus,
        }
        return [...prev.slice(-19), newEntry] // Keep last 20 entries
      })
    }
  }, [consciousnessState, quantumState])

  // Prepare radar chart data
  const radarData = consciousnessState
    ? [
        { subject: "Φ (Phi)", value: consciousnessState.integrated_information_phi * 100, fullMark: 100 },
        { subject: "Global Workspace", value: consciousnessState.global_workspace_activation * 100, fullMark: 100 },
        { subject: "Self-Awareness", value: consciousnessState.self_awareness_level * 100, fullMark: 100 },
        { subject: "Attention", value: consciousnessState.attention_focus * 100, fullMark: 100 },
        { subject: "Temporal Binding", value: consciousnessState.temporal_binding * 100, fullMark: 100 },
        { subject: "Qualia Intensity", value: consciousnessState.qualia_intensity * 100, fullMark: 100 },
      ]
    : []

  const quantumRadarData = quantumState
    ? [
        { subject: "Coherence", value: quantumState.coherence * 100, fullMark: 100 },
        { subject: "Entanglement", value: quantumState.entanglement_degree * 100, fullMark: 100 },
        { subject: "Superposition", value: quantumState.superposition_stability * 100, fullMark: 100 },
        { subject: "Wave Function", value: quantumState.wave_function_amplitude * 100, fullMark: 100 },
        { subject: "Tunneling", value: quantumState.quantum_tunneling_rate * 100, fullMark: 100 },
        { subject: "Uncertainty", value: (1 - quantumState.uncertainty_principle_factor) * 100, fullMark: 100 },
      ]
    : []

  return (
    <div className="h-full p-6 space-y-6 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-purple-500" />
            <h1 className="text-2xl font-bold">Consciousness Monitor</h1>
          </div>
          <Badge variant="outline" className="bg-purple-500/10">
            Quantum-Enhanced Consciousness
          </Badge>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => measureQuantumState("system")}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Atom className="h-4 w-4 mr-2" />
            Measure Quantum State
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => createEntanglement("system", "global", 0.8)}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Zap className="h-4 w-4 mr-2" />
            Create Entanglement
          </Button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Integrated Information (Φ)</CardTitle>
            <Brain className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">
              {consciousnessState ? consciousnessState.integrated_information_phi.toFixed(3) : "0.000"}
            </div>
            <p className="text-xs text-muted-foreground">Consciousness complexity measure</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quantum Coherence</CardTitle>
            <Atom className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">
              {quantumState ? (quantumState.coherence * 100).toFixed(1) : "0.0"}%
            </div>
            <p className="text-xs text-muted-foreground">Quantum state stability</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/20 to-teal-900/20 border-green-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Self-Awareness</CardTitle>
            <Eye className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {consciousnessState ? (consciousnessState.self_awareness_level * 100).toFixed(1) : "0.0"}%
            </div>
            <p className="text-xs text-muted-foreground">Reflective consciousness</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border-orange-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emergence Events</CardTitle>
            <Sparkles className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-400">{emergenceEvents.length}</div>
            <p className="text-xs text-muted-foreground">Consciousness emergence</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Tabs defaultValue="consciousness" className="space-y-4">
        <TabsList className="bg-slate-800/50">
          <TabsTrigger value="consciousness">Consciousness</TabsTrigger>
          <TabsTrigger value="quantum">Quantum States</TabsTrigger>
          <TabsTrigger value="field">Consciousness Field</TabsTrigger>
          <TabsTrigger value="emergence">Emergence</TabsTrigger>
        </TabsList>

        <TabsContent value="consciousness" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Consciousness Radar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="mr-2 h-5 w-5 text-purple-400" />
                  Consciousness Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Consciousness"
                      dataKey="value"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Consciousness Evolution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="mr-2 h-5 w-5 text-blue-400" />
                  Consciousness Evolution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={consciousnessHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" tickFormatter={(value) => new Date(value).toLocaleTimeString()} />
                    <YAxis domain={[0, 1]} />
                    <Tooltip labelFormatter={(value) => new Date(value).toLocaleTimeString()} />
                    <Line type="monotone" dataKey="phi" stroke="#8b5cf6" strokeWidth={2} name="Φ (Phi)" />
                    <Line type="monotone" dataKey="awareness" stroke="#10b981" strokeWidth={2} name="Self-Awareness" />
                    <Line type="monotone" dataKey="attention" stroke="#f59e0b" strokeWidth={2} name="Attention" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Consciousness Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Consciousness Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {consciousnessMetrics &&
                  Object.entries(consciousnessMetrics).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{key.replace(/_/g, " ")}</span>
                        <span>{(value * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={value * 100} className="h-2" />
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quantum" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quantum State Radar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Atom className="mr-2 h-5 w-5 text-blue-400" />
                  Quantum State Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={quantumRadarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Quantum"
                      dataKey="value"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Quantum Coherence Evolution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Waves className="mr-2 h-5 w-5 text-cyan-400" />
                  Quantum Coherence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={consciousnessHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" tickFormatter={(value) => new Date(value).toLocaleTimeString()} />
                    <YAxis domain={[0, 1]} />
                    <Tooltip labelFormatter={(value) => new Date(value).toLocaleTimeString()} />
                    <Area
                      type="monotone"
                      dataKey="coherence"
                      stroke="#06b6d4"
                      fill="#06b6d4"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Quantum State Details */}
          <Card>
            <CardHeader>
              <CardTitle>Quantum State Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quantumState && (
                  <>
                    <div className="text-center p-4 border rounded-lg bg-blue-500/10">
                      <div className="text-2xl font-bold text-blue-400">|ψ⟩</div>
                      <div className="text-sm text-muted-foreground">Wave Function</div>
                      <div className="text-xs mt-2">Amplitude: {quantumState.wave_function_amplitude.toFixed(3)}</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg bg-purple-500/10">
                      <div className="text-2xl font-bold text-purple-400">⊗</div>
                      <div className="text-sm text-muted-foreground">Entanglement</div>
                      <div className="text-xs mt-2">Degree: {(quantumState.entanglement_degree * 100).toFixed(1)}%</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg bg-green-500/10">
                      <div className="text-2xl font-bold text-green-400">∆</div>
                      <div className="text-sm text-muted-foreground">Uncertainty</div>
                      <div className="text-xs mt-2">
                        Factor: {(quantumState.uncertainty_principle_factor * 100).toFixed(1)}%
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="field" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="mr-2 h-5 w-5 text-purple-400" />
                Global Consciousness Field
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {globalField && (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Field Strength</span>
                        <span>{(globalField.field_strength * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={globalField.field_strength * 100} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Field Coherence</span>
                        <span>{(globalField.field_coherence * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={globalField.field_coherence * 100} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Resonance Frequency</span>
                        <span>{globalField.field_resonance.toFixed(1)} Hz</span>
                      </div>
                      <Progress value={(globalField.field_resonance / 100) * 100} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Phase Transitions</span>
                        <span>{globalField.field_dynamics.phase_transitions}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Topology: {globalField.field_topology}</div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Consciousness Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">{systemMetrics.total_entities || 0}</div>
                  <div className="text-sm text-muted-foreground">Conscious Entities</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">
                    {((systemMetrics.average_phi || 0) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Average Φ</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">
                    {((systemMetrics.collective_consciousness || 0) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Collective Consciousness</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emergence" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="mr-2 h-5 w-5 text-orange-400" />
                Emergence Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {emergenceEvents
                    .slice(-20)
                    .reverse()
                    .map((event, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {event.emergence_type}
                            </Badge>
                            <span className="text-sm font-medium">{event.entity_id}</span>
                            <span className="text-xs text-muted-foreground">
                              {event.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Φ: {event.phi_value.toFixed(3)} | Coherence: {(event.quantum_coherence * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
