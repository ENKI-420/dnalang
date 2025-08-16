import { type NextRequest, NextResponse } from "next/server"
import { systemMonitor } from "@/lib/monitoring/system-monitor"

export async function GET(request: NextRequest) {
  try {
    const healthStatus = systemMonitor.getHealthStatus()

    const statusCode = healthStatus.overall === "healthy" ? 200 : healthStatus.overall === "warning" ? 200 : 503

    return NextResponse.json(
      {
        status: healthStatus.overall,
        timestamp: new Date().toISOString(),
        components: healthStatus.components,
        metrics: healthStatus.metrics,
        alerts: healthStatus.alerts,
        version: "2.0.0-quantum-holographic",
      },
      {
        status: statusCode,
        headers: {
          "X-Health-Status": healthStatus.overall,
          "X-Component-Count": Object.keys(healthStatus.components).length.toString(),
          "X-Alert-Count": healthStatus.alerts.length.toString(),
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      },
    )
  } catch (error) {
    console.error("[Health API] Health check failed:", error)
    return NextResponse.json(
      {
        status: "critical",
        error: "Health check system failure",
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    )
  }
}
