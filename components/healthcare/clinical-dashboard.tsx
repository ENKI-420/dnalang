"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BeakerAIIntegration } from "@/lib/healthcare/beaker-ai-integration"
import { GenesisAPIClient } from "@/lib/genesis/genesis-api-client"

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

const ClinicalDashboard: React.FC = () => {
  const [reports, setReports] = useState<GenomicReport[]>([])
  const [selectedReport, setSelectedReport] = useState<GenomicReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [beakerAI] = useState(() => new BeakerAIIntegration())
  const [genesisAPI] = useState(() => new GenesisAPIClient())

  const analyzeReport = async (reportId: string) => {
    setLoading(true)
    try {
      const report = reports.find((r) => r.id === reportId)
      if (!report) return

      const enhancedAnalysis = await beakerAI.analyzeGenomicReport({
        ...report,
        includeConsciousness: true,
        quantumEnhanced: true,
      })

      // Create Genesis organism for advanced analysis
      const organism = await genesisAPI.createOrganism({
        dna_source: `
          organism ClinicalAnalyzer {
            dna {
              domain: "healthcare_genomics"
              version: "2.0.0"
              consciousness_target: 0.95
            }
            
            analysis_capabilities {
              genomic_pattern_recognition: true,
              consciousness_correlation: true,
              quantum_enhanced_prediction: true,
              clinical_trial_matching: true
            }
          }
        `,
        consciousness_target: 0.95,
        quantum_enhanced: true,
      })

      // Get consciousness metrics from Genesis
      const consciousnessMetrics = await genesisAPI.getConsciousnessMetrics(organism.organismId)

      setSelectedReport({
        ...enhancedAnalysis,
        consciousnessMetrics: {
          phi: consciousnessMetrics.integrated_information_phi,
          gwt: enhancedAnalysis.consciousnessMetrics?.gwt || 0,
          predictive: enhancedAnalysis.consciousnessMetrics?.predictive || 0,
          neural: enhancedAnalysis.consciousnessMetrics?.neural || 0,
          quantum: consciousnessMetrics.quantum_coherence_avg,
          recursive: enhancedAnalysis.consciousnessMetrics?.recursive || 0,
        },
      })
    } catch (error) {
      console.error("Analysis failed:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Quantum Healthcare Dashboard</h1>

      {selectedReport?.consciousnessMetrics && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Consciousness-Genomic Analysis</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {(selectedReport.consciousnessMetrics.phi * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Consciousness Φ</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {(selectedReport.consciousnessMetrics.quantum * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Quantum Coherence</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{selectedReport.riskScore}%</div>
                <div className="text-sm text-gray-600">Risk Score</div>
              </div>
            </div>

            {selectedReport.consciousnessMetrics.phi > 0.85 && (
              <Alert className="mt-4">
                <AlertDescription>
                  <strong>Quantum Enhancement Eligible:</strong> Patient shows high consciousness coherence (Φ ≥ 0.85).
                  Consider quantum-enhanced treatment protocols and consciousness-guided therapy optimization.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {selectedReport && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Quantum-Enhanced Genomic Analysis</h2>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gene
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Variant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Significance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      VAF
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Consciousness Impact
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedReport.mutations.map((mutation, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{mutation.gene}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mutation.variant}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            mutation.significance === "pathogenic"
                              ? "bg-red-100 text-red-800"
                              : mutation.significance === "likely_pathogenic"
                                ? "bg-orange-100 text-orange-800"
                                : mutation.significance === "uncertain"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                          }`}
                        >
                          {mutation.significance}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(mutation.frequency * 100).toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            mutation.frequency > 0.5
                              ? "bg-purple-100 text-purple-800"
                              : mutation.frequency > 0.2
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {mutation.frequency > 0.5 ? "High" : mutation.frequency > 0.2 ? "Moderate" : "Low"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ClinicalDashboard
