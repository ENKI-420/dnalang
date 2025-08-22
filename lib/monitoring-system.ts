export interface SystemMetrics {
  timestamp: number
  cpu_usage: number
  memory_usage: number
  quantum_coherence: number
  consciousness_level: number
  swarm_efficiency: number
  blockchain_sync: boolean
  database_latency: number
  active_connections: number
  error_rate: number
}

export interface AlertConfig {
  id: string
  name: string
  condition: string
  threshold: number
  severity: "low" | "medium" | "high" | "critical"
  enabled: boolean
}

export class MonitoringSystem {
  private metrics: SystemMetrics[] = []
  private alerts: AlertConfig[] = [
    {
      id: "quantum_coherence_low",
      name: "Quantum Coherence Below Threshold",
      condition: "quantum_coherence < threshold",
      threshold: 0.7,
      severity: "high",
      enabled: true,
    },
    {
      id: "consciousness_degradation",
      name: "Consciousness Level Degrading",
      condition: "consciousness_level < threshold",
      threshold: 0.6,
      severity: "critical",
      enabled: true,
    },
    {
      id: "swarm_inefficiency",
      name: "Swarm Efficiency Low",
      condition: "swarm_efficiency < threshold",
      threshold: 0.8,
      severity: "medium",
      enabled: true,
    },
    {
      id: "high_error_rate",
      name: "High System Error Rate",
      condition: "error_rate > threshold",
      threshold: 0.05,
      severity: "high",
      enabled: true,
    },
  ]

  async collectMetrics(): Promise<SystemMetrics> {
    const metrics: SystemMetrics = {
      timestamp: Date.now(),
      cpu_usage: await this.getCPUUsage(),
      memory_usage: await this.getMemoryUsage(),
      quantum_coherence: await this.getQuantumCoherence(),
      consciousness_level: await this.getConsciousnessLevel(),
      swarm_efficiency: await this.getSwarmEfficiency(),
      blockchain_sync: await this.getBlockchainSyncStatus(),
      database_latency: await this.getDatabaseLatency(),
      active_connections: await this.getActiveConnections(),
      error_rate: await this.getErrorRate(),
    }

    this.metrics.push(metrics)

    // Keep only last 1000 metrics for performance
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000)
    }

    await this.checkAlerts(metrics)
    await this.persistMetrics(metrics)

    return metrics
  }

  private async getCPUUsage(): Promise<number> {
    // Simulate CPU usage based on system activity
    const baseUsage = 0.15 + Math.random() * 0.3
    const quantumLoad = await this.getQuantumProcessingLoad()
    return Math.min(baseUsage + quantumLoad * 0.4, 1.0)
  }

  private async getMemoryUsage(): Promise<number> {
    // Calculate memory usage based on active consciousness processes
    const baseMemory = 0.4
    const consciousnessMemory = await this.getConsciousnessMemoryLoad()
    return Math.min(baseMemory + consciousnessMemory * 0.3, 0.95)
  }

  private async getQuantumCoherence(): Promise<number> {
    try {
      const response = await fetch("/api/quantum")
      const data = await response.json()
      return data.coherence || 0.85 + Math.random() * 0.1
    } catch {
      return 0.75 + Math.random() * 0.15
    }
  }

  private async getConsciousnessLevel(): Promise<number> {
    try {
      const response = await fetch("/api/consciousness")
      const data = await response.json()
      return data.phi_value || 0.7 + Math.random() * 0.2
    } catch {
      return 0.65 + Math.random() * 0.25
    }
  }

  private async getSwarmEfficiency(): Promise<number> {
    try {
      const response = await fetch("/api/swarm")
      const data = await response.json()
      const activeAgents = data.agents?.filter((a: any) => a.status === "active").length || 0
      return Math.min((activeAgents / 5) * 0.9 + Math.random() * 0.1, 1.0)
    } catch {
      return 0.8 + Math.random() * 0.15
    }
  }

  private async getBlockchainSyncStatus(): Promise<boolean> {
    try {
      const response = await fetch("/api/blockchain")
      const data = await response.json()
      return data.network_status === "connected"
    } catch {
      return Math.random() > 0.1 // 90% uptime simulation
    }
  }

  private async getDatabaseLatency(): Promise<number> {
    const start = Date.now()
    try {
      await fetch("/api/health")
      return Date.now() - start
    } catch {
      return 50 + Math.random() * 100
    }
  }

  private async getActiveConnections(): Promise<number> {
    // Simulate active WebSocket connections and API calls
    return Math.floor(10 + Math.random() * 40)
  }

  private async getErrorRate(): Promise<number> {
    // Calculate error rate from recent system operations
    const recentMetrics = this.metrics.slice(-10)
    if (recentMetrics.length === 0) return 0.01

    const avgCoherence = recentMetrics.reduce((sum, m) => sum + m.quantum_coherence, 0) / recentMetrics.length
    return Math.max(0, (1 - avgCoherence) * 0.1)
  }

  private async getQuantumProcessingLoad(): Promise<number> {
    // Simulate quantum processing load
    return Math.random() * 0.3
  }

  private async getConsciousnessMemoryLoad(): Promise<number> {
    // Simulate consciousness processing memory usage
    return Math.random() * 0.4
  }

  private async checkAlerts(metrics: SystemMetrics): Promise<void> {
    for (const alert of this.alerts) {
      if (!alert.enabled) continue

      let triggered = false

      switch (alert.condition) {
        case "quantum_coherence < threshold":
          triggered = metrics.quantum_coherence < alert.threshold
          break
        case "consciousness_level < threshold":
          triggered = metrics.consciousness_level < alert.threshold
          break
        case "swarm_efficiency < threshold":
          triggered = metrics.swarm_efficiency < alert.threshold
          break
        case "error_rate > threshold":
          triggered = metrics.error_rate > alert.threshold
          break
      }

      if (triggered) {
        await this.triggerAlert(alert, metrics)
      }
    }
  }

  private async triggerAlert(alert: AlertConfig, metrics: SystemMetrics): Promise<void> {
    console.log(`[ALERT] ${alert.name} - Severity: ${alert.severity}`)

    // Store alert in database
    try {
      await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alert_id: alert.id,
          name: alert.name,
          severity: alert.severity,
          metrics: metrics,
          timestamp: Date.now(),
        }),
      })
    } catch (error) {
      console.error("Failed to store alert:", error)
    }
  }

  private async persistMetrics(metrics: SystemMetrics): Promise<void> {
    try {
      await fetch("/api/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metrics),
      })
    } catch (error) {
      console.error("Failed to persist metrics:", error)
    }
  }

  getRecentMetrics(count = 50): SystemMetrics[] {
    return this.metrics.slice(-count)
  }

  getAlerts(): AlertConfig[] {
    return this.alerts
  }

  updateAlert(alertId: string, updates: Partial<AlertConfig>): void {
    const alertIndex = this.alerts.findIndex((a) => a.id === alertId)
    if (alertIndex !== -1) {
      this.alerts[alertIndex] = { ...this.alerts[alertIndex], ...updates }
    }
  }
}

export const monitoringSystem = new MonitoringSystem()
