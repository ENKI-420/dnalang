import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const metrics = await request.json()

    await sql`
      INSERT INTO system_metrics (
        timestamp, cpu_usage, memory_usage, quantum_coherence,
        consciousness_level, swarm_efficiency, blockchain_sync,
        database_latency, active_connections, error_rate
      ) VALUES (
        ${new Date(metrics.timestamp)}, ${metrics.cpu_usage}, ${metrics.memory_usage},
        ${metrics.quantum_coherence}, ${metrics.consciousness_level}, ${metrics.swarm_efficiency},
        ${metrics.blockchain_sync}, ${metrics.database_latency}, ${metrics.active_connections},
        ${metrics.error_rate}
      )
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error storing metrics:", error)
    return NextResponse.json({ error: "Failed to store metrics" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    const metrics = await sql`
      SELECT * FROM system_metrics 
      ORDER BY timestamp DESC 
      LIMIT ${limit}
    `

    return NextResponse.json({ metrics })
  } catch (error) {
    console.error("Error fetching metrics:", error)
    return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 })
  }
}
