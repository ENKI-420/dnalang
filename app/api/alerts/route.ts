import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const alert = await request.json()

    await sql`
      INSERT INTO system_alerts (
        alert_id, name, severity, metrics_data, timestamp, resolved
      ) VALUES (
        ${alert.alert_id}, ${alert.name}, ${alert.severity},
        ${JSON.stringify(alert.metrics)}, ${new Date(alert.timestamp)}, false
      )
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error storing alert:", error)
    return NextResponse.json({ error: "Failed to store alert" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const alerts = await sql`
      SELECT * FROM system_alerts 
      WHERE resolved = false 
      ORDER BY timestamp DESC 
      LIMIT 20
    `

    return NextResponse.json({ alerts })
  } catch (error) {
    console.error("Error fetching alerts:", error)
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 })
  }
}
