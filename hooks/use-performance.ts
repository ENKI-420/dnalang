"use client"

import { useState, useEffect, useCallback } from "react"
import { performanceMonitor } from "@/lib/performance/performance-monitor"
import { cacheManager } from "@/lib/performance/cache-manager"

export function usePerformance() {
  const [metrics, setMetrics] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [cacheStats, setCacheStats] = useState<any>({})
  const [isOptimizing, setIsOptimizing] = useState(false)

  // Update metrics periodically
  useEffect(() => {
    const updateMetrics = () => {
      const latestMetrics = [
        { name: "cpu", value: performanceMonitor.getAverageMetric("cpu_usage", 60000) },
        { name: "memory", value: performanceMonitor.getAverageMetric("heap_used", 60000) },
        { name: "network", value: performanceMonitor.getAverageMetric("network_rtt", 60000) },
        { name: "render", value: performanceMonitor.getAverageMetric("lcp", 300000) },
        { name: "api", value: performanceMonitor.getAverageMetric("api_response", 300000) },
      ]

      setMetrics(latestMetrics)
      setAlerts(performanceMonitor.getAlerts(true))
      setCacheStats(cacheManager.getStats())
    }

    updateMetrics()
    const interval = setInterval(updateMetrics, 5000)

    return () => clearInterval(interval)
  }, [])

  // Performance measurement helpers
  const measureApiCall = useCallback(async (name: string, apiCall: () => Promise<any>): Promise<any> => {
    return performanceMonitor.measureApiCall(name, apiCall)
  }, [])

  const measureDatabaseQuery = useCallback(async (name: string, query: () => Promise<any>): Promise<any> => {
    return performanceMonitor.measureDatabaseQuery(name, query)
  }, [])

  // Cache helpers
  const getCached = useCallback((key: string): any | null => {
    return cacheManager.get(key)
  }, [])

  const setCached = useCallback((key: string, data: any, ttl?: number): void => {
    cacheManager.set(key, data, ttl)
  }, [])

  const getOrSetCached = useCallback(async (key: string, fetcher: () => Promise<any>, ttl?: number): Promise<any> => {
    return cacheManager.getOrSet(key, fetcher, ttl)
  }, [])

  // Optimization actions
  const optimizePerformance = useCallback(async () => {
    setIsOptimizing(true)

    try {
      // Clear old cache entries
      const stats = cacheManager.getStats()
      if (stats.hitRate < 50) {
        // Low hit rate, clear cache to start fresh
        cacheManager.clear()
      }

      // Warm up cache with frequently accessed data
      await cacheManager.warmCache([
        {
          key: "user_profile",
          fetcher: async () => {
            // Mock user profile fetch
            return { id: "user1", name: "User" }
          },
        },
        {
          key: "system_config",
          fetcher: async () => {
            // Mock system config fetch
            return { theme: "dark", language: "en" }
          },
        },
      ])

      // Force garbage collection if available
      if (typeof window !== "undefined" && "gc" in window) {
        ;(window as any).gc()
      }

      console.log("Performance optimization completed")
    } catch (error) {
      console.error("Performance optimization failed:", error)
    } finally {
      setIsOptimizing(false)
    }
  }, [])

  const resolveAlert = useCallback((alertId: string) => {
    performanceMonitor.resolveAlert(alertId)
  }, [])

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
