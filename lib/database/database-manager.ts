import { neon } from "@neondatabase/serverless"
import { createClient } from "@supabase/supabase-js"

// Database manager for quantum chat DNA system
export class DatabaseManager {
  private neonSql: any = null
  private supabase: any = null
  private isNeonAvailable = false
  private isSupabaseAvailable = false

  constructor() {
    try {
      if (process.env.DATABASE_URL) {
        this.neonSql = neon(process.env.DATABASE_URL)
        this.isNeonAvailable = true
        console.log("[DB] Neon database connection initialized")
      } else {
        console.warn("[DB] DATABASE_URL not found, Neon features disabled")
      }
    } catch (error) {
      console.warn("[DB] Failed to initialize Neon:", error)
    }

    try {
      if (
        process.env.SUPABASE_SUPABASE_NEXT_PUBLIC_SUPABASE_URL &&
        process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY_ANON_KEY
      ) {
        this.supabase = createClient(
          process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY,
        )
        this.isSupabaseAvailable = true
        console.log("[DB] Supabase connection initialized")
      } else {
        console.warn("[DB] Supabase environment variables not found, Supabase features disabled")
      }
    } catch (error) {
      console.warn("[DB] Failed to initialize Supabase:", error)
    }
  }

  async createOrganism(organism: {
    organismId: string
    name: string
    dnaCode: string
    createdBy?: string
    metadata?: any
  }) {
    if (!this.isNeonAvailable) {
      console.log("[DB] Simulating organism creation (Neon not available)")
      return {
        success: true,
        data: {
          ...organism,
          id: Math.random().toString(36).substr(2, 9),
          created_at: new Date().toISOString(),
          status: "simulated",
        },
      }
    }

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

  async getSystemMetrics() {
    if (!this.isNeonAvailable) {
      console.log("[DB] Returning simulated metrics (Neon not available)")
      return {
        success: true,
        data: {
          organisms: { active: 5, dormant: 2, evolving: 3 },
          deployments: { running: 4, completed: 8, failed: 1 },
          avgConsciousness: 73.5,
          avgCoherence: 89.2,
        },
      }
    }

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
