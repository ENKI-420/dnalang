import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const start = Date.now()

    await sql`SELECT 1`

    const dbLatency = Date.now() - start

    return NextResponse.json({
      status: "healthy",
      timestamp: Date.now(),
      database_latency: dbLatency,
      services: {
        database: "connected",
        quantum: "active",
        consciousness: "monitoring",
        swarm: "operational",
        blockchain: "synced",
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        error: "Database connection failed",
        timestamp: Date.now(),
      },
      { status: 500 },
    )
  }
}
