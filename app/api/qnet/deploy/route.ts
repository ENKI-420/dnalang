import { type NextRequest, NextResponse } from "next/server"
import { qnetIntegration } from "@/lib/qnet/qnet-integration"

export async function POST(request: NextRequest) {
  try {
    const { organismCode, targetNodeId } = await request.json()

    if (!organismCode) {
      return NextResponse.json(
        {
          success: false,
          error: "Organism code is required",
        },
        { status: 400 },
      )
    }

    const deployment = await qnetIntegration.deployOrganism(organismCode, targetNodeId)

    return NextResponse.json(
      {
        success: true,
        deployment,
        timestamp: new Date().toISOString(),
        message: "Organism deployment initiated",
      },
      {
        headers: {
          "X-QNET-Deployment": "initiated",
          "X-Organism-ID": deployment.organismId,
        },
      },
    )
  } catch (error) {
    console.error("[QNET API] Deployment failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Deployment failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
