"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Shield, Zap, Users, MessageSquare, BarChart3, Network, Gauge } from "lucide-react"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

// Mock real-time data
const generateRealtimeData = () => ({
  agentCount: Math.floor(Math.random() * 50) + 100,
  activeConnections: Math.floor(Math.random() * 200) + 500,
  messagesPerSecond: Math.floor(Math.random() * 100) + 50,
  systemLoad: Math.floor(Math.random() * 30) + 40,
  quantumCoherence: Math.floor(Math.random() * 20) + 80,
  securityLevel: Math.floor(Math.random() * 10) + 90,
})

const performanceData = Array.from({ length: 20 }, (_, i) => ({
  time: `${i}:00`,
  cpu: Math.floor(Math.random() * 40) + 30,
  memory: Math.floor(Math.random() * 30) + 50,
  network: Math.floor(Math.random() * 50) + 25,
}))

const agentDistribution = [
  { name: "Cognitive", value: 35, color: "#2563eb" },
  { name: "Analytical", value: 28, color: "#0ea5e9" },
  { name: "Creative", value: 22, color: "#06b6d4" },
  { name: "Orchestrator", value: 15, color: "#0891b2" },
]

export function QuantumCommandCenter() {
  const [realtimeData, setRealtimeData] = useState(generateRealtimeData())
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeData(generateRealtimeData())
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="h-full w-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6 overflow-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Quantum Command Center
            </h1>
            <p className="text-slate-400 text-lg mt-2">Orchestrating the Future of AI</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant={isActive ? "default" : "secondary"} className="px-4 py-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse mr-2" />
              {isActive ? "ACTIVE" : "STANDBY"}
            </Badge>
            <Button onClick={() => setIsActive(!isActive)} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isActive ? "Standby" : "Activate"}
            </Button>
          </div>
        </div>
      </div>

      {/* Real-time Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <Card className="bg-slate-800/50 border-blue-500/20 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Active Agents</p>
                <p className="text-2xl font-bold text-blue-400">{realtimeData.agentCount}</p>
              </div>
              <Brain className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-cyan-500/20 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Connections</p>
                <p className="text-2xl font-bold text-cyan-400">{realtimeData.activeConnections}</p>
              </div>
              <Network className="h-8 w-8 text-cyan-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-green-500/20 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Messages/sec</p>
                <p className="text-2xl font-bold text-green-400">{realtimeData.messagesPerSecond}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-yellow-500/20 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">System Load</p>
                <p className="text-2xl font-bold text-yellow-400">{realtimeData.systemLoad}%</p>
              </div>
              <Gauge className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-purple-500/20 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Quantum Coherence</p>
                <p className="text-2xl font-bold text-purple-400">{realtimeData.quantumCoherence}%</p>
              </div>
              <Zap className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-red-500/20 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Security Level</p>
                <p className="text-2xl font-bold text-red-400">{realtimeData.securityLevel}%</p>
              </div>
              <Shield className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-slate-800/50 border-slate-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">
            Overview
          </TabsTrigger>
          <TabsTrigger value="agents" className="data-[state=active]:bg-blue-600">
            Agent Swarm
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-blue-600">
            Performance
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-blue-600">
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Performance Chart */}
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-blue-400 flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  System Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="time" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                      }}
                    />
                    <Area type="monotone" dataKey="cpu" stackId="1" stroke="#2563eb" fill="#2563eb" fillOpacity={0.6} />
                    <Area
                      type="monotone"
                      dataKey="memory"
                      stackId="1"
                      stroke="#0ea5e9"
                      fill="#0ea5e9"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="network"
                      stackId="1"
                      stroke="#06b6d4"
                      fill="#06b6d4"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Agent Distribution */}
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-cyan-400 flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Agent Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={agentDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {agentDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {agentDistribution.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-slate-300">{item.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quantum Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 border-blue-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-blue-300">Quantum Entanglement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Coherence Level</span>
                    <span className="text-blue-400 font-bold">{realtimeData.quantumCoherence}%</span>
                  </div>
                  <Progress value={realtimeData.quantumCoherence} className="h-2" />
                  <div className="text-xs text-slate-400">
                    Quantum states synchronized across {realtimeData.agentCount} agents
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-900/50 to-blue-900/50 border-green-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-green-300">Neural Network</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Synaptic Activity</span>
                    <span className="text-green-400 font-bold">98.7%</span>
                  </div>
                  <Progress value={98.7} className="h-2" />
                  <div className="text-xs text-slate-400">
                    {realtimeData.messagesPerSecond} neural transmissions/sec
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-900/50 to-orange-900/50 border-red-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-red-300">Security Matrix</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Threat Level</span>
                    <span className="text-red-400 font-bold">MINIMAL</span>
                  </div>
                  <Progress value={realtimeData.securityLevel} className="h-2" />
                  <div className="text-xs text-slate-400">All systems secured and monitored</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agents">
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-blue-400">Agent Swarm Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gradient-to-br from-slate-900 to-blue-900 rounded-lg p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-10" />
                <div className="relative z-10 h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto mb-4 relative">
                      <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-pulse" />
                      <div className="absolute inset-2 rounded-full bg-blue-500/40 animate-ping" />
                      <div className="absolute inset-4 rounded-full bg-blue-500 flex items-center justify-center">
                        <Brain className="h-12 w-12 text-white" />
                      </div>
                    </div>
                    <p className="text-blue-400 text-lg font-semibold">{realtimeData.agentCount} Agents Active</p>
                    <p className="text-slate-400 text-sm">Quantum-entangled neural network</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-green-400">Real-time Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="time" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                      }}
                    />
                    <Line type="monotone" dataKey="cpu" stroke="#ef4444" strokeWidth={2} />
                    <Line type="monotone" dataKey="memory" stroke="#f59e0b" strokeWidth={2} />
                    <Line type="monotone" dataKey="network" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-purple-400">System Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-300">CPU Usage</span>
                    <span className="text-red-400">{realtimeData.systemLoad}%</span>
                  </div>
                  <Progress value={realtimeData.systemLoad} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-300">Memory Usage</span>
                    <span className="text-yellow-400">67%</span>
                  </div>
                  <Progress value={67} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-300">Network I/O</span>
                    <span className="text-green-400">34%</span>
                  </div>
                  <Progress value={34} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-300">Quantum Coherence</span>
                    <span className="text-purple-400">{realtimeData.quantumCoherence}%</span>
                  </div>
                  <Progress value={realtimeData.quantumCoherence} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  Security Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-900/20 rounded-lg border border-green-500/30">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-green-300">Firewall</span>
                  </div>
                  <Badge variant="outline" className="border-green-500 text-green-400">
                    ACTIVE
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-900/20 rounded-lg border border-green-500/30">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-green-300">Encryption</span>
                  </div>
                  <Badge variant="outline" className="border-green-500 text-green-400">
                    AES-256
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-900/20 rounded-lg border border-green-500/30">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-green-300">Authentication</span>
                  </div>
                  <Badge variant="outline" className="border-green-500 text-green-400">
                    SECURE
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-yellow-400" />
                    <span className="text-yellow-300">Intrusion Detection</span>
                  </div>
                  <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                    MONITORING
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-orange-400">Threat Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-400 mb-2">0</div>
                    <div className="text-slate-400">Active Threats</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-400">247</div>
                      <div className="text-xs text-slate-400">Blocked Attempts</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-400">99.9%</div>
                      <div className="text-xs text-slate-400">Uptime</div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-700">
                    <div className="text-sm text-slate-300 mb-2">Last Security Scan</div>
                    <div className="text-xs text-slate-400">2 minutes ago - All systems secure</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
