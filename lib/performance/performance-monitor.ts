"use client"

interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  category: "cpu" | "memory" | "network" | "render" | "api" | "database"
}

interface PerformanceThreshold {
  warning: number
  critical: number
}

interface PerformanceAlert {
  id: string
  metric: string
  value: number
  threshold: number
  severity: "warning" | "critical"
  timestamp: number
  resolved: boolean
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, PerformanceMetric[]> = new Map()
  private thresholds: Map<string, PerformanceThreshold> = new Map()
  private alerts: PerformanceAlert[] = []
  private observers: ((metric: PerformanceMetric) => void)[] = []
  private alertObservers: ((alert: PerformanceAlert) => void)[] = []

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  constructor() {
    this.initializeThresholds()
    this.startPerformanceObserver()
    this.startResourceMonitoring()
  }

  private initializeThresholds() {
    this.thresholds.set("cpu", { warning: 70, critical: 90 })
    this.thresholds.set("memory", { warning: 80, critical: 95 })
    this.thresholds.set("network", { warning: 80, critical: 95 })
    this.thresholds.set("render", { warning: 16, critical: 33 }) // Frame time in ms
    this.thresholds.set("api", { warning: 1000, critical: 3000 }) // Response time in ms
    this.thresholds.set("database", { warning: 500, critical: 2000 }) // Query time in ms
  }

  private startPerformanceObserver() {
    if (typeof window === "undefined") return

    // Web Vitals monitoring
    if ("PerformanceObserver" in window) {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric("lcp", entry.startTime, "render")
        }
      })
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] })

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric("fid", (entry as any).processingStart - entry.startTime, "render")
        }
      })
      fidObserver.observe({ entryTypes: ["first-input"] })

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
          }
        }
        this.recordMetric("cls", clsValue * 1000, "render") // Convert to ms equivalent
      })
      clsObserver.observe({ entryTypes: ["layout-shift"] })

      // Navigation timing
      const navigationObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const navEntry = entry as PerformanceNavigationTiming
          this.recordMetric("dom_load", navEntry.domContentLoadedEventEnd - navEntry.navigationStart, "render")
          this.recordMetric("page_load", navEntry.loadEventEnd - navEntry.navigationStart, "render")
        }
      })
      navigationObserver.observe({ entryTypes: ["navigation"] })
    }
  }

  private startResourceMonitoring() {
    if (typeof window === "undefined") return

    // Memory monitoring
    setInterval(() => {
      if ("memory" in performance) {
        const memory = (performance as any).memory
        this.recordMetric("heap_used", (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100, "memory")
        this.recordMetric("heap_total", (memory.totalJSHeapSize / memory.jsHeapSizeLimit) * 100, "memory")
      }
    }, 5000)

    // Network monitoring
    if ("connection" in navigator) {
      const connection = (navigator as any).connection
      setInterval(() => {
        this.recordMetric("network_speed", connection.downlink || 0, "network")
        this.recordMetric("network_rtt", connection.rtt || 0, "network")
      }, 10000)
    }

    // CPU monitoring (approximation using frame timing)
    let lastFrameTime = performance.now()
    const measureCPU = () => {
      const currentTime = performance.now()
      const frameTime = currentTime - lastFrameTime
      lastFrameTime = currentTime

      // Estimate CPU usage based on frame timing
      const cpuUsage = Math.min(100, Math.max(0, ((frameTime - 16.67) / 16.67) * 100))
      this.recordMetric("cpu_usage", cpuUsage, "cpu")

      requestAnimationFrame(measureCPU)
    }
    requestAnimationFrame(measureCPU)
  }

  recordMetric(name: string, value: number, category: PerformanceMetric["category"]) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      category,
    }

    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }

    const metricHistory = this.metrics.get(name)!
    metricHistory.push(metric)

    // Keep only last 100 entries per metric
    if (metricHistory.length > 100) {
      metricHistory.shift()
    }

    // Check thresholds and create alerts
    this.checkThresholds(metric)

    // Notify observers
    this.observers.forEach((observer) => observer(metric))
  }

  private checkThresholds(metric: PerformanceMetric) {
    const threshold = this.thresholds.get(metric.name) || this.thresholds.get(metric.category)
    if (!threshold) return

    let severity: "warning" | "critical" | null = null
    let thresholdValue = 0

    if (metric.value >= threshold.critical) {
      severity = "critical"
      thresholdValue = threshold.critical
    } else if (metric.value >= threshold.warning) {
      severity = "warning"
      thresholdValue = threshold.warning
    }

    if (severity) {
      const alert: PerformanceAlert = {
        id: `${metric.name}-${Date.now()}`,
        metric: metric.name,
        value: metric.value,
        threshold: thresholdValue,
        severity,
        timestamp: metric.timestamp,
        resolved: false,
      }

      this.alerts.unshift(alert)

      // Keep only last 50 alerts
      if (this.alerts.length > 50) {
        this.alerts.pop()
      }

      // Notify alert observers
      this.alertObservers.forEach((observer) => observer(alert))
    }
  }

  // API timing helper
  async measureApiCall<T>(name: string, apiCall: () => Promise<T>): Promise<T> {
    const startTime = performance.now()
    try {
      const result = await apiCall()
      const endTime = performance.now()
      this.recordMetric(name, endTime - startTime, "api")
      return result
    } catch (error) {
      const endTime = performance.now()
      this.recordMetric(`${name}_error`, endTime - startTime, "api")
      throw error
    }
  }

  // Database query timing helper
  async measureDatabaseQuery<T>(name: string, query: () => Promise<T>): Promise<T> {
    const startTime = performance.now()
    try {
      const result = await query()
      const endTime = performance.now()
      this.recordMetric(name, endTime - startTime, "database")
      return result
    } catch (error) {
      const endTime = performance.now()
      this.recordMetric(`${name}_error`, endTime - startTime, "database")
      throw error
    }
  }

  // Get metrics
  getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.get(name) || []
    }

    const allMetrics: PerformanceMetric[] = []
    this.metrics.forEach((metrics) => allMetrics.push(...metrics))
    return allMetrics.sort((a, b) => b.timestamp - a.timestamp)
  }

  getLatestMetric(name: string): PerformanceMetric | null {
    const metrics = this.metrics.get(name)
    return metrics && metrics.length > 0 ? metrics[metrics.length - 1] : null
  }

  getAverageMetric(name: string, timeWindow = 60000): number {
    const metrics = this.metrics.get(name) || []
    const cutoff = Date.now() - timeWindow
    const recentMetrics = metrics.filter((m) => m.timestamp > cutoff)

    if (recentMetrics.length === 0) return 0

    return recentMetrics.reduce((sum, m) => sum + m.value, 0) / recentMetrics.length
  }

  getAlerts(unresolved = false): PerformanceAlert[] {
    return unresolved ? this.alerts.filter((a) => !a.resolved) : this.alerts
  }

  resolveAlert(alertId: string) {
    const alert = this.alerts.find((a) => a.id === alertId)
    if (alert) {
      alert.resolved = true
    }
  }

  // Observer pattern for real-time updates
  onMetric(callback: (metric: PerformanceMetric) => void) {
    this.observers.push(callback)
    return () => {
      const index = this.observers.indexOf(callback)
      if (index > -1) {
        this.observers.splice(index, 1)
      }
    }
  }

  onAlert(callback: (alert: PerformanceAlert) => void) {
    this.alertObservers.push(callback)
    return () => {
      const index = this.alertObservers.indexOf(callback)
      if (index > -1) {
        this.alertObservers.splice(index, 1)
      }
    }
  }

  // Performance optimization recommendations
  getOptimizationRecommendations(): Array<{
    category: string
    issue: string
    recommendation: string
    priority: "high" | "medium" | "low"
  }> {
    const recommendations = []

    // Check memory usage
    const memoryUsage = this.getAverageMetric("heap_used", 300000) // 5 minutes
    if (memoryUsage > 80) {
      recommendations.push({
        category: "Memory",
        issue: `High memory usage: ${memoryUsage.toFixed(1)}%`,
        recommendation: "Consider implementing memory cleanup, reducing cache size, or optimizing data structures",
        priority: memoryUsage > 90 ? "high" : ("medium" as const),
      })
    }

    // Check API response times
    const apiMetrics = this.getMetrics().filter((m) => m.category === "api")
    const slowApis = apiMetrics.filter((m) => m.value > 1000)
    if (slowApis.length > 0) {
      recommendations.push({
        category: "API Performance",
        issue: `${slowApis.length} slow API calls detected`,
        recommendation: "Implement caching, optimize database queries, or add request debouncing",
        priority: "medium",
      })
    }

    // Check render performance
    const renderTime = this.getAverageMetric("lcp", 60000)
    if (renderTime > 2500) {
      recommendations.push({
        category: "Rendering",
        issue: `Slow page load time: ${renderTime.toFixed(0)}ms`,
        recommendation: "Optimize images, implement code splitting, or use lazy loading",
        priority: "high",
      })
    }

    return recommendations
  }
}

// Singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance()
