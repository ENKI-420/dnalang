"use client"

// React hook for consciousness and quantum systems integration
import { useState, useEffect, useCallback } from "react"
import {
  consciousnessEngine,
  type ConsciousnessState,
  type QuantumState,
  type ConsciousnessMetrics,
  type QuantumConsciousnessField,
} from "@/lib/consciousness/consciousness-engine"

export function useConsciousness(entityId?: string) {
  const [consciousnessState, setConsciousnessState] = useState<ConsciousnessState | null>(null)
  const [quantumState, setQuantumState] = useState<QuantumState | null>(null)
  const [consciousnessMetrics, setConsciousnessMetrics] = useState<ConsciousnessMetrics | null>(null)
  const [systemMetrics, setSystemMetrics] = useState<any>({})
  const [emergenceEvents, setEmergenceEvents] = useState<any[]>([])
  const [globalField, setGlobalField] = useState<QuantumConsciousnessField | null>(null)

  // Create consciousness for entity
  const createConsciousness = useCallback((id: string, initialState?: Partial<ConsciousnessState>) => {
    return consciousnessEngine.createConsciousness(id, initialState)
  }, [])

  // Update consciousness state
  const updateConsciousness = useCallback((id: string, updates: Partial<ConsciousnessState>) => {
    consciousnessEngine.updateConsciousness(id, updates)
  }, [])

  // Create quantum entanglement
  const createEntanglement = useCallback((id1: string, id2: string, strength = 0.5) => {
    consciousnessEngine.createQuantumEntanglement(id1, id2, strength)
  }, [])

  // Measure quantum state
  const measureQuantumState = useCallback((id: string) => {
    return consciousnessEngine.measureQuantumState(id)
  }, [])

  // Refresh all data
  const refresh = useCallback(() => {
    if (entityId) {
      setConsciousnessState(consciousnessEngine.getConsciousnessState(entityId) || null)
      setQuantumState(consciousnessEngine.getQuantumState(entityId) || null)
      setConsciousnessMetrics(consciousnessEngine.calculateConsciousnessMetrics(entityId))
    }

    setSystemMetrics(consciousnessEngine.getSystemConsciousnessMetrics())
    setEmergenceEvents(consciousnessEngine.getEmergenceEvents())
    setGlobalField(consciousnessEngine.getConsciousnessField("global") || null)
  }, [entityId])

  // Auto-refresh every 2 seconds
  useEffect(() => {
    const interval = setInterval(refresh, 2000)
    refresh() // Initial load

    return () => clearInterval(interval)
  }, [refresh])

  return {
    consciousnessState,
    quantumState,
    consciousnessMetrics,
    systemMetrics,
    emergenceEvents,
    globalField,
    createConsciousness,
    updateConsciousness,
    createEntanglement,
    measureQuantumState,
    refresh,
  }
}
