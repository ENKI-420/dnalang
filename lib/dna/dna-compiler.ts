// Advanced DNA-Lang Compiler - Full compilation pipeline for biological programming
import { DNAParser, type ParsedOrganism } from "./dna-parser"
import type { DNAOrganism } from "./dna-runtime"

export interface CompilationResult {
  success: boolean
  organism?: DNAOrganism
  errors: CompilationError[]
  warnings: string[]
  bytecode?: string
  metadata: CompilationMetadata
}

export interface CompilationError {
  line: number
  column: number
  message: string
  type: "syntax" | "semantic" | "runtime"
  severity: "error" | "warning"
}

export interface CompilationMetadata {
  compile_time: number
  organism_complexity: number
  gene_count: number
  workflow_complexity: number
  estimated_performance: number
}

export class DNACompiler {
  private static readonly RESERVED_KEYWORDS = [
    "organism",
    "gene",
    "state",
    "workflow",
    "evolution",
    "consciousness",
    "quantum_coherence",
    "fitness",
    "energy",
    "mutate",
    "evolve",
    "while",
    "if",
    "else",
    "for",
    "function",
    "return",
    "true",
    "false",
    "null",
  ]

  private static readonly GENE_TYPES = ["sensor", "processor", "actuator", "memory"]
  private static readonly STATE_TYPES = ["float", "int", "string", "bool", "vector"]

  // Main compilation entry point
  static async compile(dnaCode: string, options: CompilationOptions = {}): Promise<CompilationResult> {
    const startTime = Date.now()
    const result: CompilationResult = {
      success: false,
      errors: [],
      warnings: [],
      metadata: {
        compile_time: 0,
        organism_complexity: 0,
        gene_count: 0,
        workflow_complexity: 0,
        estimated_performance: 0,
      },
    }

    try {
      // Phase 1: Lexical Analysis
      const tokens = this.tokenize(dnaCode)

      // Phase 2: Syntax Analysis
      const syntaxErrors = this.validateSyntax(dnaCode)
      if (syntaxErrors.length > 0) {
        result.errors.push(...syntaxErrors)
        return result
      }

      // Phase 3: Semantic Analysis
      const parsed = DNAParser.parse(dnaCode)
      const semanticErrors = this.validateSemantics(parsed)
      if (semanticErrors.length > 0) {
        result.errors.push(...semanticErrors)
        return result
      }

      // Phase 4: Optimization
      const optimized = this.optimizeOrganism(parsed)

      // Phase 5: Code Generation
      const organism = this.generateOrganism(optimized)

      // Phase 6: Bytecode Generation (optional)
      if (options.generateBytecode) {
        result.bytecode = this.generateBytecode(organism)
      }

      // Calculate metadata
      result.metadata = {
        compile_time: Date.now() - startTime,
        organism_complexity: this.calculateComplexity(parsed),
        gene_count: parsed.genes.length,
        workflow_complexity: this.calculateWorkflowComplexity(parsed.workflow),
        estimated_performance: this.estimatePerformance(parsed),
      }

      result.success = true
      result.organism = organism
      result.warnings = this.generateWarnings(parsed)
    } catch (error) {
      result.errors.push({
        line: 0,
        column: 0,
        message: `Compilation failed: ${error.message}`,
        type: "runtime",
        severity: "error",
      })
    }

    return result
  }

  // Advanced tokenization with position tracking
  private static tokenize(code: string): Token[] {
    const tokens: Token[] = []
    const lines = code.split("\n")

    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum]
      let column = 0

      while (column < line.length) {
        const char = line[column]

        // Skip whitespace
        if (/\s/.test(char)) {
          column++
          continue
        }

        // Comments
        if (char === "/" && line[column + 1] === "/") {
          break // Skip rest of line
        }

        // String literals
        if (char === '"' || char === "'") {
          const quote = char
          let value = ""
          column++

          while (column < line.length && line[column] !== quote) {
            value += line[column]
            column++
          }

          tokens.push({
            type: "STRING",
            value,
            line: lineNum + 1,
            column: column - value.length,
          })
          column++ // Skip closing quote
          continue
        }

        // Numbers
        if (/\d/.test(char)) {
          let value = ""
          while (column < line.length && /[\d.]/.test(line[column])) {
            value += line[column]
            column++
          }

          tokens.push({
            type: "NUMBER",
            value,
            line: lineNum + 1,
            column: column - value.length,
          })
          continue
        }

        // Identifiers and keywords
        if (/[a-zA-Z_]/.test(char)) {
          let value = ""
          while (column < line.length && /[a-zA-Z0-9_]/.test(line[column])) {
            value += line[column]
            column++
          }

          const type = this.RESERVED_KEYWORDS.includes(value) ? "KEYWORD" : "IDENTIFIER"
          tokens.push({
            type,
            value,
            line: lineNum + 1,
            column: column - value.length,
          })
          continue
        }

        // Operators and punctuation
        const operators = ["==", "!=", "<=", ">=", "&&", "||", "++", "--"]
        let found = false

        for (const op of operators) {
          if (line.substr(column, op.length) === op) {
            tokens.push({
              type: "OPERATOR",
              value: op,
              line: lineNum + 1,
              column,
            })
            column += op.length
            found = true
            break
          }
        }

        if (!found) {
          // Single character tokens
          tokens.push({
            type: "PUNCTUATION",
            value: char,
            line: lineNum + 1,
            column,
          })
          column++
        }
      }
    }

    return tokens
  }

  // Comprehensive syntax validation
  private static validateSyntax(code: string): CompilationError[] {
    const errors: CompilationError[] = []
    const lines = code.split("\n")

    let braceCount = 0
    let inOrganism = false
    let hasOrganismDeclaration = false

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      const lineNum = i + 1

      if (!line || line.startsWith("//")) continue

      // Check organism declaration
      if (line.startsWith("organism ")) {
        if (hasOrganismDeclaration) {
          errors.push({
            line: lineNum,
            column: 0,
            message: "Multiple organism declarations not allowed",
            type: "syntax",
            severity: "error",
          })
        }
        hasOrganismDeclaration = true
        inOrganism = true
      }

      // Track braces
      braceCount += (line.match(/{/g) || []).length
      braceCount -= (line.match(/}/g) || []).length

      // Validate section declarations
      if (["state", "gene", "workflow", "evolution"].some((section) => line === `${section} {`)) {
        if (!inOrganism) {
          errors.push({
            line: lineNum,
            column: 0,
            message: `${line.split(" ")[0]} section must be inside organism`,
            type: "syntax",
            severity: "error",
          })
        }
      }

      // Validate gene declarations
      if (line.startsWith("gene ")) {
        const geneName = line.split(" ")[1]?.replace("{", "").trim()
        if (!geneName || !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(geneName)) {
          errors.push({
            line: lineNum,
            column: 5,
            message: "Invalid gene name",
            type: "syntax",
            severity: "error",
          })
        }
      }

      // Validate state variable declarations
      if (line.includes(":") && line.includes("=") && line.endsWith(";")) {
        const match = line.match(/(\w+):\s*(\w+)\s*=\s*([^;]+);/)
        if (match) {
          const [, name, type, value] = match
          if (!this.STATE_TYPES.includes(type)) {
            errors.push({
              line: lineNum,
              column: line.indexOf(type),
              message: `Unknown state type: ${type}`,
              type: "semantic",
              severity: "error",
            })
          }
        }
      }
    }

    // Check for unmatched braces
    if (braceCount !== 0) {
      errors.push({
        line: lines.length,
        column: 0,
        message: "Unmatched braces",
        type: "syntax",
        severity: "error",
      })
    }

    if (!hasOrganismDeclaration) {
      errors.push({
        line: 1,
        column: 0,
        message: "Missing organism declaration",
        type: "syntax",
        severity: "error",
      })
    }

    return errors
  }

  // Semantic analysis and validation
  private static validateSemantics(parsed: ParsedOrganism): CompilationError[] {
    const errors: CompilationError[] = []

    // Validate organism name
    if (!parsed.name || !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(parsed.name)) {
      errors.push({
        line: 1,
        column: 0,
        message: "Invalid organism name",
        type: "semantic",
        severity: "error",
      })
    }

    // Validate genes
    const geneNames = new Set<string>()
    for (const gene of parsed.genes) {
      if (geneNames.has(gene.name)) {
        errors.push({
          line: 0,
          column: 0,
          message: `Duplicate gene name: ${gene.name}`,
          type: "semantic",
          severity: "error",
        })
      }
      geneNames.add(gene.name)

      if (!this.GENE_TYPES.includes(gene.type)) {
        errors.push({
          line: 0,
          column: 0,
          message: `Invalid gene type: ${gene.type}`,
          type: "semantic",
          severity: "error",
        })
      }
    }

    // Validate state variables
    for (const [name, value] of Object.entries(parsed.state)) {
      if (typeof value === "number" && (value < 0 || value > 1)) {
        errors.push({
          line: 0,
          column: 0,
          message: `State variable ${name} should be between 0 and 1`,
          type: "semantic",
          severity: "warning",
        })
      }
    }

    return errors
  }

  // Organism optimization
  private static optimizeOrganism(parsed: ParsedOrganism): ParsedOrganism {
    const optimized = { ...parsed }

    // Remove duplicate genes
    const uniqueGenes = new Map()
    for (const gene of optimized.genes) {
      if (!uniqueGenes.has(gene.name) || gene.code.length > uniqueGenes.get(gene.name).code.length) {
        uniqueGenes.set(gene.name, gene)
      }
    }
    optimized.genes = Array.from(uniqueGenes.values())

    // Optimize workflow
    optimized.workflow = optimized.workflow.replace(/\s+/g, " ").replace(/;\s*;/g, ";").trim()

    return optimized
  }

  // Generate executable organism
  private static generateOrganism(parsed: ParsedOrganism): DNAOrganism {
    const organism = DNAParser.toRuntimeOrganism(parsed)

    // Add compilation metadata
    organism.metadata = {
      compiled_at: new Date(),
      compiler_version: "1.0.0",
      optimization_level: "standard",
    }

    return organism
  }

  // Generate bytecode representation
  private static generateBytecode(organism: DNAOrganism): string {
    const bytecode = {
      version: "1.0",
      organism: {
        name: organism.name,
        state_size: Object.keys(organism.state).length,
        gene_count: organism.genes.length,
      },
      instructions: ["INIT_STATE", "LOAD_GENES", "START_WORKFLOW", "EVOLUTION_LOOP"],
    }

    return JSON.stringify(bytecode, null, 2)
  }

  // Calculate organism complexity
  private static calculateComplexity(parsed: ParsedOrganism): number {
    const stateComplexity = Object.keys(parsed.state).length * 0.1
    const geneComplexity = parsed.genes.reduce((sum, gene) => sum + gene.code.length * 0.001, 0)
    const workflowComplexity = parsed.workflow.length * 0.001

    return Math.min(1, stateComplexity + geneComplexity + workflowComplexity)
  }

  // Calculate workflow complexity
  private static calculateWorkflowComplexity(workflow: string): number {
    const controlStructures = (workflow.match(/\b(while|if|for)\b/g) || []).length
    const functionCalls = (workflow.match(/\w+\(/g) || []).length
    const operators = (workflow.match(/[+\-*/=<>!&|]/g) || []).length

    return Math.min(1, controlStructures * 0.2 + functionCalls * 0.1 + operators * 0.05)
  }

  // Estimate performance
  private static estimatePerformance(parsed: ParsedOrganism): number {
    const geneEfficiency = parsed.genes.length > 0 ? 1 / Math.sqrt(parsed.genes.length) : 1
    const stateEfficiency =
      Object.keys(parsed.state).length > 0 ? 1 / Math.log(Object.keys(parsed.state).length + 1) : 1
    const workflowEfficiency = parsed.workflow.length > 0 ? Math.max(0.1, 1 - parsed.workflow.length * 0.0001) : 1

    return (geneEfficiency + stateEfficiency + workflowEfficiency) / 3
  }

  // Generate compilation warnings
  private static generateWarnings(parsed: ParsedOrganism): string[] {
    const warnings: string[] = []

    if (parsed.genes.length === 0) {
      warnings.push("Organism has no genes - consider adding at least one gene for functionality")
    }

    if (parsed.genes.length > 10) {
      warnings.push("Large number of genes may impact performance - consider optimization")
    }

    if (!parsed.workflow.includes("evolve")) {
      warnings.push("Workflow does not include evolution - organism may not adapt over time")
    }

    if (Object.keys(parsed.state).length === 0) {
      warnings.push("No state variables defined - organism may lack memory")
    }

    return warnings
  }
}

// Supporting interfaces
interface Token {
  type: "KEYWORD" | "IDENTIFIER" | "NUMBER" | "STRING" | "OPERATOR" | "PUNCTUATION"
  value: string
  line: number
  column: number
}

interface CompilationOptions {
  generateBytecode?: boolean
  optimizationLevel?: "none" | "basic" | "standard" | "aggressive"
  targetPlatform?: "web" | "node" | "quantum"
  debugMode?: boolean
}

// Export compiler instance
export const dnaCompiler = new DNACompiler()
