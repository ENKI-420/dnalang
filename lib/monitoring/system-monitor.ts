import { databaseManager } from "@/lib/database/database-manager"
import { qnetIntegration } from "@/lib/qnet/qnet-integration"
import { performanceMonitor } from "@/lib/performance/performance-monitor"

export interface SystemHealthStatus {
  overall: "healthy" | "warning" | "critical" | "offline"
  components: {
    database: ComponentHealth
    qnet: ComponentHealth
    organisms: ComponentHealth
    consciousness: ComponentHealth
    performance: ComponentHealth
    security: ComponentHealth
  }
  metrics: {
    uptime: number
    responseTime: number
    errorRate: number
    activeUsers: number
    systemLoad: number
  }
  alerts: SystemAlert[]
}

export interface ComponentHealth {
  status: "healthy" | "warning" | "critical" | "offline"
  lastCheck: Date
  responseTime: number
  errorCount: number
  details: Record<string, any>
}

export interface SystemAlert {
  id: string
  component: string
  severity: "low" | "medium" | "high" | "critical"
  message: string
  timestamp: Date
  resolved: boolean
  metadata?: Record<string, any>
}

export class SystemMonitor {
  private static instance: SystemMonitor
  private healthStatus: SystemHealthStatus
  private alerts: SystemAlert[] = []
  private observers: ((status: SystemHealthStatus) => void)[] = []
  private monitoringInterval: NodeJS.Timeout | null = null

  static getInstance(): SystemMonitor {
    if (!SystemMonitor.instance) {
      SystemMonitor.instance = new SystemMonitor()
    }
    return SystemMonitor.instance
  }

  constructor() {
    this.healthStatus = this.initializeHealthStatus()
    this.startMonitoring()
  }

  private initializeHealthStatus(): SystemHealthStatus {
    return {
      overall: "healthy",
      components: {
        database: this.createComponentHealth(),
        qnet: this.createComponentHealth(),
        organisms: this.createComponentHealth(),
        consciousness: this.createComponentHealth(),
        performance: this.createComponentHealth(),
        security: this.createComponentHealth(),
      },
      metrics: {
        uptime: 0,
        responseTime: 0,
        errorRate: 0,
        activeUsers: 0,
        systemLoad: 0,
      },
      alerts: [],
    }
  }

  private createComponentHealth(): ComponentHealth {
    return {
      status: "healthy",
      lastCheck: new Date(),
      responseTime: 0,
      errorCount: 0,
      details: {},
    }
  }

  private startMonitoring() {
    // Initial health check
    this.performHealthCheck()

    // Set up periodic monitoring
    this.monitoringInterval = setInterval(() => {
      this.performHealthCheck()
    }, 30000) // Check every 30 seconds
  }

  private async performHealthCheck() {
    try {
      const startTime = Date.now()

      // Check all components in parallel
      const [databaseHealth, qnetHealth, organismsHealth, consciousnessHealth, performanceHealth, securityHealth] =
        await Promise.allSettled([
          this.checkDatabaseHealth(),
          this.checkQNETHealth(),
          this.checkOrganismsHealth(),
          this.checkConsciousnessHealth(),
          this.checkPerformanceHealth(),
          this.checkSecurityHealth(),
        ])

      // Update component health statuses
      this.healthStatus.components.database = this.extractResult(databaseHealth)
      this.healthStatus.components.qnet = this.extractResult(qnetHealth)
      this.healthStatus.components.organisms = this.extractResult(organismsHealth)
      this.healthStatus.components.consciousness = this.extractResult(consciousnessHealth)
      this.healthStatus.components.performance = this.extractResult(performanceHealth)
      this.healthStatus.components.security = this.extractResult(securityHealth)

      // Calculate overall system health
      this.healthStatus.overall = this.calculateOverallHealth()

      // Update system metrics
      this.healthStatus.metrics = {
        uptime: Date.now() - startTime,
        responseTime: Date.now() - startTime,
        errorRate: this.calculateErrorRate(),
        activeUsers: await this.getActiveUserCount(),
        systemLoad: this.calculateSystemLoad(),
      }

      // Update alerts
      this.healthStatus.alerts = this.alerts.filter((alert) => !alert.resolved).slice(0, 10)

      // Notify observers
      this.notifyObservers()
    } catch (error) {
      console.error("[System Monitor] Health check failed:", error)
      this.createAlert("system", "critical", "System health check failed", { error: error.message })
    }
  }

  private extractResult(result: PromiseSettledResult<ComponentHealth>): ComponentHealth {
    if (result.status === "fulfilled") {
      return result.value
    } else {
      return {
        status: "critical",
        lastCheck: new Date(),
        responseTime: 0,
        errorCount: 1,
        details: { error: result.reason?.message || "Unknown error" },
      }
    }
  }

  private async checkDatabaseHealth(): Promise<ComponentHealth> {
    const startTime = Date.now()
    try {
      const result = await databaseManager.getSystemMetrics()
      const responseTime = Date.now() - startTime

      return {
        status: result.success ? "healthy" : "critical",
        lastCheck: new Date(),
        responseTime,
        errorCount: result.success ? 0 : 1,
        details: result.data || { error: result.error },
      }
    } catch (error) {
      return {
        status: "critical",
        lastCheck: new Date(),
        responseTime: Date.now() - startTime,
        errorCount: 1,
        details: { error: error.message },
      }
    }
  }

  private async checkQNETHealth(): Promise<ComponentHealth> {
    const startTime = Date.now()
    try {
      const networkStatus = qnetIntegration.getNetworkStatus()
      const responseTime = Date.now() - startTime

      const status =
        networkStatus.networkHealth > 80 ? "healthy" : networkStatus.networkHealth > 50 ? "warning" : "critical"

      return {
        status,
        lastCheck: new Date(),
        responseTime,
        errorCount: 0,
        details: networkStatus,
      }
    } catch (error) {
      return {
        status: "critical",
        lastCheck: new Date(),
        responseTime: Date.now() - startTime,
        errorCount: 1,
        details: { error: error.message },
      }
    }
  }

  private async checkOrganismsHealth(): Promise<ComponentHealth> {
    const startTime = Date.now()
    try {
      // Check organism deployment status
      const result = await databaseManager.getSystemMetrics()
      const responseTime = Date.now() - startTime

      if (!result.success) {
        return {
          status: "critical",
          lastCheck: new Date(),
          responseTime,
          errorCount: 1,
          details: { error: result.error },
        }
      }

      const runningOrganisms = result.data.deployments?.running || 0
      const totalOrganisms = Object.values(result.data.deployments || {}).reduce(
        (sum: number, count) => sum + (count as number),
        0,
      )

      const healthRatio = totalOrganisms > 0 ? runningOrganisms / totalOrganisms : 1
      const status = healthRatio > 0.8 ? "healthy" : healthRatio > 0.5 ? "warning" : "critical"

      return {
        status,
        lastCheck: new Date(),
        responseTime,
        errorCount: 0,
        details: {
          runningOrganisms,
          totalOrganisms,
          healthRatio,
        },
      }
    } catch (error) {
      return {
        status: "critical",
        lastCheck: new Date(),
        responseTime: Date.now() - startTime,
        errorCount: 1,
        details: { error: error.message },
      }
    }
  }

  private async checkConsciousnessHealth(): Promise<ComponentHealth> {
    const startTime = Date.now()
    try {
      const result = await databaseManager.getSystemMetrics()
      const responseTime = Date.now() - startTime

      if (!result.success) {
        return {
          status: "warning",
          lastCheck: new Date(),
          responseTime,
          errorCount: 1,
          details: { error: result.error },
        }
      }

      const avgConsciousness = result.data.avgConsciousness || 0
      const status = avgConsciousness > 0.8 ? "healthy" : avgConsciousness > 0.5 ? "warning" : "critical"

      return {
        status,
        lastCheck: new Date(),
        responseTime,
        errorCount: 0,
        details: {
          averageConsciousness: avgConsciousness,
          emergenceRate: avgConsciousness * 100,
        },
      }
    } catch (error) {
      return {
        status: "warning",
        lastCheck: new Date(),
        responseTime: Date.now() - startTime,
        errorCount: 1,
        details: { error: error.message },
      }
    }
  }

  private async checkPerformanceHealth(): Promise<ComponentHealth> {
    const startTime = Date.now()
    try {
      const cpuUsage = performanceMonitor.getAverageMetric("cpu_usage", 60000)
      const memoryUsage = performanceMonitor.getAverageMetric("heap_used", 60000)
      const responseTime = Date.now() - startTime

      const maxUsage = Math.max(cpuUsage, memoryUsage)
      const status = maxUsage < 70 ? "healthy" : maxUsage < 90 ? "warning" : "critical"

      return {
        status,
        lastCheck: new Date(),
        responseTime,
        errorCount: 0,
        details: {
          cpuUsage,
          memoryUsage,
          alerts: performanceMonitor.getAlerts(true).length,
        },
      }
    } catch (error) {
      return {
        status: "warning",
        lastCheck: new Date(),
        responseTime: Date.now() - startTime,
        errorCount: 1,
        details: { error: error.message },
      }
    }
  }

  private async checkSecurityHealth(): Promise<ComponentHealth> {
    const startTime = Date.now()
    try {
      // Mock security health check
      const responseTime = Date.now() - startTime

      return {
        status: "healthy",
        lastCheck: new Date(),
        responseTime,
        errorCount: 0,
        details: {
          authenticationActive: true,
          encryptionEnabled: true,
          securityViolations: 0,
        },
      }
    } catch (error) {
      return {
        status: "warning",
        lastCheck: new Date(),
        responseTime: Date.now() - startTime,
        errorCount: 1,
        details: { error: error.message },
      }
    }
  }

  private calculateOverallHealth(): SystemHealthStatus["overall"] {
    const components = Object.values(this.healthStatus.components)
    const criticalCount = components.filter((c) => c.status === "critical").length
    const warningCount = components.filter((c) => c.status === "warning").length

    if (criticalCount > 0) return "critical"
    if (warningCount > 1) return "warning"
    if (warningCount > 0) return "warning"
    return "healthy"
  }

  private calculateErrorRate(): number {
    const components = Object.values(this.healthStatus.components)
    const totalErrors = components.reduce((sum, c) => sum + c.errorCount, 0)
    return (totalErrors / components.length) * 100
  }

  private async getActiveUserCount(): Promise<number> {
    // Mock implementation - in real app, query active sessions
    return Math.floor(Math.random() * 100) + 50
  }

  private calculateSystemLoad(): number {
    const cpuUsage = performanceMonitor.getAverageMetric("cpu_usage", 60000)
    const memoryUsage = performanceMonitor.getAverageMetric("heap_used", 60000)
    return (cpuUsage + memoryUsage) / 2
  }

  private createAlert(
    component: string,
    severity: SystemAlert["severity"],
    message: string,
    metadata?: Record<string, any>,
  ) {
    const alert: SystemAlert = {
      id: `${component}-${Date.now()}`,
      component,
      severity,
      message,
      timestamp: new Date(),
      resolved: false,
      metadata,
    }

    this.alerts.unshift(alert)

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts.pop()
    }
  }

  private notifyObservers() {
    this.observers.forEach((observer) => observer(this.healthStatus))
  }

  // Public API
  getHealthStatus(): SystemHealthStatus {
    return { ...this.healthStatus }
  }

  getAlerts(unresolved = false): SystemAlert[] {
    return unresolved ? this.alerts.filter((a) => !a.resolved) : [...this.alerts]
  }

  resolveAlert(alertId: string) {
    const alert = this.alerts.find((a) => a.id === alertId)
    if (alert) {
      alert.resolved = true
    }
  }

  subscribe(callback: (status: SystemHealthStatus) => void) {
    this.observers.push(callback)
    return () => {
      const index = this.observers.indexOf(callback)
      if (index > -1) {
        this.observers.splice(index, 1)
      }
    }
  }

  destroy() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }
    this.observers = []
  }
}

// Singleton instance
export const systemMonitor = SystemMonitor.getInstance()
