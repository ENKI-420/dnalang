// DNA-Lang Parser - Converts DNA syntax to executable organisms
export interface ParsedOrganism {
  name: string
  state: Record<string, any>
  genes: Array<{
    name: string
    type: string
    code: string
  }>
  workflow: string
  evolution: Record<string, any>
}

export class DNAParser {
  // Parse DNA-Lang syntax into organism structure
  static parse(dnaCode: string): ParsedOrganism {
    const lines = dnaCode
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line)

    const organism: ParsedOrganism = {
      name: "",
      state: {},
      genes: [],
      workflow: "",
      evolution: {},
    }

    let currentSection = ""
    let braceDepth = 0
    let currentGene: any = null

    for (const line of lines) {
      // Count braces for nesting
      braceDepth += (line.match(/{/g) || []).length
      braceDepth -= (line.match(/}/g) || []).length

      // Parse organism declaration
      if (line.startsWith("organism ")) {
        organism.name = line.split(" ")[1].replace("{", "").trim()
        continue
      }

      // Parse sections
      if (line === "state {") {
        currentSection = "state"
        continue
      } else if (line.startsWith("gene ")) {
        currentSection = "gene"
        currentGene = {
          name: line.split(" ")[1].replace("{", "").trim(),
          type: "processor",
          code: "",
        }
        continue
      } else if (line === "workflow {") {
        currentSection = "workflow"
        continue
      } else if (line === "evolution {") {
        currentSection = "evolution"
        continue
      }

      // Parse content based on current section
      if (currentSection === "state" && line !== "}") {
        this.parseStateVariable(line, organism.state)
      } else if (currentSection === "gene" && currentGene && line !== "}") {
        if (braceDepth === 1) {
          organism.genes.push(currentGene)
          currentGene = null
        } else {
          currentGene.code += line + "\n"
        }
      } else if (currentSection === "workflow" && line !== "}") {
        organism.workflow += line + "\n"
      } else if (currentSection === "evolution" && line !== "}") {
        this.parseEvolutionConfig(line, organism.evolution)
      }

      // Reset section when closing brace
      if (line === "}" && braceDepth === 0) {
        currentSection = ""
      }
    }

    return organism
  }

  private static parseStateVariable(line: string, state: Record<string, any>): void {
    const match = line.match(/(\w+):\s*(\w+)\s*=\s*([^;]+);/)
    if (match) {
      const [, name, type, value] = match
      state[name] = type === "float" ? Number.parseFloat(value) : value
    }
  }

  private static parseEvolutionConfig(line: string, evolution: Record<string, any>): void {
    if (line.includes("fitness_goal")) {
      const match = line.match(/fitness_goal\s*{\s*([^}]+)\s*}/)
      if (match) {
        evolution.fitness_goal = match[1].trim()
      }
    }
  }

  // Convert parsed organism to runtime organism
  static toRuntimeOrganism(parsed: ParsedOrganism): any {
    return {
      name: parsed.name,
      state: {
        consciousness: parsed.state.consciousness || 0.5,
        quantum_coherence: parsed.state.quantum_coherence || 0.5,
        fitness: parsed.state.fitness || 0.5,
        energy: 1.0,
        mutations: 0,
        generation: 1,
      },
      genes: parsed.genes.map((gene, index) => ({
        id: `gene_${index}`,
        name: gene.name,
        type: gene.type,
        code: gene.code,
        active: true,
        fitness_contribution: 0.1,
      })),
      workflow: parsed.workflow,
      evolution_config: {
        fitness_goal: parsed.evolution.fitness_goal || "maximize(consciousness)",
        mutation_rate: 0.1,
        selection_pressure: 0.8,
      },
    }
  }
}
