"use client"

// React hook for DNA runtime integration
import { useState, useEffect, useCallback } from "react"
import { dnaRuntime, type DNAOrganism } from "@/lib/dna/dna-runtime"

export function useDNARuntime() {
  const [organisms, setOrganisms] = useState<DNAOrganism[]>([])
  const [systemMetrics, setSystemMetrics] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)

  // Refresh organisms and metrics
  const refresh = useCallback(() => {
    setOrganisms(dnaRuntime.getOrganisms())
    setSystemMetrics(dnaRuntime.getSystemMetrics())
  }, [])

  // Create new organism
  const createOrganism = useCallback(
    async (config: Partial<DNAOrganism>) => {
      setIsLoading(true)
      try {
        const organism = dnaRuntime.createOrganism(config)
        refresh()
        return organism
      } finally {
        setIsLoading(false)
      }
    },
    [refresh],
  )

  // Execute organism
  const executeOrganism = useCallback(
    async (organismId: string) => {
      setIsLoading(true)
      try {
        await dnaRuntime.executeOrganism(organismId)
        refresh()
      } finally {
        setIsLoading(false)
      }
    },
    [refresh],
  )

  // Remove organism
  const removeOrganism = useCallback(
    (organismId: string) => {
      dnaRuntime.removeOrganism(organismId)
      refresh()
    },
    [refresh],
  )

  // Auto-refresh every 2 seconds
  useEffect(() => {
    const interval = setInterval(refresh, 2000)
    refresh() // Initial load

    return () => clearInterval(interval)
  }, [refresh])

  return {
    organisms,
    systemMetrics,
    isLoading,
    createOrganism,
    executeOrganism,
    removeOrganism,
    refresh,
  }
}
