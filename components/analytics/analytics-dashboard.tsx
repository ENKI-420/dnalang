"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
} from "lucide-react"
import { useDataPersistence } from "@/hooks/use-data-persistence"
import { useAgentOrchestration } from "@/hooks/use-agent-orchestration"

interface AnalyticsData {
  timestamp: string
  systemLoad: number
  agentUtilization: number
  taskThroughput: number
  errorRate: number
  responseTime: number
}

interface AgentPerformanceData {
  agentId: string
  name: string
  type: string
  successRate: number
  efficiency: number
  tasksCompleted: number
  averageTime: number
}

export function AnalyticsDashboard() {
  const { stats, executions, loading } = useDataPersistence()
  const { agents, metrics, tasks } = useAgentOrchestration()

  const [timeRange, setTimeRange] = useState<"1h" | "24h" | "7d" | "30d">("24h")
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([])
  const [agentPerformanceData, setAgentPerformanceData] = useState<AgentPerformanceData[]>([])
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    activeUsers: 0,
    totalRequests: 0,
    averageResponseTime: 0,
    systemHealth: 95,
  })

  // Generate mock time series data for demonstration
  useEffect(() => {
    const generateTimeSeriesData = () => {
      const now = new Date()
      const data: AnalyticsData[] = []
      const points = timeRange === "1h" ? 60 : timeRange === "24h" ? 24 : timeRange === "7d" ? 7 : 30

      for (let i = points; i >= 0; i--) {
        const timestamp = new Date(
          now.getTime() -
            i *
              (timeRange === "1h"
                ? 60000
                : timeRange === "24h"
                  ? 3600000
                  : timeRange === "7d"
                    ? 86400000
                    : 86400000 * 30),
        )

        data.push({
          timestamp: timestamp.toISOString(),
          systemLoad: Math.random() * 100,
          agentUtilization: 60 + Math.random() * 30,
          taskThroughput: 10 + Math.random() * 50,
          errorRate: Math.random() * 5,
          responseTime: 100 + Math.random() * 200,
        })
      }

      setAnalyticsData(data)
    }

    generateTimeSeriesData()
    const interval = setInterval(generateTimeSeriesData, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [timeRange])

  // Generate agent performance data
  useEffect(() => {
    const performanceData: AgentPerformanceData[] = agents.map((agent) => ({
      agentId: agent.id,
      name: agent.name,
      type: agent.capabilities[0]?.type || "general",
      successRate: agent.performance.successRate * 100,
      efficiency: agent.performance.efficiency * 100,
      tasksCompleted: agent.performance.tasksCompleted,
      averageTime: Math.random() * 1000 + 500, // Mock average time
    }))

    setAgentPerformanceData(performanceData)
  }, [agents])

  // Update real-time metrics
  useEffect(() => {
    const updateRealTimeMetrics = () => {
      setRealTimeMetrics({
        activeUsers: Math.floor(Math.random() * 100) + 50,
        totalRequests: stats.total + Math.floor(Math.random() * 1000),
        averageResponseTime: Math.floor(Math.random() * 200) + 100,
        systemHealth: 90 + Math.random() * 10,
      })
    }

    updateRealTimeMetrics()
    const interval = setInterval(updateRealTimeMetrics, 5000)

    return () => clearInterval(interval)
  }, [stats])

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    if (timeRange === "1h") return date.toLocaleTimeString()
    if (timeRange === "24h") return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    return date.toLocaleDateString()
  }

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return "text-green-500"
    if (value >= thresholds.warning) return "text-yellow-500"
    return "text-red-500"
  }

  const pieChartData = [
    { name: "Completed", value: stats.completed, color: "#22c55e" },
    { name: "Running", value: stats.running, color: "#3b82f6" },
    { name: "Failed", value: stats.failed, color: "#ef4444" },
  ]

  const agentTypeData = agentPerformanceData.reduce(
    (acc, agent) => {
      const existing = acc.find((item) => item.type === agent.type)
      if (existing) {
        existing.count += 1
        existing.avgEfficiency = (existing.avgEfficiency + agent.efficiency) / 2
      } else {
        acc.push({
          type: agent.type,
          count: 1,
          avgEfficiency: agent.efficiency,
        })
      }
      return acc
    },
    [] as Array<{ type: string; count: number; avgEfficiency: number }>,
  )

  return (
    <div className="h-full p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Advanced Analytics Dashboard</h2>
          <p className="text-muted-foreground">Real-time insights and performance metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex border rounded-lg">
            {(["1h", "24h", "7d", "30d"] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="rounded-none first:rounded-l-lg last:rounded-r-lg"
              >
                {range}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Real-time Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{realTimeMetrics.activeUsers}</p>
                <p className="text-xs text-green-500 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12% from last hour
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold">{realTimeMetrics.totalRequests.toLocaleString()}</p>
                <p className="text-xs text-green-500 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +8% from yesterday
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                <p className="text-2xl font-bold">{realTimeMetrics.averageResponseTime}ms</p>
                <p className="text-xs text-red-500 flex items-center mt-1">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  +5ms from last hour
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">System Health</p>
                <p className="text-2xl font-bold">{realTimeMetrics.systemHealth.toFixed(1)}%</p>
                <Progress value={realTimeMetrics.systemHealth} className="mt-2" />
              </div>
              <div
                className={`h-8 w-8 ${realTimeMetrics.systemHealth > 95 ? "text-green-500" : realTimeMetrics.systemHealth > 85 ? "text-yellow-500" : "text-red-500"}`}
              >
                {realTimeMetrics.systemHealth > 95 ? (
                  <CheckCircle className="h-8 w-8" />
                ) : (
                  <AlertTriangle className="h-8 w-8" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="agents">Agent Analytics</TabsTrigger>
          <TabsTrigger value="tasks">Task Insights</TabsTrigger>
          <TabsTrigger value="network">Network Analysis</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>System Load Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" tickFormatter={formatTime} />
                    <YAxis />
                    <Tooltip labelFormatter={formatTime} />
                    <Area type="monotone" dataKey="systemLoad" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Time & Throughput</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" tickFormatter={formatTime} />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip labelFormatter={formatTime} />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="responseTime"
                      stroke="#ef4444"
                      name="Response Time (ms)"
                    />
                    <Line yAxisId="right" type="monotone" dataKey="taskThroughput" stroke="#22c55e" name="Throughput" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Agent Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" tickFormatter={formatTime} />
                    <YAxis />
                    <Tooltip labelFormatter={formatTime} />
                    <Area
                      type="monotone"
                      dataKey="agentUtilization"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Rate Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" tickFormatter={formatTime} />
                    <YAxis />
                    <Tooltip labelFormatter={formatTime} />
                    <Line type="monotone" dataKey="errorRate" stroke="#f59e0b" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Agent Performance Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={agentPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="successRate" fill="#22c55e" name="Success Rate %" />
                    <Bar dataKey="efficiency" fill="#3b82f6" name="Efficiency %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Agent Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={agentTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type, count }) => `${type}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {agentTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Agent Efficiency vs Tasks Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={agentPerformanceData}>
                    <CartesianGrid />
                    <XAxis dataKey="tasksCompleted" name="Tasks Completed" />
                    <YAxis dataKey="efficiency" name="Efficiency %" />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                    <Scatter dataKey="efficiency" fill="#8b5cf6" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Agent Capabilities Radar</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={agentPerformanceData.slice(0, 6)}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Success Rate"
                      dataKey="successRate"
                      stroke="#22c55e"
                      fill="#22c55e"
                      fillOpacity={0.3}
                    />
                    <Radar name="Efficiency" dataKey="efficiency" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Task Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Task Completion Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" tickFormatter={formatTime} />
                    <YAxis />
                    <Tooltip labelFormatter={formatTime} />
                    <Line type="monotone" dataKey="taskThroughput" stroke="#22c55e" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Task Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-500">{stats.completed}</p>
                    <p className="text-sm text-muted-foreground">Completed Tasks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-500">{stats.running}</p>
                    <p className="text-sm text-muted-foreground">Running Tasks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-500">{stats.failed}</p>
                    <p className="text-sm text-muted-foreground">Failed Tasks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-500">{stats.averageScore.toFixed(1)}</p>
                    <p className="text-sm text-muted-foreground">Avg Score</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Success Rate</span>
                    <span className="text-sm font-medium">
                      {stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <Progress value={stats.total > 0 ? (stats.completed / stats.total) * 100 : 0} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Task Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {executions.slice(0, 10).map((execution) => (
                    <div key={execution.id} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div className="flex-1">
                        <p className="text-sm font-medium truncate">{execution.user_input}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(execution.created_at).toLocaleString()}
                        </p>
                      </div>
                      <Badge
                        variant={
                          execution.status === "completed"
                            ? "default"
                            : execution.status === "failed"
                              ? "destructive"
                              : "secondary"
                        }
                        className="ml-2"
                      >
                        {execution.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="network" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Network Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" tickFormatter={formatTime} />
                    <YAxis />
                    <Tooltip labelFormatter={formatTime} />
                    <Area
                      type="monotone"
                      dataKey="agentUtilization"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Connection Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active Connections</span>
                    <Badge variant="default">{agents.length * 2}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Network Latency</span>
                    <span className="text-sm font-medium">12ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Bandwidth Usage</span>
                    <span className="text-sm font-medium">45%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Connection Stability</span>
                    <span className="text-sm font-medium text-green-500">99.8%</span>
                  </div>
                </div>
                <Progress value={99.8} className="mt-4" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Predicted System Load</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" tickFormatter={formatTime} />
                    <YAxis />
                    <Tooltip labelFormatter={formatTime} />
                    <Line
                      type="monotone"
                      dataKey="systemLoad"
                      stroke="#3b82f6"
                      strokeDasharray="5 5"
                      name="Predicted Load"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Capacity Planning</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Current Capacity</span>
                    <span className="text-sm font-medium">75%</span>
                  </div>
                  <Progress value={75} />

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Predicted Peak (24h)</span>
                    <span className="text-sm font-medium text-yellow-500">92%</span>
                  </div>
                  <Progress value={92} />

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Recommended Scaling</span>
                    <Badge variant="outline">+2 Agents</Badge>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <AlertTriangle className="h-4 w-4 inline mr-1" />
                    High load predicted in 6 hours. Consider scaling up.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
