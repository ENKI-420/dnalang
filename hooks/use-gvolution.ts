"use client"

// React hook for G'volution engine integration
import { useState, useEffect, useCallback } from "react"
import {
  gvolutionEngine,
  type EvolutionMetrics,
  type EvolutionEvent,
  type EvolutionStrategy,
} from "@/lib/evolution/gvolution-engine"
import { useDNARuntime } from "./use-dna-runtime"

export function useGvolution() {
  const { organisms } = useDNARuntime()
  const [metrics, setMetrics] = useState<EvolutionMetrics>({
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
  })
  const [evolutionHistory, setEvolutionHistory] = useState<EvolutionEvent[]>([])
  const [strategies, setStrategies] = useState<EvolutionStrategy[]>([])
  const [populations, setPopulations] = useState<Map<string, any[]>>(new Map())
  const [isEvolutionActive, setIsEvolutionActive] = useState(false)

  // Initialize evolution with current organisms
  const initializeEvolution = useCallback(() => {
    if (organisms.length > 0) {
      gvolutionEngine.createPopulation("main", organisms, "Adaptive Genetic Algorithm")
      setIsEvolutionActive(true)
    }
  }, [organisms])

  // Refresh evolution data
  const refresh = useCallback(() => {
    setMetrics(gvolutionEngine.getMetrics())
    setEvolutionHistory(gvolutionEngine.getEvolutionHistory())
    setStrategies(Array.from(gvolutionEngine.getStrategies().values()))
    setPopulations(gvolutionEngine.getPopulations())
  }, [])

  // Create new population
  const createPopulation = useCallback(
    (name: string, seedOrganisms: any[], strategy: string) => {
      gvolutionEngine.createPopulation(name, seedOrganisms, strategy)
      refresh()
    },
    [refresh],
  )

  // Add evolution strategy
  const addStrategy = useCallback(
    (strategy: EvolutionStrategy) => {
      gvolutionEngine.addStrategy(strategy)
      refresh()
    },
    [refresh],
  )

  // Auto-refresh every 3 seconds
  useEffect(() => {
    const interval = setInterval(refresh, 3000)
    refresh() // Initial load

    return () => clearInterval(interval)
  }, [refresh])

  // Auto-initialize evolution when organisms are available
  useEffect(() => {
    if (!isEvolutionActive && organisms.length > 0) {
      initializeEvolution()
    }
  }, [organisms, isEvolutionActive, initializeEvolution])

  return {
    metrics,
    evolutionHistory,
    strategies,
    populations,
    isEvolutionActive,
    createPopulation,
    addStrategy,
    initializeEvolution,
    refresh,
  }
}
