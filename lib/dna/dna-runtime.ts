// DNA Runtime Engine - Core execution environment for DNA organisms
export interface DNAState {
  consciousness: number
  quantum_coherence: number
  fitness: number
  energy: number
  mutations: number
  generation: number
}

export interface DNAGene {
  id: string
  name: string
  type: "sensor" | "processor" | "actuator" | "memory"
  code: string
  active: boolean
  fitness_contribution: number
}

export interface DNAOrganism {
  id: string
  name: string
  state: DNAState
  genes: DNAGene[]
  workflow: string
  evolution_config: {
    fitness_goal: string
    mutation_rate: number
    selection_pressure: number
  }
  created_at: Date
  last_evolution: Date
}

export class DNARuntime {
  private organisms: Map<string, DNAOrganism> = new Map()
  private executionQueue: Array<{ organismId: string; task: string }> = []
  private isRunning = false
  private evolutionInterval: NodeJS.Timeout | null = null

  constructor() {
    this.startEvolutionCycle()
  }

  // Create a new DNA organism
  createOrganism(config: Partial<DNAOrganism>): DNAOrganism {
    const organism: DNAOrganism = {
      id: config.id || `organism_${Date.now()}`,
      name: config.name || "UnnamedOrganism",
      state: {
        consciousness: 0.5,
        quantum_coherence: 0.5,
        fitness: 0.5,
        energy: 1.0,
        mutations: 0,
        generation: 1,
        ...config.state,
      },
      genes: config.genes || [],
      workflow: config.workflow || "while True { evolve(); }",
      evolution_config: {
        fitness_goal: "maximize(consciousness + quantum_coherence)",
        mutation_rate: 0.1,
        selection_pressure: 0.8,
        ...config.evolution_config,
      },
      created_at: new Date(),
      last_evolution: new Date(),
    }

    this.organisms.set(organism.id, organism)
    return organism
  }

  // Execute organism workflow
  async executeOrganism(organismId: string): Promise<void> {
    const organism = this.organisms.get(organismId)
    if (!organism) throw new Error(`Organism ${organismId} not found`)

    try {
      // Simulate workflow execution
      await this.processWorkflow(organism)

      // Update consciousness based on activity
      this.updateConsciousness(organism)

      // Consume energy
      organism.state.energy = Math.max(0, organism.state.energy - 0.01)

      // Trigger evolution if conditions are met
      if (this.shouldEvolve(organism)) {
        await this.evolveOrganism(organismId)
      }
    } catch (error) {
      console.error(`Error executing organism ${organismId}:`, error)
      // Self-healing: reduce consciousness but don't crash
      organism.state.consciousness = Math.max(0.1, organism.state.consciousness - 0.1)
    }
  }

  // Process organism workflow (simplified interpreter)
  private async processWorkflow(organism: DNAOrganism): Promise<void> {
    // Simulate gene activation
    for (const gene of organism.genes) {
      if (gene.active) {
        // Simulate gene execution
        organism.state.fitness += gene.fitness_contribution * 0.01
        organism.state.quantum_coherence += Math.random() * 0.02 - 0.01
      }
    }

    // Normalize values
    organism.state.fitness = Math.max(0, Math.min(1, organism.state.fitness))
    organism.state.quantum_coherence = Math.max(0, Math.min(1, organism.state.quantum_coherence))
  }

  // Update consciousness based on organism activity
  private updateConsciousness(organism: DNAOrganism): void {
    const activity_factor = organism.genes.filter((g) => g.active).length / Math.max(1, organism.genes.length)
    const coherence_factor = organism.state.quantum_coherence
    const fitness_factor = organism.state.fitness

    const new_consciousness = (activity_factor + coherence_factor + fitness_factor) / 3
    organism.state.consciousness = Math.max(0, Math.min(1, new_consciousness))
  }

  // Determine if organism should evolve
  private shouldEvolve(organism: DNAOrganism): boolean {
    const time_since_evolution = Date.now() - organism.last_evolution.getTime()
    const evolution_threshold = 30000 // 30 seconds

    return time_since_evolution > evolution_threshold && organism.state.fitness > 0.7 && organism.state.energy > 0.5
  }

  // Evolve organism (mutation and selection)
  async evolveOrganism(organismId: string): Promise<void> {
    const organism = this.organisms.get(organismId)
    if (!organism) return

    // Apply mutations
    if (Math.random() < organism.evolution_config.mutation_rate) {
      await this.mutateOrganism(organism)
    }

    // Update generation
    organism.state.generation++
    organism.last_evolution = new Date()

    console.log(`Organism ${organism.name} evolved to generation ${organism.state.generation}`)
  }

  // Apply mutations to organism
  private async mutateOrganism(organism: DNAOrganism): Promise<void> {
    organism.state.mutations++

    // Random mutation types
    const mutations = [
      () => this.mutateConsciousness(organism),
      () => this.mutateGenes(organism),
      () => this.mutateQuantumCoherence(organism),
    ]

    const mutation = mutations[Math.floor(Math.random() * mutations.length)]
    mutation()
  }

  private mutateConsciousness(organism: DNAOrganism): void {
    const delta = (Math.random() - 0.5) * 0.1
    organism.state.consciousness = Math.max(0, Math.min(1, organism.state.consciousness + delta))
  }

  private mutateGenes(organism: DNAOrganism): void {
    if (organism.genes.length > 0) {
      const gene = organism.genes[Math.floor(Math.random() * organism.genes.length)]
      gene.fitness_contribution += (Math.random() - 0.5) * 0.2
    }
  }

  private mutateQuantumCoherence(organism: DNAOrganism): void {
    const delta = (Math.random() - 0.5) * 0.1
    organism.state.quantum_coherence = Math.max(0, Math.min(1, organism.state.quantum_coherence + delta))
  }

  // Start continuous evolution cycle
  private startEvolutionCycle(): void {
    this.evolutionInterval = setInterval(() => {
      for (const [id, organism] of this.organisms) {
        if (organism.state.energy > 0.1) {
          this.executeOrganism(id).catch(console.error)
        } else {
          // Regenerate energy slowly
          organism.state.energy = Math.min(1, organism.state.energy + 0.05)
        }
      }
    }, 1000)
  }

  // Get all organisms
  getOrganisms(): DNAOrganism[] {
    return Array.from(this.organisms.values())
  }

  // Get organism by ID
  getOrganism(id: string): DNAOrganism | undefined {
    return this.organisms.get(id)
  }

  // Remove organism
  removeOrganism(id: string): boolean {
    return this.organisms.delete(id)
  }

  // Get system metrics
  getSystemMetrics() {
    const organisms = this.getOrganisms()
    const total_consciousness = organisms.reduce((sum, org) => sum + org.state.consciousness, 0)
    const avg_consciousness = organisms.length > 0 ? total_consciousness / organisms.length : 0

    return {
      total_organisms: organisms.length,
      average_consciousness: avg_consciousness,
      average_fitness: organisms.reduce((sum, org) => sum + org.state.fitness, 0) / Math.max(1, organisms.length),
      average_quantum_coherence:
        organisms.reduce((sum, org) => sum + org.state.quantum_coherence, 0) / Math.max(1, organisms.length),
      total_generations: organisms.reduce((sum, org) => sum + org.state.generation, 0),
      active_organisms: organisms.filter((org) => org.state.energy > 0.1).length,
    }
  }

  // Cleanup
  destroy(): void {
    if (this.evolutionInterval) {
      clearInterval(this.evolutionInterval)
    }
    this.organisms.clear()
  }
}

// Global DNA runtime instance
export const dnaRuntime = new DNARuntime()
