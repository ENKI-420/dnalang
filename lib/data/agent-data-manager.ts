import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client"
import { neonDataManager } from "@/lib/data/neon-fallback"
import type { Database } from "@/types/database"

type AgentExecution = Database["public"]["Tables"]["agent_executions"]["Row"]
type AgentArtifact = Database["public"]["Tables"]["agent_artifacts"]["Row"]
type AgentAssessment = Database["public"]["Tables"]["agent_assessments"]["Row"]
type VectorMemory = Database["public"]["Tables"]["vector_memories"]["Row"]

export class AgentDataManager {
  private supabase = getSupabaseClient()
  private cache = new Map<string, any>()
  private cacheExpiry = new Map<string, number>()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  private async executeWithFallback<T>(
    supabaseOperation: () => Promise<T>,
    neonOperation: () => Promise<T>,
  ): Promise<T> {
    if (isSupabaseConfigured && this.supabase) {
      return await supabaseOperation()
    } else {
      console.log("Using Neon database fallback")
      return await neonOperation()
    }
  }

  // Agent Execution Management
  async createExecution(userInput: string): Promise<AgentExecution | null> {
    return this.executeWithFallback(
      async () => {
        const { data, error } = await this.supabase!.from("agent_executions")
          .insert({
            user_input: userInput,
            status: "running",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (error) {
          console.error("Error creating execution:", error)
          return null
        }

        this.invalidateCache("executions")
        return data
      },
      async () => {
        return await neonDataManager.createExecution(userInput)
      },
    )
  }

  async updateExecution(
    executionId: number,
    updates: Partial<Pick<AgentExecution, "status" | "result" | "overall_score" | "duration_ms">>,
  ): Promise<boolean> {
    return this.executeWithFallback(
      async () => {
        const { error } = await this.supabase!.from("agent_executions")
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
            ...(updates.status === "completed" && { completed_at: new Date().toISOString() }),
          })
          .eq("id", executionId)

        if (error) {
          console.error("Error updating execution:", error)
          return false
        }

        this.invalidateCache("executions")
        this.invalidateCache(`execution-${executionId}`)
        return true
      },
      async () => {
        return await neonDataManager.updateExecution(executionId, updates)
      },
    )
  }

  async getExecutions(limit = 50): Promise<AgentExecution[]> {
    const cacheKey = `executions-${limit}`
    const cached = this.getFromCache<AgentExecution[]>(cacheKey)
    if (cached) return cached

    const result = await this.executeWithFallback(
      async () => {
        const { data, error } = await this.supabase!.from("agent_executions")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(limit)

        if (error) {
          console.error("Error fetching executions:", error)
          return []
        }

        return data || []
      },
      async () => {
        return await neonDataManager.getExecutions(limit)
      },
    )

    this.setCache(cacheKey, result)
    return result
  }

  // Agent Artifact Management
  async createArtifact(
    executionId: number,
    artifactData: {
      artifact_id: string
      type: string
      content: string
      language?: string
      file_path?: string
      metadata?: any
    },
  ): Promise<AgentArtifact | null> {
    return this.executeWithFallback(
      async () => {
        const { data, error } = await this.supabase!.from("agent_artifacts")
          .insert({
            execution_id: executionId,
            ...artifactData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (error) {
          console.error("Error creating artifact:", error)
          return null
        }

        this.invalidateCache(`artifacts-${executionId}`)
        return data
      },
      async () => {
        return await neonDataManager.createArtifact(executionId, artifactData)
      },
    )
  }

  async getArtifactsByExecution(executionId: number): Promise<AgentArtifact[]> {
    const cacheKey = `artifacts-${executionId}`
    const cached = this.getFromCache<AgentArtifact[]>(cacheKey)
    if (cached) return cached

    const result = await this.executeWithFallback(
      async () => {
        const { data, error } = await this.supabase!.from("agent_artifacts")
          .select("*")
          .eq("execution_id", executionId)
          .order("created_at", { ascending: true })

        if (error) {
          console.error("Error fetching artifacts:", error)
          return []
        }

        return data || []
      },
      async () => {
        return await neonDataManager.getArtifactsByExecution(executionId)
      },
    )

    this.setCache(cacheKey, result)
    return result
  }

  // Vector Memory Management
  async storeVectorMemory(content: string, embedding: number[], metadata?: any): Promise<VectorMemory | null> {
    return this.executeWithFallback(
      async () => {
        const { data, error } = await this.supabase!.from("vector_memories")
          .insert({
            content,
            embedding: `[${embedding.join(",")}]`, // Convert to string format
            metadata: metadata || {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (error) {
          console.error("Error storing vector memory:", error)
          return null
        }

        this.invalidateCache("vector-memories")
        return data
      },
      async () => {
        return await neonDataManager.storeVectorMemory(content, embedding, metadata)
      },
    )
  }

  async searchVectorMemories(query: string, limit = 10): Promise<VectorMemory[]> {
    return this.executeWithFallback(
      async () => {
        const { data, error } = await this.supabase!.from("vector_memories")
          .select("*")
          .textSearch("content", query)
          .limit(limit)

        if (error) {
          console.error("Error searching vector memories:", error)
          return []
        }

        return data || []
      },
      async () => {
        return await neonDataManager.searchVectorMemories(query, limit)
      },
    )
  }

  // Assessment Management
  async createAssessment(
    executionId: number,
    assessmentData: {
      assessment_id: string
      type: string
      score: number
      passed: boolean
      issues?: any
      recommendations?: any
    },
  ): Promise<AgentAssessment | null> {
    return this.executeWithFallback(
      async () => {
        const { data, error } = await this.supabase!.from("agent_assessments")
          .insert({
            execution_id: executionId,
            ...assessmentData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (error) {
          console.error("Error creating assessment:", error)
          return null
        }

        this.invalidateCache(`assessments-${executionId}`)
        return data
      },
      async () => {
        return await neonDataManager.createAssessment(executionId, assessmentData)
      },
    )
  }

  // Telemetry Management
  async storeTelemetry(telemetryData: {
    circuit_id: string
    hardware_backend: string
    error_rate: number
    average_gate_fidelity: number
    average_circuit_depth: number
    raw_json: any
  }): Promise<boolean> {
    return this.executeWithFallback(
      async () => {
        const { error } = await this.supabase!.from("telemetry_data").insert({
          ...telemetryData,
          timestamp: new Date().toISOString(),
          created_at: new Date().toISOString(),
        })

        if (error) {
          console.error("Error storing telemetry:", error)
          return false
        }

        this.invalidateCache("telemetry")
        return true
      },
      async () => {
        return await neonDataManager.storeTelemetry(telemetryData)
      },
    )
  }

  // Cache Management
  private getFromCache<T>(key: string): T | null {
    const expiry = this.cacheExpiry.get(key)
    if (!expiry || Date.now() > expiry) {
      this.cache.delete(key)
      this.cacheExpiry.delete(key)
      return null
    }
    return this.cache.get(key) || null
  }

  private setCache<T>(key: string, value: T): void {
    this.cache.set(key, value)
    this.cacheExpiry.set(key, Date.now() + this.CACHE_TTL)
  }

  private invalidateCache(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
        this.cacheExpiry.delete(key)
      }
    }
  }

  // Batch Operations
  async batchCreateArtifacts(
    executionId: number,
    artifacts: Array<{
      artifact_id: string
      type: string
      content: string
      language?: string
      file_path?: string
      metadata?: any
    }>,
  ): Promise<AgentArtifact[]> {
    return this.executeWithFallback(
      async () => {
        const { data, error } = await this.supabase!.from("agent_artifacts")
          .insert(
            artifacts.map((artifact) => ({
              execution_id: executionId,
              ...artifact,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })),
          )
          .select()

        if (error) {
          console.error("Error batch creating artifacts:", error)
          return []
        }

        this.invalidateCache(`artifacts-${executionId}`)
        return data || []
      },
      async () => {
        return await neonDataManager.batchCreateArtifacts(executionId, artifacts)
      },
    )
  }

  // Analytics
  async getExecutionStats(): Promise<{
    total: number
    completed: number
    running: number
    failed: number
    averageScore: number
  }> {
    return this.executeWithFallback(
      async () => {
        const { data, error } = await this.supabase!.from("agent_executions").select("status, overall_score")

        if (error) {
          console.error("Error fetching execution stats:", error)
          return { total: 0, completed: 0, running: 0, failed: 0, averageScore: 0 }
        }

        const stats = data.reduce(
          (acc, execution) => {
            acc.total++
            if (execution.status === "completed") acc.completed++
            else if (execution.status === "running") acc.running++
            else if (execution.status === "failed") acc.failed++

            if (execution.overall_score) {
              acc.scoreSum += execution.overall_score
              acc.scoreCount++
            }
            return acc
          },
          { total: 0, completed: 0, running: 0, failed: 0, scoreSum: 0, scoreCount: 0 },
        )

        return {
          total: stats.total,
          completed: stats.completed,
          running: stats.running,
          failed: stats.failed,
          averageScore: stats.scoreCount > 0 ? stats.scoreSum / stats.scoreCount : 0,
        }
      },
      async () => {
        return await neonDataManager.getExecutionStats()
      },
    )
  }
}

// Singleton instance
export const agentDataManager = new AgentDataManager()
