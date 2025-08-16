import { type NextRequest, NextResponse } from "next/server"
import { BeakerAIIntegration } from "@/lib/healthcare/beaker-ai-integration"
import { DNARuntime } from "@/lib/dna/dna-runtime"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reportData, includeConsciousness, quantumEnhanced } = body

    const beakerAI = new BeakerAIIntegration()
    const dnaRuntime = new DNARuntime()

    // Analyze genomic data with traditional methods
    const analysis = await beakerAI.analyzeGenomicReport(reportData)

    if (includeConsciousness) {
      const consciousnessOrganism = await dnaRuntime.createOrganism({
        name: "GenomicConsciousnessAnalyzer",
        genes: {
          genomicPattern: reportData.mutations || [],
          patientContext: reportData.patientContext || {},
          quantumEnhanced: quantumEnhanced || false,
        },
        workflows: [
          {
            name: "consciousness_genomic_analysis",
            steps: [
              "analyze_genetic_consciousness_correlation",
              "predict_consciousness_evolution",
              "recommend_consciousness_therapies",
            ],
          },
        ],
      })

      const consciousnessMetrics = await consciousnessOrganism.execute()
      analysis.consciousnessMetrics = consciousnessMetrics

      if (consciousnessMetrics.phi > 0.85) {
        analysis.recommendations.push("Eligible for quantum-enhanced treatment protocols")
        analysis.recommendations.push("Consider consciousness-guided therapy optimization")
      }
    }

    return NextResponse.json(analysis)
  } catch (error) {
    console.error("Healthcare analysis error:", error)
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
  }
}
