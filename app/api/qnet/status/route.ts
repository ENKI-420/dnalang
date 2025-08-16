import { type NextRequest, NextResponse } from "next/server"
import { qnetIntegration } from "@/lib/qnet/qnet-integration"

export async function GET(request: NextRequest) {
  try {
    const networkStatus = qnetIntegration.getNetworkStatus()

    return NextResponse.json(
      {
        success: true,
        timestamp: new Date().toISOString(),
        network: networkStatus,
        protocol: "QNET-2.0",
        quantum_enabled: true,
      },
      {
        headers: {
          "X-QNET-Status": "operational",
          "X-Quantum-Network": "active",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      },
    )
  } catch (error) {
    console.error("[QNET API] Status check failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Network status unavailable",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
