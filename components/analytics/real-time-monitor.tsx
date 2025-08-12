"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Cpu,
  MemoryStickIcon as Memory,
  Network,
  HardDrive,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
} from "lucide-react"

interface SystemMetrics {
  cpu: number
  memory: number
  network: number
  storage: number
  temperature: number
  uptime: number
}

interface AlertItem {
  id: string
  type: "warning" | "error" | "info"
  message: string
  timestamp: Date
  resolved: boolean
}

export function RealTimeMonitor() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 0,
    memory: 0,
    network: 0,
    storage: 0,
    temperature: 0,
    uptime: 0,
  })

  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [isConnected, setIsConnected] = useState(true)
  const metricsHistory = useRef<SystemMetrics[]>([])

  // Simulate real-time metrics updates
  useEffect(() => {
    const updateMetrics = () => {
      const newMetrics: SystemMetrics = {
        cpu: Math.max(0, Math.min(100, metrics.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(0, Math.min(100, metrics.memory + (Math.random() - 0.5) * 5)),
        network: Math.max(0, Math.min(100, 20 + Math.random() * 60)),
        storage: Math.max(0, Math.min(100, 45 + Math.random() * 10)),
        temperature: Math.max(30, Math.min(80, 45 + Math.random() * 20)),
        uptime: metrics.uptime + 1,
      }

      setMetrics(newMetrics)

      // Keep history for sparklines
      metricsHistory.current.push(newMetrics)
      if (metricsHistory.current.length > 50) {
        metricsHistory.current.shift()
      }

      // Generate alerts based on thresholds
      if (newMetrics.cpu > 90 && !alerts.some((a) => a.type === "error" && a.message.includes("CPU"))) {
        addAlert("error", "High CPU usage detected: " + newMetrics.cpu.toFixed(1) + "%")
      }

      if (newMetrics.memory > 85 && !alerts.some((a) => a.type === "warning" && a.message.includes("Memory"))) {
        addAlert("warning", "Memory usage is high: " + newMetrics.memory.toFixed(1) + "%")
      }

      if (
        newMetrics.temperature > 70 &&
        !alerts.some((a) => a.type === "warning" && a.message.includes("Temperature"))
      ) {
        addAlert("warning", "System temperature elevated: " + newMetrics.temperature.toFixed(1) + "°C")
      }
    }

    const interval = setInterval(updateMetrics, 2000)
    return () => clearInterval(interval)
  }, [metrics, alerts])

  const addAlert = (type: AlertItem["type"], message: string) => {
    const newAlert: AlertItem = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date(),
      resolved: false,
    }

    setAlerts((prev) => [newAlert, ...prev.slice(0, 9)]) // Keep only 10 most recent
  }

  const resolveAlert = (alertId: string) => {
    setAlerts((prev) => prev.map((alert) => (alert.id === alertId ? { ...alert, resolved: true } : alert)))
  }

  const getStatusColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return "text-red-500"
    if (value >= thresholds.warning) return "text-yellow-500"
    return "text-green-500"
  }

  const getProgressColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return "bg-red-500"
    if (value >= thresholds.warning) return "bg-yellow-500"
    return "bg-green-500"
  }

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  return (
    <div className="h-full p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Real-Time System Monitor</h2>
          <p className="text-muted-foreground">Live system performance and health monitoring</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <div className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"} animate-pulse`} />
            <span className="text-sm text-muted-foreground">{isConnected ? "Connected" : "Disconnected"}</span>
          </div>
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            Uptime: {formatUptime(metrics.uptime)}
          </Badge>
        </div>
      </div>

      {/* System Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Cpu className="h-5 w-5 text-blue-500" />
                <span className="font-medium">CPU Usage</span>
              </div>
              <span className={`text-lg font-bold ${getStatusColor(metrics.cpu, { warning: 70, critical: 90 })}`}>
                {metrics.cpu.toFixed(1)}%
              </span>
            </div>
            <Progress value={metrics.cpu} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {metrics.cpu < 70 ? "Normal" : metrics.cpu < 90 ? "High" : "Critical"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Memory className="h-5 w-5 text-green-500" />
                <span className="font-medium">Memory</span>
              </div>
              <span className={`text-lg font-bold ${getStatusColor(metrics.memory, { warning: 80, critical: 95 })}`}>
                {metrics.memory.toFixed(1)}%
              </span>
            </div>
            <Progress value={metrics.memory} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {metrics.memory < 80 ? "Normal" : metrics.memory < 95 ? "High" : "Critical"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Network className="h-5 w-5 text-purple-500" />
                <span className="font-medium">Network</span>
              </div>
              <span className={`text-lg font-bold ${getStatusColor(metrics.network, { warning: 80, critical: 95 })}`}>
                {metrics.network.toFixed(1)}%
              </span>
            </div>
            <Progress value={metrics.network} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {metrics.network < 80 ? "Normal" : metrics.network < 95 ? "High" : "Critical"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <HardDrive className="h-5 w-5 text-orange-500" />
                <span className="font-medium">Storage</span>
              </div>
              <span className={`text-lg font-bold ${getStatusColor(metrics.storage, { warning: 85, critical: 95 })}`}>
                {metrics.storage.toFixed(1)}%
              </span>
            </div>
            <Progress value={metrics.storage} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {metrics.storage < 85 ? "Normal" : metrics.storage < 95 ? "High" : "Critical"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Temperature */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p>No active alerts</p>
                </div>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      alert.resolved
                        ? "bg-muted/50 opacity-60"
                        : alert.type === "error"
                          ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                          : alert.type === "warning"
                            ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                            : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                    }`}
                  >
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium ${
                          alert.type === "error"
                            ? "text-red-800 dark:text-red-200"
                            : alert.type === "warning"
                              ? "text-yellow-800 dark:text-yellow-200"
                              : "text-blue-800 dark:text-blue-200"
                        }`}
                      >
                        {alert.message}
                      </p>
                      <p className="text-xs text-muted-foreground">{alert.timestamp.toLocaleTimeString()}</p>
                    </div>
                    {!alert.resolved && (
                      <Button size="sm" variant="outline" onClick={() => resolveAlert(alert.id)}>
                        Resolve
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              System Temperature
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="text-4xl font-bold">
                  <span className={getStatusColor(metrics.temperature, { warning: 60, critical: 70 })}>
                    {metrics.temperature.toFixed(1)}°C
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {metrics.temperature < 60 ? "Normal" : metrics.temperature < 70 ? "Warm" : "Hot"}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Temperature</span>
                  <span>{metrics.temperature.toFixed(1)}°C</span>
                </div>
                <Progress value={((metrics.temperature - 30) / 50) * 100} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>30°C</span>
                  <span>80°C</span>
                </div>
              </div>

              <div className="pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Fan Speed</span>
                  <span>{Math.round(metrics.temperature * 20)}RPM</span>
                </div>
                <div className="flex justify-between">
                  <span>Thermal State</span>
                  <Badge
                    variant={
                      metrics.temperature > 70 ? "destructive" : metrics.temperature > 60 ? "secondary" : "default"
                    }
                  >
                    {metrics.temperature > 70 ? "Critical" : metrics.temperature > 60 ? "Elevated" : "Normal"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
