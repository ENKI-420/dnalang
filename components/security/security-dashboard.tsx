"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, AlertTriangle, CheckCircle, Lock, Key, Eye, Activity, Users, Ban } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

interface SecurityEvent {
  id: string
  type: "login" | "logout" | "access_denied" | "permission_check" | "security_violation"
  userId: string
  userEmail: string
  timestamp: Date
  ipAddress: string
  userAgent: string
  resource?: string
  action?: string
  severity: "low" | "medium" | "high" | "critical"
}

interface SecurityMetrics {
  totalUsers: number
  activeUsers: number
  failedLogins: number
  securityViolations: number
  averageSessionDuration: number
  strongPasswordCompliance: number
}

export function SecurityDashboard() {
  const { userProfile, canAccess } = useAuth()
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([])
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalUsers: 0,
    activeUsers: 0,
    failedLogins: 0,
    securityViolations: 0,
    averageSessionDuration: 0,
    strongPasswordCompliance: 0,
  })
  const [loading, setLoading] = useState(true)

  // Check if user has security management permissions
  const canManageSecurity = canAccess("security", "manage")

  useEffect(() => {
    if (!canManageSecurity) return

    // Generate mock security data
    const generateSecurityEvents = () => {
      const events: SecurityEvent[] = []
      const eventTypes: SecurityEvent["type"][] = [
        "login",
        "logout",
        "access_denied",
        "permission_check",
        "security_violation",
      ]
      const severities: SecurityEvent["severity"][] = ["low", "medium", "high", "critical"]

      for (let i = 0; i < 50; i++) {
        events.push({
          id: `event-${i}`,
          type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
          userId: `user-${Math.floor(Math.random() * 20)}`,
          userEmail: `user${Math.floor(Math.random() * 20)}@example.com`,
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: "Mozilla/5.0 (compatible)",
          resource: Math.random() > 0.5 ? "agents" : "analytics",
          action: Math.random() > 0.5 ? "read" : "write",
          severity: severities[Math.floor(Math.random() * severities.length)],
        })
      }

      return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    }

    const generateMetrics = (): SecurityMetrics => ({
      totalUsers: 156,
      activeUsers: 89,
      failedLogins: 12,
      securityViolations: 3,
      averageSessionDuration: 45,
      strongPasswordCompliance: 87,
    })

    setSecurityEvents(generateSecurityEvents())
    setMetrics(generateMetrics())
    setLoading(false)
  }, [canManageSecurity])

  const getSeverityColor = (severity: SecurityEvent["severity"]) => {
    switch (severity) {
      case "critical":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getEventIcon = (type: SecurityEvent["type"]) => {
    switch (type) {
      case "login":
        return <Key className="h-4 w-4" />
      case "logout":
        return <Lock className="h-4 w-4" />
      case "access_denied":
        return <Ban className="h-4 w-4" />
      case "permission_check":
        return <Eye className="h-4 w-4" />
      case "security_violation":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  if (!canManageSecurity) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
          <p className="text-muted-foreground">You don't have permission to view security dashboard.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading security dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Security Dashboard</h2>
          <p className="text-muted-foreground">Monitor system security and user activity</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            <Shield className="h-3 w-3 mr-1" />
            Security Level: {userProfile?.securityLevel}
          </Badge>
          <Button variant="outline" size="sm">
            Generate Report
          </Button>
        </div>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{metrics.totalUsers}</p>
                <p className="text-xs text-green-500 flex items-center mt-1">
                  <Users className="h-3 w-3 mr-1" />
                  {metrics.activeUsers} active
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
                <p className="text-sm font-medium text-muted-foreground">Failed Logins</p>
                <p className="text-2xl font-bold">{metrics.failedLogins}</p>
                <p className="text-xs text-red-500 flex items-center mt-1">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Last 24h
                </p>
              </div>
              <Ban className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Security Violations</p>
                <p className="text-2xl font-bold">{metrics.securityViolations}</p>
                <p className="text-xs text-yellow-500 flex items-center mt-1">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Requires attention
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Password Compliance</p>
                <p className="text-2xl font-bold">{metrics.strongPasswordCompliance}%</p>
                <Progress value={metrics.strongPasswordCompliance} className="mt-2" />
              </div>
              <Lock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Events */}
      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="policies">Security Policies</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {securityEvents.slice(0, 20).map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {getEventIcon(event.type)}
                        <div
                          className={`w-2 h-2 rounded-full ${getSeverityColor(event.severity)}`}
                          title={`${event.severity} severity`}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium capitalize">{event.type.replace("_", " ")}</p>
                        <p className="text-xs text-muted-foreground">
                          {event.userEmail} • {event.ipAddress}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {event.timestamp.toLocaleDateString()} {event.timestamp.toLocaleTimeString()}
                      </p>
                      {event.resource && (
                        <Badge variant="outline" className="text-xs">
                          {event.action}:{event.resource}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Security Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p className="font-medium">Compliant Users</p>
                    <p className="text-2xl font-bold text-green-500">134</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                    <p className="font-medium">Needs Attention</p>
                    <p className="text-2xl font-bold text-yellow-500">18</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Ban className="h-8 w-8 mx-auto mb-2 text-red-500" />
                    <p className="font-medium">Suspended</p>
                    <p className="text-2xl font-bold text-red-500">4</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Policies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Password Policy</p>
                    <p className="text-sm text-muted-foreground">Minimum 8 characters, mixed case, numbers, symbols</p>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Session Timeout</p>
                    <p className="text-sm text-muted-foreground">Automatic logout after 30 minutes of inactivity</p>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Multi-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Required for admin and agent roles</p>
                  </div>
                  <Badge variant="secondary">Planned</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">IP Allowlist</p>
                    <p className="text-sm text-muted-foreground">Restrict access to approved IP ranges</p>
                  </div>
                  <Badge variant="outline">Optional</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
