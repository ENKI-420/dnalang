// G'volution Evolution Engine - Advanced genetic algorithm system for DNA organisms
import type { DNAOrganism, DNAGene } from "@/lib/dna/dna-runtime"

export interface EvolutionStrategy {
  name: string
  type: "genetic" | "memetic" | "differential" | "particle_swarm" | "quantum"
  parameters: {
    population_size: number
    mutation_rate: number
    crossover_rate: number
    selection_pressure: number
    elitism_rate: number
  }
}

export interface MutationType {
  name: string
  probability: number
  impact: "minor" | "moderate" | "major" | "revolutionary"
  target: "state" | "genes" | "workflow" | "evolution_config"
}

export interface FitnessLandscape {
  dimensions: string[]
  objectives: {
    name: string
    weight: number
    maximize: boolean
    target_value?: number
  }[]
  constraints: {
    name: string
    type: "hard" | "soft"
    condition: string
  }[]
}

export interface EvolutionMetrics {
  generation: number
  population_size: number
  average_fitness: number
  best_fitness: number
  diversity_index: number
  convergence_rate: number
  mutation_success_rate: number
  evolutionary_pressure: number
  species_count: number
  extinction_events: number
}

export interface EvolutionEvent {
  type: "mutation" | "crossover" | "selection" | "speciation" | "extinction" | "breakthrough"
  timestamp: Date
  organism_id: string
  details: any
  impact_score: number
}

export class GvolutionEngine {
  private populations: Map<string, DNAOrganism[]> = new Map()
  private strategies: Map<string, EvolutionStrategy> = new Map()
  private fitnessLandscapes: Map<string, FitnessLandscape> = new Map()
  private evolutionHistory: EvolutionEvent[] = []
  private metrics: EvolutionMetrics = {
    generation: 0,
    population_size: 0,
    average_fitness: 0,
    best_fitness: 0,
    diversity_index: 0,
    convergence_rate: 0,
    mutation_success_rate: 0,
    evolutionary_pressure: 0,
    species_count: 0,
    extinction_events: 0,
  }
  private isRunning = false
  private evolutionInterval: NodeJS.Timeout | null = null

  constructor() {
    this.initializeDefaultStrategies()
    this.initializeDefaultFitnessLandscapes()
    this.startEvolutionEngine()
  }

  // Initialize default evolution strategies
  private initializeDefaultStrategies() {
    const strategies: EvolutionStrategy[] = [
      {
        name: "Adaptive Genetic Algorithm",
        type: "genetic",
        parameters: {
          population_size: 50,
          mutation_rate: 0.1,
          crossover_rate: 0.8,
          selection_pressure: 0.7,
          elitism_rate: 0.1,
        },
      },
      {
        name: "Quantum Evolution",
        type: "quantum",
        parameters: {
          population_size: 30,
          mutation_rate: 0.15,
          crossover_rate: 0.6,
          selection_pressure: 0.9,
          elitism_rate: 0.2,
        },
      },
      {
        name: "Memetic Algorithm",
        type: "memetic",
        parameters: {
          population_size: 40,
          mutation_rate: 0.08,
          crossover_rate: 0.9,
          selection_pressure: 0.8,
          elitism_rate: 0.15,
        },
      },
    ]

    strategies.forEach((strategy) => this.strategies.set(strategy.name, strategy))
  }

  // Initialize default fitness landscapes
  private initializeDefaultFitnessLandscapes() {
    const landscapes: FitnessLandscape[] = [
      {
        dimensions: ["consciousness", "quantum_coherence", "fitness", "energy"],
        objectives: [
          { name: "consciousness", weight: 0.4, maximize: true },
          { name: "quantum_coherence", weight: 0.3, maximize: true },
          { name: "fitness", weight: 0.2, maximize: true },
          { name: "energy_efficiency", weight: 0.1, maximize: true },
        ],
        constraints: [
          { name: "consciousness_threshold", type: "hard", condition: "consciousness >= 0.1" },
          { name: "energy_conservation", type: "soft", condition: "energy <= 1.0" },
        ],
      },
      {
        dimensions: ["performance", "adaptability", "resilience"],
        objectives: [
          { name: "performance", weight: 0.5, maximize: true },
          { name: "adaptability", weight: 0.3, maximize: true },
          { name: "resilience", weight: 0.2, maximize: true },
        ],
        constraints: [{ name: "stability", type: "hard", condition: "performance >= 0.2" }],
      },
    ]

    landscapes.forEach((landscape, index) => this.fitnessLandscapes.set(`landscape_${index}`, landscape))
  }

  // Create new population
  createPopulation(name: string, seedOrganisms: DNAOrganism[], strategy: string): void {
    const evolutionStrategy = this.strategies.get(strategy)
    if (!evolutionStrategy) {
      throw new Error(`Evolution strategy ${strategy} not found`)
    }

    // Generate population from seed organisms
    const population: DNAOrganism[] = []

    // Add seed organisms
    population.push(...seedOrganisms)

    // Generate additional organisms through variation
    while (population.length < evolutionStrategy.parameters.population_size) {
      const parent = seedOrganisms[Math.floor(Math.random() * seedOrganisms.length)]
      const offspring = this.createOffspring(parent)
      population.push(offspring)
    }

    this.populations.set(name, population)
    this.updateMetrics()
  }

  // Create offspring through mutation and crossover
  private createOffspring(parent: DNAOrganism, partner?: DNAOrganism): DNAOrganism {
    let offspring: DNAOrganism

    if (partner && Math.random() < 0.8) {
      // Crossover
      offspring = this.performCrossover(parent, partner)
    } else {
      // Mutation only
      offspring = this.cloneOrganism(parent)
    }

    // Apply mutations
    this.applyMutations(offspring)

    return offspring
  }

  // Perform genetic crossover between two organisms
  private performCrossover(parent1: DNAOrganism, parent2: DNAOrganism): DNAOrganism {
    const offspring = this.cloneOrganism(parent1)

    // State crossover - blend values
    offspring.state.consciousness = (parent1.state.consciousness + parent2.state.consciousness) / 2
    offspring.state.quantum_coherence = (parent1.state.quantum_coherence + parent2.state.quantum_coherence) / 2
    offspring.state.fitness = (parent1.state.fitness + parent2.state.fitness) / 2

    // Gene crossover - mix genes from both parents
    const combinedGenes = [...parent1.genes, ...parent2.genes]
    offspring.genes = this.selectBestGenes(combinedGenes, parent1.genes.length)

    // Evolution config crossover
    offspring.evolution_config.mutation_rate =
      (parent1.evolution_config.mutation_rate + parent2.evolution_config.mutation_rate) / 2

    offspring.state.generation = Math.max(parent1.state.generation, parent2.state.generation) + 1

    this.recordEvolutionEvent({
      type: "crossover",
      timestamp: new Date(),
      organism_id: offspring.id,
      details: { parent1: parent1.id, parent2: parent2.id },
      impact_score: 0.5,
    })

    return offspring
  }

  // Select best genes from a pool
  private selectBestGenes(genePool: DNAGene[], targetCount: number): DNAGene[] {
    // Sort genes by fitness contribution
    const sortedGenes = genePool.sort((a, b) => b.fitness_contribution - a.fitness_contribution)

    // Select top genes with some randomness
    const selectedGenes: DNAGene[] = []
    for (let i = 0; i < targetCount && i < sortedGenes.length; i++) {
      if (Math.random() < 0.8 || i < targetCount / 2) {
        selectedGenes.push({ ...sortedGenes[i], id: `gene_${Date.now()}_${i}` })
      } else {
        // Add some random genes for diversity
        const randomGene = sortedGenes[Math.floor(Math.random() * sortedGenes.length)]
        selectedGenes.push({ ...randomGene, id: `gene_${Date.now()}_${i}` })
      }
    }

    return selectedGenes
  }

  // Apply various types of mutations
  private applyMutations(organism: DNAOrganism): void {
    const mutationTypes: MutationType[] = [
      { name: "consciousness_drift", probability: 0.3, impact: "minor", target: "state" },
      { name: "quantum_fluctuation", probability: 0.2, impact: "moderate", target: "state" },
      { name: "gene_activation", probability: 0.4, impact: "minor", target: "genes" },
      { name: "gene_duplication", probability: 0.1, impact: "major", target: "genes" },
      { name: "workflow_optimization", probability: 0.15, impact: "moderate", target: "workflow" },
      { name: "evolutionary_leap", probability: 0.05, impact: "revolutionary", target: "evolution_config" },
    ]

    mutationTypes.forEach((mutationType) => {
      if (Math.random() < mutationType.probability * organism.evolution_config.mutation_rate) {
        this.applySpecificMutation(organism, mutationType)
      }
    })
  }

  // Apply specific mutation type
  private applySpecificMutation(organism: DNAOrganism, mutationType: MutationType): void {
    const impactMultiplier = {
      minor: 0.05,
      moderate: 0.1,
      major: 0.2,
      revolutionary: 0.5,
    }[mutationType.impact]

    switch (mutationType.target) {
      case "state":
        this.mutateState(organism, impactMultiplier)
        break
      case "genes":
        this.mutateGenes(organism, mutationType.name, impactMultiplier)
        break
      case "workflow":
        this.mutateWorkflow(organism, impactMultiplier)
        break
      case "evolution_config":
        this.mutateEvolutionConfig(organism, impactMultiplier)
        break
    }

    organism.state.mutations++

    this.recordEvolutionEvent({
      type: "mutation",
      timestamp: new Date(),
      organism_id: organism.id,
      details: { mutation_type: mutationType.name, impact: mutationType.impact },
      impact_score: impactMultiplier,
    })
  }

  // Mutate organism state
  private mutateState(organism: DNAOrganism, impact: number): void {
    const mutations = [
      () => {
        organism.state.consciousness += (Math.random() - 0.5) * impact
        organism.state.consciousness = Math.max(0, Math.min(1, organism.state.consciousness))
      },
      () => {
        organism.state.quantum_coherence += (Math.random() - 0.5) * impact
        organism.state.quantum_coherence = Math.max(0, Math.min(1, organism.state.quantum_coherence))
      },
      () => {
        organism.state.fitness += (Math.random() - 0.5) * impact
        organism.state.fitness = Math.max(0, Math.min(1, organism.state.fitness))
      },
    ]

    const mutation = mutations[Math.floor(Math.random() * mutations.length)]
    mutation()
  }

  // Mutate genes
  private mutateGenes(organism: DNAOrganism, mutationType: string, impact: number): void {
    if (organism.genes.length === 0) return

    switch (mutationType) {
      case "gene_activation":
        const gene = organism.genes[Math.floor(Math.random() * organism.genes.length)]
        gene.active = !gene.active
        break

      case "gene_duplication":
        if (organism.genes.length < 10) {
          const sourceGene = organism.genes[Math.floor(Math.random() * organism.genes.length)]
          const duplicatedGene: DNAGene = {
            ...sourceGene,
            id: `gene_${Date.now()}_dup`,
            name: `${sourceGene.name}_duplicate`,
            fitness_contribution: sourceGene.fitness_contribution * (1 + (Math.random() - 0.5) * impact),
          }
          organism.genes.push(duplicatedGene)
        }
        break

      default:
        const randomGene = organism.genes[Math.floor(Math.random() * organism.genes.length)]
        randomGene.fitness_contribution += (Math.random() - 0.5) * impact
        break
    }
  }

  // Mutate workflow
  private mutateWorkflow(organism: DNAOrganism, impact: number): void {
    // Simulate workflow optimization
    organism.state.fitness += impact * 0.1
    organism.state.fitness = Math.max(0, Math.min(1, organism.state.fitness))
  }

  // Mutate evolution configuration
  private mutateEvolutionConfig(organism: DNAOrganism, impact: number): void {
    organism.evolution_config.mutation_rate += (Math.random() - 0.5) * impact * 0.1
    organism.evolution_config.mutation_rate = Math.max(0.01, Math.min(0.5, organism.evolution_config.mutation_rate))

    organism.evolution_config.selection_pressure += (Math.random() - 0.5) * impact * 0.1
    organism.evolution_config.selection_pressure = Math.max(
      0.1,
      Math.min(1.0, organism.evolution_config.selection_pressure),
    )
  }

  // Perform selection based on fitness
  performSelection(populationName: string, strategy: string): void {
    const population = this.populations.get(populationName)
    const evolutionStrategy = this.strategies.get(strategy)

    if (!population || !evolutionStrategy) return

    // Calculate fitness for all organisms
    population.forEach((organism) => {
      organism.state.fitness = this.calculateFitness(organism, "landscape_0")
    })

    // Sort by fitness
    population.sort((a, b) => b.state.fitness - a.state.fitness)

    // Apply selection pressure
    const survivalCount = Math.floor(population.length * evolutionStrategy.parameters.selection_pressure)
    const survivors = population.slice(0, survivalCount)

    // Generate new population
    const newPopulation: DNAOrganism[] = []

    // Keep elite organisms
    const eliteCount = Math.floor(population.length * evolutionStrategy.parameters.elitism_rate)
    newPopulation.push(...survivors.slice(0, eliteCount))

    // Generate offspring to fill population
    while (newPopulation.length < evolutionStrategy.parameters.population_size) {
      const parent1 = this.selectParent(survivors)
      const parent2 = this.selectParent(survivors)
      const offspring = this.createOffspring(parent1, parent2)
      newPopulation.push(offspring)
    }

    this.populations.set(populationName, newPopulation)
    this.updateMetrics()
  }

  // Select parent using tournament selection
  private selectParent(population: DNAOrganism[]): DNAOrganism {
    const tournamentSize = Math.min(5, population.length)
    const tournament = []

    for (let i = 0; i < tournamentSize; i++) {
      tournament.push(population[Math.floor(Math.random() * population.length)])
    }

    return tournament.reduce((best, current) => (current.state.fitness > best.state.fitness ? current : best))
  }

  // Calculate multi-objective fitness
  calculateFitness(organism: DNAOrganism, landscapeName: string): number {
    const landscape = this.fitnessLandscapes.get(landscapeName)
    if (!landscape) return organism.state.fitness

    let totalFitness = 0
    let totalWeight = 0

    landscape.objectives.forEach((objective) => {
      let value = 0

      switch (objective.name) {
        case "consciousness":
          value = organism.state.consciousness
          break
        case "quantum_coherence":
          value = organism.state.quantum_coherence
          break
        case "fitness":
          value = organism.state.fitness
          break
        case "energy_efficiency":
          value = organism.state.energy
          break
        case "performance":
          value = organism.state.fitness * organism.state.consciousness
          break
        case "adaptability":
          value = organism.state.mutations / Math.max(1, organism.state.generation)
          break
        case "resilience":
          value = 1 - Math.abs(0.5 - organism.state.quantum_coherence)
          break
      }

      if (!objective.maximize) {
        value = 1 - value
      }

      totalFitness += value * objective.weight
      totalWeight += objective.weight
    })

    return totalWeight > 0 ? totalFitness / totalWeight : 0
  }

  // Clone organism
  private cloneOrganism(organism: DNAOrganism): DNAOrganism {
    return {
      ...organism,
      id: `organism_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      genes: organism.genes.map((gene) => ({
        ...gene,
        id: `gene_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      })),
      state: { ...organism.state },
      evolution_config: { ...organism.evolution_config },
      created_at: new Date(),
      last_evolution: new Date(),
    }
  }

  // Record evolution event
  private recordEvolutionEvent(event: EvolutionEvent): void {
    this.evolutionHistory.push(event)

    // Keep only recent events (last 1000)
    if (this.evolutionHistory.length > 1000) {
      this.evolutionHistory = this.evolutionHistory.slice(-1000)
    }
  }

  // Update evolution metrics
  private updateMetrics(): void {
    const allOrganisms = Array.from(this.populations.values()).flat()

    if (allOrganisms.length === 0) return

    this.metrics.population_size = allOrganisms.length
    this.metrics.average_fitness = allOrganisms.reduce((sum, org) => sum + org.state.fitness, 0) / allOrganisms.length
    this.metrics.best_fitness = Math.max(...allOrganisms.map((org) => org.state.fitness))

    // Calculate diversity index (simplified)
    const fitnessVariance =
      allOrganisms.reduce((sum, org) => sum + Math.pow(org.state.fitness - this.metrics.average_fitness, 2), 0) /
      allOrganisms.length
    this.metrics.diversity_index = Math.sqrt(fitnessVariance)

    // Calculate species count (organisms with similar fitness)
    const fitnessGroups = new Map<string, number>()
    allOrganisms.forEach((org) => {
      const fitnessGroup = Math.floor(org.state.fitness * 10).toString()
      fitnessGroups.set(fitnessGroup, (fitnessGroups.get(fitnessGroup) || 0) + 1)
    })
    this.metrics.species_count = fitnessGroups.size

    // Update generation
    this.metrics.generation = Math.max(...allOrganisms.map((org) => org.state.generation))
  }

  // Start evolution engine
  private startEvolutionEngine(): void {
    this.evolutionInterval = setInterval(() => {
      if (this.populations.size > 0) {
        this.runEvolutionCycle()
      }
    }, 5000) // Run every 5 seconds
  }

  // Run single evolution cycle
  private runEvolutionCycle(): void {
    this.populations.forEach((population, name) => {
      // Perform selection and evolution
      this.performSelection(name, "Adaptive Genetic Algorithm")

      // Check for speciation events
      this.checkSpeciation(name)

      // Check for extinction events
      this.checkExtinction(name)
    })

    this.updateMetrics()
  }

  // Check for speciation
  private checkSpeciation(populationName: string): void {
    const population = this.populations.get(populationName)
    if (!population) return

    // Simple speciation check based on fitness clustering
    const fitnessThreshold = 0.1
    const species = new Map<string, DNAOrganism[]>()

    population.forEach((organism) => {
      const fitnessGroup = Math.floor(organism.state.fitness / fitnessThreshold).toString()
      if (!species.has(fitnessGroup)) {
        species.set(fitnessGroup, [])
      }
      species.get(fitnessGroup)!.push(organism)
    })

    if (species.size > this.metrics.species_count) {
      this.recordEvolutionEvent({
        type: "speciation",
        timestamp: new Date(),
        organism_id: "population",
        details: { new_species_count: species.size, population: populationName },
        impact_score: 0.8,
      })
    }
  }

  // Check for extinction events
  private checkExtinction(populationName: string): void {
    const population = this.populations.get(populationName)
    if (!population) return

    const lowFitnessCount = population.filter((org) => org.state.fitness < 0.1).length
    const extinctionThreshold = population.length * 0.8

    if (lowFitnessCount > extinctionThreshold) {
      this.recordEvolutionEvent({
        type: "extinction",
        timestamp: new Date(),
        organism_id: "population",
        details: { extinct_count: lowFitnessCount, population: populationName },
        impact_score: -0.9,
      })

      this.metrics.extinction_events++
    }
  }

  // Public API methods
  getPopulations(): Map<string, DNAOrganism[]> {
    return this.populations
  }

  getMetrics(): EvolutionMetrics {
    return { ...this.metrics }
  }

  getEvolutionHistory(): EvolutionEvent[] {
    return [...this.evolutionHistory]
  }

  getStrategies(): Map<string, EvolutionStrategy> {
    return this.strategies
  }

  addStrategy(strategy: EvolutionStrategy): void {
    this.strategies.set(strategy.name, strategy)
  }

  // Cleanup
  destroy(): void {
    if (this.evolutionInterval) {
      clearInterval(this.evolutionInterval)
    }
    this.populations.clear()
    this.evolutionHistory.length = 0
  }
}

// Global G'volution engine instance
export const gvolutionEngine = new GvolutionEngine()
