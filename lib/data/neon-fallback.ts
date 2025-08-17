import { neon } from "@neondatabase/serverless"

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null

export class NeonDataManager {
  private isAvailable = !!process.env.DATABASE_URL

  constructor() {
    if (!this.isAvailable) {
      console.warn("[NeonDataManager] DATABASE_URL not found, using simulation mode")
    }
  }

  // Agent Execution Management
  async createExecution(userInput: string) {
    if (!this.isAvailable || !sql) {
      console.log("[NeonDataManager] Simulating execution creation")
      return {
        id: Math.random().toString(36).substr(2, 9),
        user_input: userInput,
        status: "simulated",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }

    try {
      const result = await sql`
        INSERT INTO agent_executions (user_input, status, created_at, updated_at)
        VALUES (${userInput}, 'running', NOW(), NOW())
        RETURNING *
      `
      return result[0] || null
    } catch (error) {
      console.error("Error creating execution with Neon:", error)
      return null
    }
  }

  async getExecutions(limit = 50) {
    if (!this.isAvailable || !sql) {
      console.log("[NeonDataManager] Returning simulated executions")
      return Array.from({ length: Math.min(limit, 5) }, (_, i) => ({
        id: `sim-${i}`,
        user_input: `Simulated execution ${i + 1}`,
        status: "completed",
        created_at: new Date(Date.now() - i * 60000).toISOString(),
      }))
    }

    try {
      const result = await sql`
        SELECT * FROM agent_executions 
        ORDER BY created_at DESC 
        LIMIT ${limit}
      `
      return result
    } catch (error) {
      console.error("Error fetching executions with Neon:", error)
      return []
    }
  }

  async storeTelemetry(telemetryData: {
    circuit_id: string
    hardware_backend: string
    error_rate: number
    average_gate_fidelity: number
    average_circuit_depth: number
    raw_json: any
  }) {
    if (!this.isAvailable || !sql) {
      console.log("[NeonDataManager] Simulating telemetry storage")
      return true
    }

    try {
      await sql`
        INSERT INTO telemetry_data (
          circuit_id, hardware_backend, error_rate, 
          average_gate_fidelity, average_circuit_depth, 
          raw_json, timestamp, created_at
        )
        VALUES (
          ${telemetryData.circuit_id}, ${telemetryData.hardware_backend}, 
          ${telemetryData.error_rate}, ${telemetryData.average_gate_fidelity}, 
          ${telemetryData.average_circuit_depth}, ${JSON.stringify(telemetryData.raw_json)}, 
          NOW(), NOW()
        )
      `
      return true
    } catch (error) {
      console.error("Error storing telemetry with Neon:", error)
      return false
    }
  }
}

export const neonDataManager = new NeonDataManager()
