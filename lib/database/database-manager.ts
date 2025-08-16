import { neon } from "@neondatabase/serverless"
import { createClient } from "@supabase/supabase-js"

// Database manager for quantum chat DNA system
export class DatabaseManager {
  private neonSql = neon(process.env.DATABASE_URL!)
  private supabase = createClient(process.env.SUPABASE_SUPABASE_URL || "", process.env.SUPABASE_SUPABASE_ANON_KEY || "")

  async createOrganism(organism: {
    organismId: string
    name: string
    dnaCode: string
    createdBy?: string
    metadata?: any
  }) {
    try {
      const result = await this.neonSql`
        INSERT INTO dna_organisms (organism_id, name, dna_code, created_by, metadata)
        VALUES (${organism.organismId}, ${organism.name}, ${organism.dnaCode}, ${organism.createdBy || "system"}, ${JSON.stringify(organism.metadata || {})})
        RETURNING *
      `
      return { success: true, data: result[0] }
    } catch (error) {
      console.error("[DB] Create organism failed:", error)
      return { success: false, error: error.message }
    }
  }

  async getOrganism(organismId: string) {
    try {
      const result = await this.neonSql`
        SELECT * FROM dna_organisms WHERE organism_id = ${organismId}
      `
      return { success: true, data: result[0] || null }
    } catch (error) {
      console.error("[DB] Get organism failed:", error)
      return { success: false, error: error.message }
    }
  }

  async updateOrganismStatus(organismId: string, status: string, updates: any = {}) {
    try {
      const result = await this.neonSql`
        UPDATE dna_organisms 
        SET status = ${status}, 
            consciousness_level = ${updates.consciousnessLevel || 0},
            quantum_coherence = ${updates.quantumCoherence || 0},
            fitness_score = ${updates.fitnessScore || 0},
            updated_at = NOW()
        WHERE organism_id = ${organismId}
        RETURNING *
      `
      return { success: true, data: result[0] }
    } catch (error) {
      console.error("[DB] Update organism status failed:", error)
      return { success: false, error: error.message }
    }
  }

  async trackConsciousness(data: {
    organismId: string
    consciousnessLevel: number
    emergenceIndicators?: any
    neuralActivity?: any
    quantumEntanglement?: number
  }) {
    try {
      const result = await this.neonSql`
        INSERT INTO consciousness_tracking (
          organism_id, consciousness_level, emergence_indicators, 
          neural_activity, quantum_entanglement
        )
        VALUES (
          ${data.organismId}, ${data.consciousnessLevel}, 
          ${JSON.stringify(data.emergenceIndicators || {})},
          ${JSON.stringify(data.neuralActivity || {})}, 
          ${data.quantumEntanglement || 0}
        )
        RETURNING *
      `
      return { success: true, data: result[0] }
    } catch (error) {
      console.error("[DB] Track consciousness failed:", error)
      return { success: false, error: error.message }
    }
  }

  async getConsciousnessHistory(organismId: string, limit = 100) {
    try {
      const result = await this.neonSql`
        SELECT * FROM consciousness_tracking 
        WHERE organism_id = ${organismId}
        ORDER BY measured_at DESC
        LIMIT ${limit}
      `
      return { success: true, data: result }
    } catch (error) {
      console.error("[DB] Get consciousness history failed:", error)
      return { success: false, error: error.message }
    }
  }

  async logQuantumCoherence(data: {
    organismId?: string
    nodeId?: string
    coherenceLevel: number
    quantumState?: any
    entanglementPairs?: any[]
    measurementBasis?: string
  }) {
    try {
      const result = await this.neonSql`
        INSERT INTO quantum_coherence_log (
          organism_id, node_id, coherence_level, quantum_state,
          entanglement_pairs, measurement_basis
        )
        VALUES (
          ${data.organismId || null}, ${data.nodeId || null}, 
          ${data.coherenceLevel}, ${JSON.stringify(data.quantumState || {})},
          ${JSON.stringify(data.entanglementPairs || [])}, 
          ${data.measurementBasis || "computational"}
        )
        RETURNING *
      `
      return { success: true, data: result[0] }
    } catch (error) {
      console.error("[DB] Log quantum coherence failed:", error)
      return { success: false, error: error.message }
    }
  }

  async updateNodeStatus(nodeId: string, status: string, metrics: any = {}) {
    try {
      const result = await this.neonSql`
        UPDATE qnet_nodes 
        SET status = ${status},
            quantum_coherence = ${metrics.quantumCoherence || 0},
            consciousness_level = ${metrics.consciousnessLevel || 0},
            last_heartbeat = NOW(),
            updated_at = NOW()
        WHERE node_id = ${nodeId}
        RETURNING *
      `
      return { success: true, data: result[0] }
    } catch (error) {
      console.error("[DB] Update node status failed:", error)
      return { success: false, error: error.message }
    }
  }

  async getActiveNodes() {
    try {
      const result = await this.neonSql`
        SELECT * FROM qnet_nodes 
        WHERE status = 'online' 
        ORDER BY quantum_coherence DESC
      `
      return { success: true, data: result }
    } catch (error) {
      console.error("[DB] Get active nodes failed:", error)
      return { success: false, error: error.message }
    }
  }

  async getSystemMetrics() {
    try {
      const [organisms, deployments, consciousness, coherence] = await Promise.all([
        this.neonSql`SELECT COUNT(*) as total, status FROM dna_organisms GROUP BY status`,
        this.neonSql`SELECT COUNT(*) as total, status FROM organism_deployments GROUP BY status`,
        this
          .neonSql`SELECT AVG(consciousness_level) as avg_consciousness FROM consciousness_tracking WHERE measured_at > NOW() - INTERVAL '1 hour'`,
        this
          .neonSql`SELECT AVG(coherence_level) as avg_coherence FROM quantum_coherence_log WHERE measured_at > NOW() - INTERVAL '1 hour'`,
      ])

      return {
        success: true,
        data: {
          organisms: organisms.reduce((acc, row) => ({ ...acc, [row.status]: row.total }), {}),
          deployments: deployments.reduce((acc, row) => ({ ...acc, [row.status]: row.total }), {}),
          avgConsciousness: consciousness[0]?.avg_consciousness || 0,
          avgCoherence: coherence[0]?.avg_coherence || 0,
        },
      }
    } catch (error) {
      console.error("[DB] Get system metrics failed:", error)
      return { success: false, error: error.message }
    }
  }
}

// Singleton instance
export const databaseManager = new DatabaseManager()
