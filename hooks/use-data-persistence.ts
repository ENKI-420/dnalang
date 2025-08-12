"use client"

import { useState, useEffect, useCallback } from "react"
import { agentDataManager } from "@/lib/data/agent-data-manager"
import type { Database } from "@/types/database"

type AgentExecution = Database["public"]["Tables"]["agent_executions"]["Row"]
type AgentArtifact = Database["public"]["Tables"]["agent_artifacts"]["Row"]

export function useDataPersistence() {
  const [executions, setExecutions] = useState<AgentExecution[]>([])
  const [currentExecution, setCurrentExecution] = useState<AgentExecution | null>(null)
  const [artifacts, setArtifacts] = useState<AgentArtifact[]>([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    running: 0,
    failed: 0,
    averageScore: 0,
  })

  // Load executions
  const loadExecutions = useCallback(async () => {
    setLoading(true)
    try {
      const data = await agentDataManager.getExecutions()
      setExecutions(data)
    } catch (error) {
      console.error("Error loading executions:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Load execution stats
  const loadStats = useCallback(async () => {
    try {
      const data = await agentDataManager.getExecutionStats()
      setStats(data)
    } catch (error) {
      console.error("Error loading stats:", error)
    }
  }, [])

  // Create new execution
  const createExecution = useCallback(
    async (userInput: string) => {
      const execution = await agentDataManager.createExecution(userInput)
      if (execution) {
        setCurrentExecution(execution)
        await loadExecutions()
        await loadStats()
      }
      return execution
    },
    [loadExecutions, loadStats],
  )

  // Update execution
  const updateExecution = useCallback(
    async (
      executionId: number,
      updates: Partial<Pick<AgentExecution, "status" | "result" | "overall_score" | "duration_ms">>,
    ) => {
      const success = await agentDataManager.updateExecution(executionId, updates)
      if (success) {
        await loadExecutions()
        await loadStats()

        // Update current execution if it matches
        if (currentExecution?.id === executionId) {
          setCurrentExecution((prev) => (prev ? { ...prev, ...updates } : null))
        }
      }
      return success
    },
    [loadExecutions, loadStats, currentExecution],
  )

  // Create artifact
  const createArtifact = useCallback(
    async (
      executionId: number,
      artifactData: {
        artifact_id: string
        type: string
        content: string
        language?: string
        file_path?: string
        metadata?: any
      },
    ) => {
      const artifact = await agentDataManager.createArtifact(executionId, artifactData)
      if (artifact) {
        // Reload artifacts for current execution
        if (currentExecution?.id === executionId) {
          const updatedArtifacts = await agentDataManager.getArtifactsByExecution(executionId)
          setArtifacts(updatedArtifacts)
        }
      }
      return artifact
    },
    [currentExecution],
  )

  // Load artifacts for execution
  const loadArtifacts = useCallback(async (executionId: number) => {
    const data = await agentDataManager.getArtifactsByExecution(executionId)
    setArtifacts(data)
    return data
  }, [])

  // Store vector memory
  const storeVectorMemory = useCallback(async (content: string, embedding: number[], metadata?: any) => {
    return await agentDataManager.storeVectorMemory(content, embedding, metadata)
  }, [])

  // Search vector memories
  const searchVectorMemories = useCallback(async (query: string, limit = 10) => {
    return await agentDataManager.searchVectorMemories(query, limit)
  }, [])

  // Store telemetry
  const storeTelemetry = useCallback(
    async (telemetryData: {
      circuit_id: string
      hardware_backend: string
      error_rate: number
      average_gate_fidelity: number
      average_circuit_depth: number
      raw_json: any
    }) => {
      return await agentDataManager.storeTelemetry(telemetryData)
    },
    [],
  )

  // Load initial data
  useEffect(() => {
    loadExecutions()
    loadStats()
  }, [loadExecutions, loadStats])

  return {
    // Data
    executions,
    currentExecution,
    artifacts,
    stats,
    loading,

    // Actions
    createExecution,
    updateExecution,
    createArtifact,
    loadArtifacts,
    storeVectorMemory,
    searchVectorMemories,
    storeTelemetry,

    // Utilities
    refresh: loadExecutions,
    setCurrentExecution,
  }
}
