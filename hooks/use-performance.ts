"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { performanceMonitor } from "@/lib/performance/performance-monitor"
import { cacheManager } from "@/lib/performance/cache-manager"

export function usePerformance() {
  const [metrics, setMetrics] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [cacheStats, setCacheStats] = useState<any>({})
  const [isOptimizing, setIsOptimizing] = useState(false)

  const metricNames = useMemo(
    () => [
      { name: "cpu", key: "cpu_usage", window: 60000 },
      { name: "memory", key: "heap_used", window: 60000 },
      { name: "network", key: "network_rtt", window: 60000 },
      { name: "render", key: "lcp", window: 300000 },
      { name: "api", key: "api_response", window: 300000 },
    ],
    [],
  )

  useEffect(() => {
    const updateMetrics = () => {
      try {
        const latestMetrics = metricNames.map(({ name, key, window }) => ({
          name,
          value: performanceMonitor.getAverageMetric(key, window) || 0,
        }))

        setMetrics(latestMetrics)
        setAlerts(performanceMonitor.getAlerts(true))
        setCacheStats(cacheManager.getStats())
      } catch (error) {
        console.error("[v0] Performance metrics update failed:", error)
      }
    }

    updateMetrics()
    const interval = setInterval(updateMetrics, 5000)

    return () => clearInterval(interval)
  }, [metricNames])

  const measureApiCall = useCallback(async (name: string, apiCall: () => Promise<any>): Promise<any> => {
    const startTime = performance.now()
    try {
      const result = await performanceMonitor.measureApiCall(name, apiCall)
      const duration = performance.now() - startTime
      console.log(`[v0] API call ${name} completed in ${duration.toFixed(2)}ms`)
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      console.error(`[v0] API call ${name} failed after ${duration.toFixed(2)}ms:`, error)
      throw error
    }
  }, [])

  const measureDatabaseQuery = useCallback(async (name: string, query: () => Promise<any>): Promise<any> => {
    return performanceMonitor.measureDatabaseQuery(name, query)
  }, [])

  const getCached = useCallback((key: string): any | null => {
    try {
      return cacheManager.get(key)
    } catch (error) {
      console.error(`[v0] Cache get failed for key ${key}:`, error)
      return null
    }
  }, [])

  const setCached = useCallback((key: string, data: any, ttl?: number): void => {
    try {
      cacheManager.set(key, data, ttl)
    } catch (error) {
      console.error(`[v0] Cache set failed for key ${key}:`, error)
    }
  }, [])

  const getOrSetCached = useCallback(async (key: string, fetcher: () => Promise<any>, ttl?: number): Promise<any> => {
    try {
      return await cacheManager.getOrSet(key, fetcher, ttl)
    } catch (error) {
      console.error(`[v0] Cache getOrSet failed for key ${key}:`, error)
      // Fallback to direct fetch if cache fails
      return await fetcher()
    }
  }, [])

  const optimizePerformance = useCallback(async () => {
    if (isOptimizing) return // Prevent concurrent optimizations

    setIsOptimizing(true)

    try {
      console.log("[v0] Starting performance optimization...")

      // Clear old cache entries
      const stats = cacheManager.getStats()
      if (stats.hitRate < 50) {
        console.log("[v0] Low cache hit rate, clearing cache")
        cacheManager.clear()
      }

      // Warm up cache with essential data
      await cacheManager.warmCache([
        {
          key: "system_health",
          fetcher: async () => {
            // Get current system health
            return {
              timestamp: Date.now(),
              status: "healthy",
              metrics: metrics.reduce((acc, m) => ({ ...acc, [m.name]: m.value }), {}),
            }
          },
          ttl: 60, // 1 minute
        },
        {
          key: "user_preferences",
          fetcher: async () => {
            // Get user preferences from localStorage
            return {
              theme: localStorage.getItem("quantum-chat-theme") || "light",
              onboarding: localStorage.getItem("quantum-platform-onboarding"),
              timestamp: Date.now(),
            }
          },
          ttl: 300, // 5 minutes
        },
      ])

      // Force garbage collection if available (development only)
      if (typeof window !== "undefined" && "gc" in window && process.env.NODE_ENV === "development") {
        ;(window as any).gc()
      }

      // Preload critical resources
      if (typeof window !== "undefined") {
        // Preload next likely components
        const criticalComponents = [
          "/components/command/quantum-command-center",
          "/components/agents/multi-agent-chat",
          "/components/analytics/analytics-dashboard",
        ]

        criticalComponents.forEach((component) => {
          const link = document.createElement("link")
          link.rel = "prefetch"
          link.href = component
          document.head.appendChild(link)
        })
      }

      console.log("[v0] Performance optimization completed successfully")
    } catch (error) {
      console.error("[v0] Performance optimization failed:", error)
    } finally {
      setIsOptimizing(false)
    }
  }, [isOptimizing, metrics])

  const resolveAlert = useCallback((alertId: string) => {
    try {
      performanceMonitor.resolveAlert(alertId)
      console.log(`[v0] Resolved performance alert: ${alertId}`)
    } catch (error) {
      console.error(`[v0] Failed to resolve alert ${alertId}:`, error)
    }
  }, [])

  useEffect(() => {
    const checkPerformance = () => {
      const avgCpu = metrics.find((m) => m.name === "cpu")?.value || 0
      const avgMemory = metrics.find((m) => m.name === "memory")?.value || 0

      if (avgCpu > 80 || avgMemory > 85) {
        console.log("[v0] High resource usage detected, triggering optimization")
        optimizePerformance()
      }
    }

    if (metrics.length > 0) {
      checkPerformance()
    }
  }, [metrics, optimizePerformance])

  return {
    metrics,
    alerts,
    cacheStats,
    isOptimizing,
    measureApiCall,
    measureDatabaseQuery,
    getCached,
    setCached,
    getOrSetCached,
    optimizePerformance,
    resolveAlert,
  }
}
