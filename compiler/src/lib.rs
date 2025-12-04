//! DNALang Compiler Library
//!
//! Provides compilation infrastructure for the bifurcated dual-language architecture:
//! - dna::}{::lang (organism-layer)
//! - 7dCRSM::}{::lang (manifold-layer)
//!
//! Core components:
//! - AST: Abstract syntax trees for both languages
//! - IR: Omega intermediate representation
//! - Binding: Ω_bind operator fusing ASTs into Z3 state
//! - Duality Pass: Bifurcation and projector transformations

pub mod ast;
pub mod binding;
pub mod duality_pass;
pub mod ir;

// Re-exports for convenience
pub use ast::{CrsmProgram, DnaProgram, Manifold, Organism};
pub use binding::{generate_omega_ir, omega_bind, Z3State, GAMMA_TOLERANCE, THETA_CRITICAL, XI_THRESHOLD};
pub use duality_pass::{bifurcate, involution_j, pi_minus, pi_plus, BifurcationResult, DualityPass};
pub use ir::OmegaIR;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_library_exports() {
        // Verify all key types are accessible
        let _dna = DnaProgram::new();
        let _crsm = CrsmProgram::new();
        let _ir = OmegaIR::new();
        let _state = Z3State::new();
        let _pass = DualityPass::new();
    }

    #[test]
    fn test_end_to_end_compilation() {
        use crate::ast::{Field, Gene, Hamiltonian};

        // Create DNA program
        let mut dna = DnaProgram::new();
        let mut organism = Organism::new("CRSM7_Z3MESH");
        organism.fields.push(Field::new("lambda", "coherence"));
        organism.fields.push(Field::new("gamma", "decoherence"));
        organism.genes.push(Gene::new("main"));
        dna.add_organism(organism);

        // Create CRSM program
        let mut crsm = CrsmProgram::new();
        let mut manifold = Manifold::new("CRSM7");
        manifold.hamiltonian = Hamiltonian::new("H_CRSM");
        crsm.add_manifold(manifold);

        // Bind and generate IR
        let state = omega_bind(&dna, &crsm);
        let ir = generate_omega_ir(&dna, &crsm);

        assert!(state.lambda > 0.0);
        assert!(!ir.gene_ops.is_empty() || !ir.field_coords.is_empty());
    }
}
