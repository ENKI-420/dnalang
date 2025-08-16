"use client"

// React hook for DNA-Lang compilation
import { useState, useCallback } from "react"
import { DNACompiler, type CompilationResult } from "../lib/dna/dna-compiler"
import { dnaRuntime } from "../lib/dna/dna-runtime"

export function useDNACompiler() {
  const [isCompiling, setIsCompiling] = useState(false)
  const [lastResult, setLastResult] = useState<CompilationResult | null>(null)
  const [compilationHistory, setCompilationHistory] = useState<CompilationResult[]>([])

  const compile = useCallback(async (code: string, options = {}) => {
    setIsCompiling(true)

    try {
      const result = await DNACompiler.compile(code, options)
      setLastResult(result)
      setCompilationHistory((prev) => [...prev.slice(-9), result]) // Keep last 10 results

      // If compilation successful, add organism to runtime
      if (result.success && result.organism) {
        dnaRuntime.createOrganism(result.organism)
      }

      return result
    } catch (error) {
      const errorResult: CompilationResult = {
        success: false,
        errors: [
          {
            line: 0,
            column: 0,
            message: error.message,
            type: "runtime",
            severity: "error",
          },
        ],
        warnings: [],
        metadata: {
          compile_time: 0,
          organism_complexity: 0,
          gene_count: 0,
          workflow_complexity: 0,
          estimated_performance: 0,
        },
      }
      setLastResult(errorResult)
      return errorResult
    } finally {
      setIsCompiling(false)
    }
  }, [])

  const validateSyntax = useCallback(async (code: string) => {
    const result = await DNACompiler.compile(code, { generateBytecode: false })
    return result.errors.filter((error) => error.type === "syntax")
  }, [])

  const getCompilationStats = useCallback(() => {
    if (compilationHistory.length === 0) return null

    const successful = compilationHistory.filter((r) => r.success).length
    const avgCompileTime =
      compilationHistory.reduce((sum, r) => sum + r.metadata.compile_time, 0) / compilationHistory.length
    const avgComplexity =
      compilationHistory.reduce((sum, r) => sum + r.metadata.organism_complexity, 0) / compilationHistory.length

    return {
      totalCompilations: compilationHistory.length,
      successRate: successful / compilationHistory.length,
      averageCompileTime: avgCompileTime,
      averageComplexity: avgComplexity,
    }
  }, [compilationHistory])

  return {
    compile,
    validateSyntax,
    isCompiling,
    lastResult,
    compilationHistory,
    getCompilationStats,
  }
}
