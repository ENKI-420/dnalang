"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  BarChart,
  Bar,
} from "recharts"
import {
  Zap,
  Cpu,
  MemoryStickIcon as Memory,
  Network,
  Clock,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  MaximizeIcon as Optimize,
} from "lucide-react"
import { performanceMonitor } from "@/lib/performance/performance-monitor"
import { cacheManager } from "@/lib/performance/cache-manager"

export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [cacheStats, setCacheStats] = useState<any>({})
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const updateData = () => {
      // Get latest metrics
      const latestMetrics = [
        { name: "CPU Usage", value: performanceMonitor.getAverageMetric("cpu_usage", 60000), category: "cpu" },
        { name: "Memory Usage", value: performanceMonitor.getAverageMetric("heap_used", 60000), category: "memory" },
        { name: "Network RTT", value: performanceMonitor.getAverageMetric("network_rtt", 60000), category: "network" },
        { name: "Page Load", value: performanceMonitor.getAverageMetric("page_load", 300000), category: "render" },
        { name: "API Response", value: performanceMonitor.getAverageMetric("api_response", 300000), category: "api" },
      ]

      setMetrics(latestMetrics)
      setAlerts(performanceMonitor.getAlerts(true))
      setCacheStats(cacheManager.getStats())
      setRecommendations(performanceMonitor.getOptimizationRecommendations())
      setLoading(false)
    }

    updateData()
    const interval = setInterval(updateData, 5000)

    // Set up real-time metric updates
    const unsubscribeMetric = performanceMonitor.onMetric(() => {
      updateData()
    })

    const unsubscribeAlert = performanceMonitor.onAlert(() => {
      updateData()
    })

    return () => {
      clearInterval(interval)
      unsubscribeMetric()
      unsubscribeAlert()
    }
  }, [])

  const getMetricIcon = (category: string) => {
    switch (category) {
      case "cpu":
        return Cpu
      case "memory":
        return Memory
      case "network":
        return Network
      case "render":
        return Clock
      case "api":
        return Zap
      default:
        return Zap
    }
  }

  const getMetricColor = (category: string, value: number) => {
    const thresholds = {
      cpu: { warning: 70, critical: 90 },
      memory: { warning: 80, critical: 95 },
      network: { warning: 100, critical: 200 },
      render: { warning: 2500, critical: 4000 },
      api: { warning: 1000, critical: 3000 },
    }

    const threshold = thresholds[category as keyof typeof thresholds]
    if (!threshold) return "text-green-500"

    if (value >= threshold.critical) return "text-red-500"
    if (value >= threshold.warning) return "text-yellow-500"
    return "text-green-500"
  }

  const getProgressColor = (category: string, value: number) => {
    const color = getMetricColor(category, value)
    return color.includes("red") ? "bg-red-500" : color.includes("yellow") ? "bg-yellow-500" : "bg-green-500"
  }

  // Generate time series data for charts
  const generateTimeSeriesData = () => {
    const data = []
    const now = Date.now()

    for (let i = 23; i >= 0; i--) {
      const timestamp = now - i * 60000 // Last 24 minutes
      data.push({
        time: new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        cpu: Math.random() * 100,
        memory: 60 + Math.random() * 30,
        network: Math.random() * 200,
        api: 200 + Math.random() * 800,
      })
    }

    return data
  }

  const timeSeriesData = generateTimeSeriesData()

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading performance data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Dashboard</h2>
          <p className="text-muted-foreground">Real-time system performance monitoring and optimization</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            <Optimize className="h-3 w-3 mr-1" />
            Auto-Optimization: ON
          </Badge>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Performance Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {metrics.map((metric) => {
          const IconComponent = getMetricIcon(metric.category)
          const colorClass = getMetricColor(metric.category, metric.value)

          return (
            <Card key={metric.name}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <IconComponent className={`h-5 w-5 ${colorClass}`} />
                    <span className="font-medium text-sm">{metric.name}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-2xl font-bold ${colorClass}`}>
                      {metric.value.toFixed(metric.category === "render" || metric.category === "api" ? 0 : 1)}
                      {metric.category === "cpu" || metric.category === "memory"
                        ? "%"
                        : metric.category === "network" || metric.category === "render" || metric.category === "api"
                          ? "ms"
                          : ""}
                    </span>
                  </div>
                  <Progress value={Math.min(100, metric.value)} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {metric.value < (metric.category === "cpu" ? 70 : metric.category === "memory" ? 80 : 100)
                      ? "Normal"
                      : metric.value < (metric.category === "cpu" ? 90 : metric.category === "memory" ? 95 : 200)
                        ? "Warning"
                        : "Critical"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cache">Cache Performance</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>System Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="cpu" stroke="#3b82f6" name="CPU %" />
                    <Line type="monotone" dataKey="memory" stroke="#8b5cf6" name="Memory %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Time Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="api"
                      stroke="#22c55e"
                      fill="#22c55e"
                      fillOpacity={0.3}
                      name="API Response (ms)"
                    />
                    <Area
                      type="monotone"
                      dataKey="network"
                      stroke="#f59e0b"
                      fill="#f59e0b"
                      fillOpacity={0.3}
                      name="Network RTT (ms)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Cache Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Hit Rate</span>
                    <span className="font-medium">{cacheStats.hitRate?.toFixed(1) || 0}%</span>
                  </div>
                  <Progress value={cacheStats.hitRate || 0} className="h-2" />

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Entries</span>
                    <span className="font-medium">{cacheStats.totalEntries || 0}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Cache Size</span>
                    <span className="font-medium">
                      {cacheStats.totalSize ? (cacheStats.totalSize / 1024 / 1024).toFixed(2) : 0} MB
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Evictions</span>
                    <span className="font-medium">{cacheStats.evictions || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Cache Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={[
                      { name: "Hit Rate", value: cacheStats.hitRate || 0, color: "#22c55e" },
                      { name: "Miss Rate", value: cacheStats.missRate || 0, color: "#ef4444" },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {alerts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p>No active performance alerts</p>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        alert.severity === "critical"
                          ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                          : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <AlertTriangle
                          className={`h-5 w-5 ${alert.severity === "critical" ? "text-red-500" : "text-yellow-500"}`}
                        />
                        <div>
                          <p className="font-medium">{alert.metric}</p>
                          <p className="text-sm text-muted-foreground">
                            Value: {alert.value.toFixed(1)} | Threshold: {alert.threshold}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={alert.severity === "critical" ? "destructive" : "secondary"}>
                          {alert.severity}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Optimization Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p>System is running optimally</p>
                  </div>
                ) : (
                  recommendations.map((rec, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{rec.category}</h4>
                        <Badge
                          variant={
                            rec.priority === "high"
                              ? "destructive"
                              : rec.priority === "medium"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {rec.priority} priority
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{rec.issue}</p>
                      <p className="text-sm">{rec.recommendation}</p>
                      <Button size="sm" variant="outline" className="mt-2 bg-transparent">
                        Apply Fix
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
