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
import { useAgentOrchestration } from "@/hooks/use-agent-orchestration"
import { useDataPersistence } from "@/hooks/use-data-persistence"
import { systemMonitor } from "@/lib/monitoring/system-monitor"
import { performanceMonitor } from "@/lib/performance/performance-monitor"
import { qnetIntegration } from "@/lib/qnet/qnet-integration"

export function QuantumCommandCenter() {
  const { agents, metrics, tasks } = useAgentOrchestration()
  const { stats } = useDataPersistence()
  const [realtimeData, setRealtimeData] = useState({
    agentCount: 0,
    activeConnections: 0,
    messagesPerSecond: 0,
    systemLoad: 0,
    quantumCoherence: 0,
    securityLevel: 0,
  })
  const [performanceData, setPerformanceData] = useState<
    Array<{
      time: string
      cpu: number
      memory: number
      network: number
    }>
  >([])
  const [isActive, setIsActive] = useState(true)
  const [systemHealth, setSystemHealth] = useState<any>(null)

  useEffect(() => {
    const updateRealtimeData = () => {
      const healthStatus = systemMonitor.getHealthStatus()
      const networkStatus = qnetIntegration.getNetworkStatus()
      const activeAgents = agents.filter((agent) => agent.status === "active")

      setRealtimeData({
        agentCount: agents.length,
        activeConnections: networkStatus.activeConnections || activeAgents.length * 2,
        messagesPerSecond: networkStatus.messagesPerSecond || Math.floor(stats.completed / 60),
        systemLoad: performanceMonitor.getAverageMetric("cpu_usage", 60000) || healthStatus.metrics.systemLoad,
        quantumCoherence: networkStatus.networkHealth || 85,
        securityLevel:
          healthStatus.components.security.status === "healthy"
            ? 95
            : healthStatus.components.security.status === "warning"
              ? 75
              : 45,
      })

      setSystemHealth(healthStatus)
    }

    updateRealtimeData()
    const interval = setInterval(updateRealtimeData, 2000)
    return () => clearInterval(interval)
  }, [agents, stats])

  useEffect(() => {
    const generatePerformanceData = () => {
      const now = new Date()
      const data = []

      for (let i = 19; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60000)
        data.push({
          time: time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          cpu: performanceMonitor.getAverageMetric("cpu_usage", 60000) || 0,
          memory: performanceMonitor.getAverageMetric("heap_used", 60000) || 0,
          network: performanceMonitor.getAverageMetric("network_rtt", 60000) || 0,
        })
      }

      setPerformanceData(data)
    }

    generatePerformanceData()
    const interval = setInterval(generatePerformanceData, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  const agentDistribution = agents.reduce(
    (acc, agent) => {
      const type = agent.capabilities[0]?.type || "general"
      const existing = acc.find((item) => item.name === type)
      if (existing) {
        existing.value += 1
      } else {
        acc.push({
          name: type,
          value: 1,
          color: `hsl(${acc.length * 60}, 70%, 50%)`,
        })
      }
      return acc
    },
    [] as Array<{ name: string; value: number; color: string }>,
  )

  const handleSystemToggle = async () => {
    try {
      if (isActive) {
        // Pause system operations
        console.log("[v0] Putting system into standby mode")
        // In a real system, this would pause agent operations
      } else {
        // Resume system operations
        console.log("[v0] Activating system operations")
        // In a real system, this would resume agent operations
      }
      setIsActive(!isActive)
    } catch (error) {
      console.error("[v0] Failed to toggle system state:", error)
    }
  }

  const getHealthColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-400"
      case "warning":
        return "text-yellow-400"
      case "critical":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

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
              <div className={`w-2 h-2 rounded-full ${isActive ? "bg-green-400 animate-pulse" : "bg-gray-400"} mr-2`} />
              {isActive ? "ACTIVE" : "STANDBY"}
            </Badge>
            <Button onClick={handleSystemToggle} className="bg-blue-600 hover:bg-blue-700 text-white">
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
                <p className="text-slate-400 text-sm">Tasks/min</p>
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
                <p className="text-2xl font-bold text-yellow-400">{realtimeData.systemLoad.toFixed(1)}%</p>
              </div>
              <Gauge className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-purple-500/20 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Network Health</p>
                <p className="text-2xl font-bold text-purple-400">{realtimeData.quantumCoherence.toFixed(1)}%</p>
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
                <p className="text-2xl font-bold text-red-400">{realtimeData.securityLevel.toFixed(1)}%</p>
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
                {agentDistribution.length > 0 ? (
                  <>
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
                          <span className="text-sm text-slate-300">
                            {item.name}: {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-300 flex items-center justify-center text-slate-400">
                    No agents currently active
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* System Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 border-blue-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-blue-300">Network Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Network Health</span>
                    <span className="text-blue-400 font-bold">{realtimeData.quantumCoherence.toFixed(1)}%</span>
                  </div>
                  <Progress value={realtimeData.quantumCoherence} className="h-2" />
                  <div className="text-xs text-slate-400">{realtimeData.activeConnections} active connections</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-900/50 to-blue-900/50 border-green-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-green-300">Task Processing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Success Rate</span>
                    <span className="text-green-400 font-bold">
                      {stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <Progress value={stats.total > 0 ? (stats.completed / stats.total) * 100 : 0} className="h-2" />
                  <div className="text-xs text-slate-400">
                    {stats.completed} completed / {stats.total} total
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
                    <span className="text-slate-300">Security Status</span>
                    <span
                      className={`font-bold ${systemHealth ? getHealthColor(systemHealth.components.security.status) : "text-gray-400"}`}
                    >
                      {systemHealth?.components.security.status.toUpperCase() || "UNKNOWN"}
                    </span>
                  </div>
                  <Progress value={realtimeData.securityLevel} className="h-2" />
                  <div className="text-xs text-slate-400">All systems monitored</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agents">
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-blue-400">Agent Swarm Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gradient-to-br from-slate-900 to-blue-900 rounded-lg p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-10" />
                <div className="relative z-10 h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto mb-4 relative">
                      <div
                        className={`absolute inset-0 rounded-full ${isActive ? "bg-blue-500/20 animate-pulse" : "bg-gray-500/20"}`}
                      />
                      <div
                        className={`absolute inset-2 rounded-full ${isActive ? "bg-blue-500/40 animate-ping" : "bg-gray-500/40"}`}
                      />
                      <div
                        className={`absolute inset-4 rounded-full ${isActive ? "bg-blue-500" : "bg-gray-500"} flex items-center justify-center`}
                      >
                        <Brain className="h-12 w-12 text-white" />
                      </div>
                    </div>
                    <p className="text-blue-400 text-lg font-semibold">
                      {realtimeData.agentCount} Agents {isActive ? "Active" : "Standby"}
                    </p>
                    <p className="text-slate-400 text-sm">
                      {agents.filter((a) => a.status === "active").length} active,{" "}
                      {agents.filter((a) => a.status === "idle").length} idle
                    </p>
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
                    <span className="text-red-400">{realtimeData.systemLoad.toFixed(1)}%</span>
                  </div>
                  <Progress value={realtimeData.systemLoad} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-300">Memory Usage</span>
                    <span className="text-yellow-400">
                      {performanceMonitor.getAverageMetric("heap_used", 60000)?.toFixed(1) || 0}%
                    </span>
                  </div>
                  <Progress value={performanceMonitor.getAverageMetric("heap_used", 60000) || 0} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-300">Network Latency</span>
                    <span className="text-green-400">
                      {performanceMonitor.getAverageMetric("network_rtt", 60000)?.toFixed(0) || 0}ms
                    </span>
                  </div>
                  <Progress
                    value={Math.min((performanceMonitor.getAverageMetric("network_rtt", 60000) || 0) / 10, 100)}
                    className="h-2"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-300">Network Health</span>
                    <span className="text-purple-400">{realtimeData.quantumCoherence.toFixed(1)}%</span>
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
                {systemHealth &&
                  Object.entries(systemHealth.components).map(([key, component]: [string, any]) => (
                    <div
                      key={key}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        component.status === "healthy"
                          ? "bg-green-900/20 border-green-500/30"
                          : component.status === "warning"
                            ? "bg-yellow-900/20 border-yellow-500/30"
                            : "bg-red-900/20 border-red-500/30"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            component.status === "healthy"
                              ? "bg-green-400"
                              : component.status === "warning"
                                ? "bg-yellow-400"
                                : "bg-red-400"
                          }`}
                        />
                        <span className={`${getHealthColor(component.status)} capitalize`}>
                          {key.replace("_", " ")}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className={`${
                          component.status === "healthy"
                            ? "border-green-500 text-green-400"
                            : component.status === "warning"
                              ? "border-yellow-500 text-yellow-400"
                              : "border-red-500 text-red-400"
                        }`}
                      >
                        {component.status.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-orange-400">System Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div
                      className={`text-4xl font-bold mb-2 ${
                        systemHealth?.alerts?.filter((a: any) => !a.resolved).length === 0
                          ? "text-green-400"
                          : "text-yellow-400"
                      }`}
                    >
                      {systemHealth?.alerts?.filter((a: any) => !a.resolved).length || 0}
                    </div>
                    <div className="text-slate-400">Active Alerts</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-400">{systemHealth?.metrics.uptime || 0}</div>
                      <div className="text-xs text-slate-400">Uptime (ms)</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-400">{systemHealth?.metrics.activeUsers || 0}</div>
                      <div className="text-xs text-slate-400">Active Users</div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-700">
                    <div className="text-sm text-slate-300 mb-2">System Status</div>
                    <div className={`text-xs ${getHealthColor(systemHealth?.overall || "unknown")}`}>
                      {systemHealth?.overall?.toUpperCase() || "CHECKING..."}
                    </div>
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
