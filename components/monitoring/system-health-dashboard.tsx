"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Database,
  Network,
  Brain,
  Shield,
  Zap,
  Users,
  Clock,
  RefreshCw,
} from "lucide-react"
import { systemMonitor, type SystemHealthStatus } from "@/lib/monitoring/system-monitor"

export function SystemHealthDashboard() {
  const [healthStatus, setHealthStatus] = useState<SystemHealthStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    // Get initial status
    setHealthStatus(systemMonitor.getHealthStatus())
    setLoading(false)

    // Subscribe to updates
    const unsubscribe = systemMonitor.subscribe((status) => {
      setHealthStatus(status)
      setLastUpdate(new Date())
    })

    return unsubscribe
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-500"
      case "warning":
        return "text-yellow-500"
      case "critical":
        return "text-red-500"
      case "offline":
        return "text-gray-500"
      default:
        return "text-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "critical":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "offline":
        return <Activity className="h-5 w-5 text-gray-500" />
      default:
        return <Activity className="h-5 w-5 text-gray-500" />
    }
  }

  const getComponentIcon = (component: string) => {
    switch (component) {
      case "database":
        return <Database className="h-5 w-5" />
      case "qnet":
        return <Network className="h-5 w-5" />
      case "organisms":
        return <Brain className="h-5 w-5" />
      case "consciousness":
        return <Brain className="h-5 w-5" />
      case "performance":
        return <Zap className="h-5 w-5" />
      case "security":
        return <Shield className="h-5 w-5" />
      default:
        return <Activity className="h-5 w-5" />
    }
  }

  const resolveAlert = async (alertId: string) => {
    try {
      await fetch("/api/monitoring/alerts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId }),
      })
    } catch (error) {
      console.error("Failed to resolve alert:", error)
    }
  }

  if (loading || !healthStatus) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading system health...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Health Dashboard</h2>
          <p className="text-muted-foreground">Comprehensive monitoring for quantum chat DNA platform</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Overall Status</p>
            <div className="flex items-center space-x-2">
              {getStatusIcon(healthStatus.overall)}
              <span className={`text-lg font-bold capitalize ${getStatusColor(healthStatus.overall)}`}>
                {healthStatus.overall}
              </span>
            </div>
          </div>
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            Updated: {lastUpdate.toLocaleTimeString()}
          </Badge>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Response Time</p>
                <p className="text-2xl font-bold">{healthStatus.metrics.responseTime}ms</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{healthStatus.metrics.activeUsers}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">System Load</p>
                <p className="text-2xl font-bold">{healthStatus.metrics.systemLoad.toFixed(1)}%</p>
              </div>
              <Zap className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Error Rate</p>
                <p className="text-2xl font-bold">{healthStatus.metrics.errorRate.toFixed(1)}%</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Uptime</p>
                <p className="text-2xl font-bold">{Math.floor(healthStatus.metrics.uptime / 1000)}s</p>
              </div>
              <Activity className="h-8 w-8 text-cyan-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Component Health */}
      <Tabs defaultValue="components" className="space-y-4">
        <TabsList>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="alerts">Alerts ({healthStatus.alerts.length})</TabsTrigger>
          <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="components" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(healthStatus.components).map(([name, component]) => (
              <Card key={name}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getComponentIcon(name)}
                      <span className="capitalize">{name}</span>
                    </div>
                    {getStatusIcon(component.status)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Response Time</span>
                      <span>{component.responseTime}ms</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Error Count</span>
                      <span>{component.errorCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Last Check</span>
                      <span>{component.lastCheck.toLocaleTimeString()}</span>
                    </div>
                    {Object.keys(component.details).length > 0 && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-1">Details:</p>
                        <div className="text-xs space-y-1">
                          {Object.entries(component.details).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span>{key}:</span>
                              <span>{typeof value === "object" ? JSON.stringify(value) : String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {healthStatus.alerts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p>No active alerts</p>
                  </div>
                ) : (
                  healthStatus.alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        alert.severity === "critical"
                          ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                          : alert.severity === "high"
                            ? "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800"
                            : alert.severity === "medium"
                              ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                              : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge
                            variant={
                              alert.severity === "critical"
                                ? "destructive"
                                : alert.severity === "high"
                                  ? "destructive"
                                  : alert.severity === "medium"
                                    ? "default"
                                    : "secondary"
                            }
                          >
                            {alert.severity}
                          </Badge>
                          <span className="text-sm font-medium">{alert.component}</span>
                        </div>
                        <p className="text-sm">{alert.message}</p>
                        <p className="text-xs text-muted-foreground">{alert.timestamp.toLocaleString()}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => resolveAlert(alert.id)}>
                        Resolve
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>System Load</span>
                    <span>{healthStatus.metrics.systemLoad.toFixed(1)}%</span>
                  </div>
                  <Progress value={healthStatus.metrics.systemLoad} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Error Rate</span>
                    <span>{healthStatus.metrics.errorRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={healthStatus.metrics.errorRate} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Response Time</span>
                    <span>{healthStatus.metrics.responseTime}ms</span>
                  </div>
                  <Progress value={Math.min(100, healthStatus.metrics.responseTime / 10)} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Component Status Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(
                    Object.values(healthStatus.components).reduce(
                      (acc, comp) => {
                        acc[comp.status] = (acc[comp.status] || 0) + 1
                        return acc
                      },
                      {} as Record<string, number>,
                    ),
                  ).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(status)}
                        <span className="capitalize">{status}</span>
                      </div>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
