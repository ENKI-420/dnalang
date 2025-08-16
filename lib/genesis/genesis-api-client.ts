interface OrganismCreationRequest {
  dna_source: string
  consciousness_target?: number
  quantum_enhanced?: boolean
}

interface ConsciousnessMetrics {
  integrated_information_phi: number
  quantum_coherence_avg: number
  tetrahedral_symmetry: string
  enhancement_factor?: number
  time_reversal_gain?: number
}

export class GenesisAPIClient {
  private baseUrl: string
  private apiKey: string

  constructor(baseUrl = "/api/genesis", apiKey = "") {
    this.baseUrl = baseUrl
    this.apiKey = apiKey
  }

  async createOrganism(request: OrganismCreationRequest): Promise<{ organismId: string }> {
    const response = await fetch(`${this.baseUrl}/v1/organisms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        "X-Quantum-Enhanced": request.quantum_enhanced ? "true" : "false",
      },
      body: JSON.stringify({
        ...request,
        aqd_enhancement: request.quantum_enhanced
          ? {
              target_speedup: 16.2,
              accuracy_improvement: 8.5,
              error_reduction: 86.9,
              hardware_target: "ibm_torino_aqd_enhanced",
            }
          : undefined,
      }),
    })

    if (!response.ok) {
      throw new Error(`Genesis API error: ${response.statusText}`)
    }

    return response.json()
  }

  async getConsciousnessMetrics(organismId: string): Promise<ConsciousnessMetrics> {
    const response = await fetch(`${this.baseUrl}/v1/organisms/${organismId}/consciousness`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to get consciousness metrics: ${response.statusText}`)
    }

    return response.json()
  }

  async enhanceWithAQD(organismId: string): Promise<{ enhanced: boolean; metrics: any }> {
    const response = await fetch(`${this.baseUrl}/v1/organisms/${organismId}/enhance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        enhancement_type: "AQD",
        target_metrics: {
          speedup: 16.2,
          accuracy_improvement: 8.5,
          efficiency_improvement: 31.6,
          error_reduction: 86.9,
        },
        quantum_specs: {
          total_qubits: 133,
          aqd_enhanced_qubits: 7,
          torsion_cavity_q: 1386.37,
          sbs_coupling: 0.000166,
        },
      }),
    })

    return response.json()
  }
}
