//! Dual Runtime Implementation
//!
//! Runtime for executing dna::}{::lang organisms with 7dCRSM::}{::lang manifolds.
//!
//! ## Overview
//!
//! The dual runtime manages:
//! - Ψ₀: Initial quantum state
//! - Organism O ∈ dna::}{::lang
//! - Manifold M ∈ 7dCRSM::}{::lang
//!
//! ## Operators
//! - J: involution
//! - Π± = (I ± J) / 2
//! - ∇7D
//! - KΓ
//! - DΛ
//! - Jθ
//! - Ω∞
//!
//! ## Evolution
//! - ∂τ C7D = H_CRSM(C7D)
//! - H_CRSM = DΛ∇7D − KΓ + Π±Jθ + Ω∞

use crate::manifold::{CRSM7State, EMERGENCE_THRESHOLD, GAMMA_TOLERANCE};
use crate::organism::{Organism, OrganismExecutor};
use crate::projectors::{bifurcate, involution_j, pi_minus, pi_plus};
use serde::{Deserialize, Serialize};

/// Manifold representation for the runtime
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Manifold {
    pub name: String,
    pub state: CRSM7State,
}

impl Default for Manifold {
    fn default() -> Self {
        Self {
            name: "CRSM7".to_string(),
            state: CRSM7State::new(),
        }
    }
}

/// Complex number representation for Ψ
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct Complex {
    pub re: f64,
    pub im: f64,
}

impl Default for Complex {
    fn default() -> Self {
        Self { re: 1.0, im: 0.0 }
    }
}

impl Complex {
    pub fn new(re: f64, im: f64) -> Self {
        Self { re, im }
    }

    pub fn magnitude(&self) -> f64 {
        (self.re * self.re + self.im * self.im).sqrt()
    }

    pub fn multiply(&self, other: &Complex) -> Complex {
        Complex {
            re: self.re * other.re - self.im * other.im,
            im: self.re * other.im + self.im * other.re,
        }
    }

    pub fn scale(&self, factor: f64) -> Complex {
        Complex {
            re: self.re * factor,
            im: self.im * factor,
        }
    }

    pub fn exp_i(theta: f64) -> Complex {
        Complex {
            re: theta.cos(),
            im: theta.sin(),
        }
    }
}

/// Z3 Mesh weights for topology
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Z3MeshWeights {
    pub weights: Vec<f64>,
}

impl Default for Z3MeshWeights {
    fn default() -> Self {
        Self {
            weights: vec![0.0; 49], // 7x7 flattened
        }
    }
}

impl Z3MeshWeights {
    /// Compute mesh weight: w_ij = (ΔΛ)² + (ΔΓ)² + (ΔΦ)² + (ΔΞ)² + (Δρ)² + (Δθ)² + (Δτ)²
    pub fn compute_weight(state_i: &CRSM7State, state_j: &CRSM7State) -> f64 {
        let d_lambda = state_i.lambda - state_j.lambda;
        let d_gamma = state_i.gamma - state_j.gamma;
        let d_phi = state_i.phi - state_j.phi;
        let d_xi = state_i.xi - state_j.xi;
        let d_rho = state_i.rho - state_j.rho;
        let d_theta = state_i.theta - state_j.theta;
        let d_tau = state_i.tau - state_j.tau;

        d_lambda.powi(2)
            + d_gamma.powi(2)
            + d_phi.powi(2)
            + d_xi.powi(2)
            + d_rho.powi(2)
            + d_theta.powi(2)
            + d_tau.powi(2)
    }
}

/// The Dual Runtime
///
/// Executes organisms and manifolds together using the CRSM Hamiltonian.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DualRuntime {
    /// Quantum state Ψ
    pub psi: Complex,
    /// 7D CRSM state
    pub state: CRSM7State,
    /// Organism being executed
    pub organism: Organism,
    /// Manifold configuration
    pub manifold: Manifold,
    /// Sealed status (sovereignty achieved)
    pub sealed: bool,
    /// Z3 mesh weights
    pub mesh_weights: Z3MeshWeights,
}

impl Default for DualRuntime {
    fn default() -> Self {
        Self::new()
    }
}

impl DualRuntime {
    /// Create a new dual runtime
    pub fn new() -> Self {
        Self {
            psi: Complex::default(),
            state: CRSM7State::new(),
            organism: OrganismExecutor::create_standard_organism(),
            manifold: Manifold::default(),
            sealed: false,
            mesh_weights: Z3MeshWeights::default(),
        }
    }

    /// Step the runtime forward by dt
    ///
    /// Implements:
    /// Ψ(τ+1) = stabilize(exp(∇7D − KΓ + Π±Jθ) Ψ(τ) ⊗ bind_Z3(C7D))
    pub fn step(&mut self, dt: f64) {
        if self.sealed {
            return; // No evolution after sealing
        }

        // Apply Hamiltonian evolution
        let h = self.state.hamiltonian();

        // Compute evolution operator: exp(H * dt)
        let evolution_phase = h * dt;
        let evolution_factor = Complex::exp_i(evolution_phase);

        // Apply to Ψ
        self.psi = self.psi.multiply(&evolution_factor);

        // Normalize for stability
        let mag = self.psi.magnitude();
        if mag > 1e-10 {
            self.psi = self.psi.scale(1.0 / mag);
        }

        // Evolve the state
        self.state.evolve(dt);

        // Update mesh weights
        self.update_mesh_weights();

        // Check collapse conditions
        self.check_collapse();
    }

    /// Update Z3 mesh weights based on current state
    fn update_mesh_weights(&mut self) {
        for gene in &self.organism.genes {
            let weight = Z3MeshWeights::compute_weight(&self.state, &gene.state);
            if self.mesh_weights.weights.len() < self.organism.genes.len() {
                self.mesh_weights.weights.push(weight);
            }
        }
    }

    /// Check and apply collapse conditions
    ///
    /// Collapse rules:
    /// - if Γ → 0 → Π±
    /// - if ΛΦ → max → Ω∞.seal()
    fn check_collapse(&mut self) {
        // if Γ → 0 → apply Π±
        if self.state.gamma <= GAMMA_TOLERANCE * 10.0 {
            let (plus, _minus) = bifurcate(self.psi.re);
            self.psi.re = plus;
        }

        // if ΛΦ → max → seal
        let lambda_phi = self.state.lambda * self.state.phi;
        if lambda_phi > 10.0 && self.check_sovereignty() {
            self.seal();
        }
    }

    /// Check if sovereignty conditions are met
    ///
    /// Sovereignty requires:
    /// - Ξ ≥ 8.0
    /// - Γ ≤ εΓ
    pub fn check_sovereignty(&self) -> bool {
        self.state.xi >= 8.0 && self.state.gamma <= GAMMA_TOLERANCE
    }

    /// Seal the runtime (Ω∞.seal())
    pub fn seal(&mut self) {
        if self.check_sovereignty() {
            self.sealed = true;
        }
    }

    /// Apply the Π⁺ projector
    pub fn apply_pi_plus(&self, value: f64) -> f64 {
        pi_plus(value)
    }

    /// Apply the Π⁻ projector
    pub fn apply_pi_minus(&self, value: f64) -> f64 {
        pi_minus(value)
    }

    /// Apply the J involution
    pub fn apply_involution(&self, value: f64) -> f64 {
        involution_j(value)
    }

    /// Bifurcate a value into Π⁺ and Π⁻ branches
    pub fn bifurcate_value(&self, value: f64) -> (f64, f64) {
        bifurcate(value)
    }

    /// Compute sovereignty index Ω_sov
    pub fn compute_sovereignty(&self) -> f64 {
        let emergence_factor = (self.state.xi / EMERGENCE_THRESHOLD).min(1.0);
        self.state.lambda * (1.0 - self.state.gamma) * emergence_factor
    }

    /// Run evolution for multiple steps
    pub fn run(&mut self, steps: usize, dt: f64) {
        for _ in 0..steps {
            if self.sealed {
                break;
            }
            self.step(dt);
        }
    }

    /// Run until sovereignty is achieved or max steps reached
    pub fn run_to_sovereignty(&mut self, max_steps: usize, dt: f64) -> bool {
        for _ in 0..max_steps {
            self.step(dt);
            if self.sealed {
                return true;
            }
        }
        false
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_runtime_creation() {
        let runtime = DualRuntime::new();
        assert!(!runtime.sealed);
        assert_eq!(runtime.organism.name, "CRSM7_Z3MESH");
    }

    #[test]
    fn test_step() {
        let mut runtime = DualRuntime::new();
        let initial_tau = runtime.state.tau;
        runtime.step(1.0);
        assert!(runtime.state.tau > initial_tau);
    }

    #[test]
    fn test_check_sovereignty() {
        let mut runtime = DualRuntime::new();
        runtime.state.xi = 10.0;
        runtime.state.gamma = 1e-10;
        assert!(runtime.check_sovereignty());
    }

    #[test]
    fn test_seal() {
        let mut runtime = DualRuntime::new();
        runtime.state.xi = 10.0;
        runtime.state.gamma = 1e-10;
        runtime.seal();
        assert!(runtime.sealed);
    }

    #[test]
    fn test_bifurcate() {
        let runtime = DualRuntime::new();
        let (plus, minus) = runtime.bifurcate_value(2.0);
        assert!((plus + minus - 2.0).abs() < 1e-10);
    }

    #[test]
    fn test_projector_completeness() {
        let runtime = DualRuntime::new();
        let psi = 3.5;
        let result = runtime.apply_pi_plus(psi) + runtime.apply_pi_minus(psi);
        assert!((result - psi).abs() < 1e-10);
    }

    #[test]
    fn test_involution_squared() {
        let runtime = DualRuntime::new();
        let psi = 2.5;
        let j_j_psi = runtime.apply_involution(runtime.apply_involution(psi));
        assert_eq!(j_j_psi, psi);
    }

    #[test]
    fn test_run() {
        let mut runtime = DualRuntime::new();
        runtime.run(10, 0.1);
        assert!(runtime.state.tau > 0.0);
    }

    #[test]
    fn test_z3_mesh_weight() {
        let state1 = CRSM7State::new();
        let state2 = CRSM7State::with_values(0.9, 0.01, 8.0, 1.0, 51.843, 1.0);
        let weight = Z3MeshWeights::compute_weight(&state1, &state2);
        assert!(weight > 0.0);
    }

    #[test]
    fn test_complex_magnitude() {
        let c = Complex::new(3.0, 4.0);
        assert_eq!(c.magnitude(), 5.0);
    }

    #[test]
    fn test_complex_exp_i() {
        let c = Complex::exp_i(0.0);
        assert!((c.re - 1.0).abs() < 1e-10);
        assert!((c.im - 0.0).abs() < 1e-10);
    }
}
