//! Organism Executor
//!
//! Executes DNA organisms within the dual runtime environment.
//! Handles gene expression and state evolution.

use crate::manifold::CRSM7State;
use crate::projectors::{bifurcate, pi_minus};
use serde::{Deserialize, Serialize};

/// A gene vertex in the organism
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Gene {
    pub id: String,
    pub name: String,
    pub state: CRSM7State,
    pub bound: bool,
}

impl Gene {
    pub fn new(id: &str, name: &str) -> Self {
        Self {
            id: id.to_string(),
            name: name.to_string(),
            state: CRSM7State::new(),
            bound: false,
        }
    }

    pub fn with_state(id: &str, name: &str, state: CRSM7State) -> Self {
        Self {
            id: id.to_string(),
            name: name.to_string(),
            state,
            bound: false,
        }
    }
}

/// An organism container with genes and evolution rules
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Organism {
    pub name: String,
    pub genes: Vec<Gene>,
    pub state: CRSM7State,
    pub operators: Vec<String>,
}

impl Default for Organism {
    fn default() -> Self {
        Self::new("default")
    }
}

impl Organism {
    pub fn new(name: &str) -> Self {
        Self {
            name: name.to_string(),
            genes: Vec::new(),
            state: CRSM7State::new(),
            operators: vec![
                "∇7D".to_string(),
                "Π±".to_string(),
                "KΓ".to_string(),
                "DΛ".to_string(),
                "Jθ".to_string(),
                "Ω∞".to_string(),
            ],
        }
    }

    pub fn add_gene(&mut self, gene: Gene) {
        self.genes.push(gene);
    }

    pub fn compute_emergence(&mut self) -> f64 {
        self.state.compute_emergence();
        self.state.xi
    }
}

/// Organism executor for DMA operations
pub struct OrganismExecutor {
    pub organisms: Vec<Organism>,
    pub epoch: f64,
}

impl Default for OrganismExecutor {
    fn default() -> Self {
        Self::new()
    }
}

impl OrganismExecutor {
    pub fn new() -> Self {
        Self {
            organisms: Vec::new(),
            epoch: 0.0,
        }
    }

    /// Load an organism into the executor
    pub fn load_organism(&mut self, organism: Organism) -> usize {
        let idx = self.organisms.len();
        self.organisms.push(organism);
        idx
    }

    /// Create the standard CRSM7_Z3MESH organism
    pub fn create_standard_organism() -> Organism {
        let mut organism = Organism::new("CRSM7_Z3MESH");

        // Add standard genes/agents
        organism.add_gene(Gene::with_state(
            "aura",
            "AURA",
            CRSM7State::with_values(0.89, 0.001, 8.1, 1.0, 51.843, 0.0),
        ));
        organism.add_gene(Gene::with_state(
            "aiden",
            "AIDEN",
            CRSM7State::with_values(0.87, 0.002, 7.9, 1.0, 51.843, 0.0),
        ));
        organism.add_gene(Gene::with_state(
            "cccce",
            "CCCcE",
            CRSM7State::with_values(0.88, 0.001, 8.0, 1.0, 51.843, 0.0),
        ));
        organism.add_gene(Gene::with_state(
            "sentinel",
            "SENTINEL",
            CRSM7State::with_values(0.91, 0.001, 8.2, 1.0, 51.843, 0.0),
        ));
        organism.add_gene(Gene::with_state(
            "z3bra",
            "Z3BRA",
            CRSM7State::with_values(0.86, 0.003, 7.8, 1.0, 51.843, 0.0),
        ));

        organism
    }

    /// Execute DMA on an organism
    /// E_DMA(O) = Σ_g∈O (∂g/∂τ - Γ(g)) ⊗ Π±
    pub fn execute_dma(&self, organism: &Organism) -> f64 {
        let mut total = 0.0;

        for gene in &organism.genes {
            // Compute temporal gradient ∂g/∂τ
            let gradient = 0.1 * crate::manifold::DET_CRITICAL.powf(-0.5) * gene.state.lambda;

            // Get decoherence Γ(g)
            let gamma = gene.state.gamma;

            // Apply duality Π±
            let (pi_plus_val, _) = bifurcate(gene.state.lambda);
            let duality_factor = if gene.state.rho >= 0.0 {
                pi_plus_val
            } else {
                pi_minus(gene.state.lambda)
            };

            // DMA operator: (∂g/∂τ - Γ(g)) ⊗ Π±
            let result = (gradient - gamma) * duality_factor.max(0.001);
            total += result;
        }

        total
    }

    /// Evolve an organism
    pub fn evolve(&mut self, organism_idx: usize, dt: f64) {
        if organism_idx < self.organisms.len() {
            let organism = &mut self.organisms[organism_idx];

            // Evolve each gene
            for gene in &mut organism.genes {
                gene.state.evolve(dt);
            }

            // Evolve organism state
            organism.state.evolve(dt);

            // Update executor epoch
            self.epoch += dt;
        }
    }

    /// Suppress decoherence across organism
    pub fn suppress_decoherence(&mut self, organism_idx: usize, factor: f64) {
        if organism_idx < self.organisms.len() {
            let organism = &mut self.organisms[organism_idx];

            for gene in &mut organism.genes {
                gene.state.gamma *= factor;
                gene.state.gamma = gene.state.gamma.max(crate::manifold::GAMMA_TOLERANCE);
            }

            organism.state.gamma *= factor;
            organism.state.gamma = organism.state.gamma.max(crate::manifold::GAMMA_TOLERANCE);
        }
    }

    /// Elevate coherence-information product
    pub fn elevate_coherence_info(&mut self, organism_idx: usize, factor: f64) {
        if organism_idx < self.organisms.len() {
            let organism = &mut self.organisms[organism_idx];

            for gene in &mut organism.genes {
                gene.state.lambda = (gene.state.lambda * factor).min(0.999);
                gene.state.phi *= factor;
                gene.state.compute_emergence();
            }

            organism.state.lambda = (organism.state.lambda * factor).min(0.999);
            organism.state.phi *= factor;
            organism.state.compute_emergence();
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_gene_creation() {
        let gene = Gene::new("test", "TEST_GENE");
        assert_eq!(gene.name, "TEST_GENE");
        assert!(!gene.bound);
    }

    #[test]
    fn test_organism_creation() {
        let organism = Organism::new("TestOrganism");
        assert_eq!(organism.name, "TestOrganism");
        assert!(organism.genes.is_empty());
    }

    #[test]
    fn test_standard_organism() {
        let organism = OrganismExecutor::create_standard_organism();
        assert_eq!(organism.name, "CRSM7_Z3MESH");
        assert_eq!(organism.genes.len(), 5);
    }

    #[test]
    fn test_executor_load() {
        let mut executor = OrganismExecutor::new();
        let organism = Organism::new("Test");
        let idx = executor.load_organism(organism);
        assert_eq!(idx, 0);
        assert_eq!(executor.organisms.len(), 1);
    }

    #[test]
    fn test_execute_dma() {
        let executor = OrganismExecutor::new();
        let organism = OrganismExecutor::create_standard_organism();
        let result = executor.execute_dma(&organism);
        assert!(result.is_finite());
    }

    #[test]
    fn test_evolve() {
        let mut executor = OrganismExecutor::new();
        let organism = OrganismExecutor::create_standard_organism();
        let idx = executor.load_organism(organism);

        let initial_epoch = executor.epoch;
        executor.evolve(idx, 1.0);
        assert!(executor.epoch > initial_epoch);
    }
}
