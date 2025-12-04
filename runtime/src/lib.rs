//! DNALang Runtime Library
//!
//! Provides runtime execution infrastructure for the bifurcated dual-language architecture:
//! - dna::}{::lang (organism-layer)
//! - 7dCRSM::}{::lang (manifold-layer)
//!
//! ## Core Components
//! - Dual Runtime: Unified execution environment
//! - Projectors: Π⁺, Π⁻, and J involution
//! - Manifold: CRSM7 state evolution
//! - Organism: Gene execution and DMA operations

pub mod dual_runtime;
pub mod manifold;
pub mod organism;
pub mod projectors;

// Re-exports for convenience
pub use dual_runtime::{Complex, DualRuntime, Manifold, Z3MeshWeights};
pub use manifold::{
    CRSM7State, DET_CRITICAL, EMERGENCE_MAX, EMERGENCE_THRESHOLD, GAMMA_TOLERANCE,
    OMEGA_SOV_THRESHOLD, THETA_CRITICAL,
};
pub use organism::{Gene, Organism, OrganismExecutor};
pub use projectors::{bifurcate, involution_j, pi_minus, pi_plus, verify_completeness, verify_j_squared};

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_library_exports() {
        let _runtime = DualRuntime::new();
        let _state = CRSM7State::new();
        let _organism = Organism::new("test");
        let _executor = OrganismExecutor::new();
    }

    #[test]
    fn test_projector_invariants() {
        // Π⁺ + Π⁻ = I
        let psi = 5.0;
        let sum = pi_plus(psi) + pi_minus(psi);
        assert!((sum - psi).abs() < 1e-10);

        // J² = I
        assert!(verify_j_squared(psi));
    }

    #[test]
    fn test_dual_runtime_integration() {
        let mut runtime = DualRuntime::new();

        // Run some evolution
        runtime.run(100, 0.01);

        // Check invariants
        assert!(runtime.state.gamma < 0.012); // Gamma should decrease
        assert!(runtime.state.tau > 0.0); // Time should advance
    }
}
