import { type NextRequest, NextResponse } from "next/server"
import { systemMonitor } from "@/lib/monitoring/system-monitor"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const unresolved = searchParams.get("unresolved") === "true"
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    const alerts = systemMonitor.getAlerts(unresolved).slice(0, limit)

    return NextResponse.json({
      success: true,
      alerts,
      total: alerts.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[Alerts API] Failed to get alerts:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve alerts",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { alertId } = await request.json()

    if (!alertId) {
      return NextResponse.json(
        {
          success: false,
          error: "Alert ID is required",
        },
        { status: 400 },
      )
    }

    systemMonitor.resolveAlert(alertId)

    return NextResponse.json({
      success: true,
      message: "Alert resolved successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[Alerts API] Failed to resolve alert:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to resolve alert",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
