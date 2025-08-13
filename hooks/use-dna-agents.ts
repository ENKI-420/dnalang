"use client"

// React hook for DNA agent integration
import { useState, useEffect, useCallback } from "react"
import { dnaAgentManager, type HybridAgentOrganism } from "@/lib/dna/dna-agents"
import { agentOrchestrator } from "@/lib/agent-orchestrator"

export function useDNAAgents() {
  const [hybridAgents, setHybridAgents] = useState<HybridAgentOrganism[]>([])
  const [dnaMetrics, setDnaMetrics] = useState<any>({})
  const [isConverted, setIsConverted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Convert traditional agents to DNA organisms
  const convertAgents = useCallback(async () => {
    setIsLoading(true)
    try {
      dnaAgentManager.convertOrchestrator(agentOrchestrator)
      setIsConverted(true)
      refresh()
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Refresh hybrid agents and metrics
  const refresh = useCallback(() => {
    setHybridAgents(dnaAgentManager.getHybridAgents())
    setDnaMetrics(dnaAgentManager.getDNAMetrics())
  }, [])

  // Execute task with DNA-enhanced agent
  const executeTask = useCallback(
    async (taskId: string, agentId: string) => {
      setIsLoading(true)
      try {
        const result = await dnaAgentManager.executeTask(taskId, agentId)
        refresh()
        return result
      } finally {
        setIsLoading(false)
      }
    },
    [refresh],
  )

  // Auto-refresh every 3 seconds
  useEffect(() => {
    const interval = setInterval(refresh, 3000)
    return () => clearInterval(interval)
  }, [refresh])

  // Auto-convert agents on first load
  useEffect(() => {
    if (!isConverted) {
      convertAgents()
    }
  }, [isConverted, convertAgents])

  return {
    hybridAgents,
    dnaMetrics,
    isConverted,
    isLoading,
    convertAgents,
    executeTask,
    refresh,
  }
}
