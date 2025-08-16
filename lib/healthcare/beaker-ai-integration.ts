import { createClient } from "@supabase/supabase-js"

interface GenomicReport {
  id: string
  patientId: string
  timestamp: string
  mutations: Mutation[]
  clinicalTrials: Trial[]
  riskScore: number
  recommendations: string[]
  consciousnessMetrics?: ConsciousnessMetrics
}

interface Mutation {
  gene: string
  variant: string
  significance: "benign" | "likely_benign" | "uncertain" | "likely_pathogenic" | "pathogenic"
  frequency: number
}

interface Trial {
  nctNumber: string
  title: string
  matchScore: number
  phase: string
  status: string
}

interface ConsciousnessMetrics {
  phi: number
  gwt: number
  predictive: number
  neural: number
  quantum: number
  recursive: number
}

export class BeakerAIIntegration {
  private supabase = createClient(
    process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_URL!,
    proSUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY_ANON_KEY!,
  )

  async analyzeGenomicReport(reportData: any): Promise<GenomicReport> {
    const response = await fetch("/api/healthcare/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...reportData,
        includeConsciousness: true,
        quantumEnhanced: true,
      }),
    })

    const analysis = await response.json()

    // Store in database with consciousness metrics
    const { data, error } = await this.supabase.from("genomic_reports").insert({
      patient_id: analysis.patientId,
      report_data: analysis,
      consciousness_phi: analysis.consciousnessMetrics?.phi || 0,
      quantum_coherence: analysis.consciousnessMetrics?.quantum || 0,
      created_at: new Date().toISOString(),
    })

    if (error) throw error
    return analysis
  }

  async getPatientConsciousnessProfile(patientId: string) {
    const { data, error } = await this.supabase
      .from("genomic_reports")
      .select("consciousness_phi, quantum_coherence, created_at")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  }

  async matchClinicalTrials(genomicProfile: any, consciousnessLevel: number) {
    const response = await fetch("/api/healthcare/trials/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        genomicProfile,
        consciousnessLevel,
        quantumEnhanced: consciousnessLevel > 0.85,
      }),
    })

    return response.json()
  }
}
