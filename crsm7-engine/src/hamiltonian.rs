//! CRSM Hamiltonian Implementation
//!
//! H_CRSM = Π± (1-Γ) ∇^6D + θ_51.843° J
//!
//! Equilibrium condition: C' = 0 ⟺ Γ = 0, ΛΦ = max

use crate::duality::DualityOperator;
use crate::state::{CRSM7State, THETA_CRITICAL};
use serde::{Deserialize, Serialize};

/// CRSM Hamiltonian operator
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CRSMHamiltonian {
    /// Coupling constant for gradient term
    pub gradient_coupling: f64,
    /// Torsion coupling constant
    pub torsion_coupling: f64,
    /// Duality operator
    #[serde(skip)]
    pub duality: DualityOperator,
}

impl Default for CRSMHamiltonian {
    fn default() -> Self {
        Self::new()
    }
}

impl CRSMHamiltonian {
    /// Create a new Hamiltonian with default parameters
    pub fn new() -> Self {
        Self {
            gradient_coupling: 1.0,
            torsion_coupling: 1.0,
            duality: DualityOperator::new(),
        }
    }

    /// Create with custom coupling constants
    pub fn with_couplings(gradient: f64, torsion: f64) -> Self {
        Self {
            gradient_coupling: gradient,
            torsion_coupling: torsion,
            duality: DualityOperator::new(),
        }
    }

    /// Compute the 6D gradient operator (simplified)
    /// ∇^6D ≈ sum of state gradients
    fn gradient_6d(&self, state: &CRSM7State) -> f64 {
        // Simplified: product of coherence and information
        state.lambda * state.phi
    }

    /// Compute the full Hamiltonian
    /// H_CRSM = Π± (1-Γ) ∇^6D + θ_51.843° J
    pub fn compute(&self, state: &CRSM7State) -> f64 {
        // Get duality projection based on polarity
        let pi_factor = if state.rho_polarity >= 0.0 {
            0.5 * (1.0 + state.rho_polarity) // Π+ contribution
        } else {
            0.5 * (1.0 - state.rho_polarity.abs()) // Π- contribution
        };

        // Coherence factor (1 - Γ)
        let coherence_factor = 1.0 - state.gamma;

        // 6D gradient
        let grad_6d = self.gradient_6d(state);

        // Torsion term with J involution
        let j_value = self.duality.j_involution(state.rho_polarity);
        let torsion_term = state.theta * j_value;

        // Full Hamiltonian
        self.gradient_coupling * pi_factor * coherence_factor * grad_6d
            + self.torsion_coupling * torsion_term
    }

    /// Check if system is at equilibrium
    /// C' = 0 ⟺ Γ = 0, ΛΦ = max
    pub fn is_equilibrium(&self, state: &CRSM7State) -> bool {
        let gamma_zero = state.gamma < 1e-6;
        let lambda_phi_max = state.lambda > 0.99 && state.phi > 10.0;
        gamma_zero && lambda_phi_max
    }

    /// Compute the time derivative of state (for evolution)
    /// ∂τΨ = α · det(g_A)^(-1/2) Ψ - ∇W²
    pub fn compute_derivative(&self, state: &CRSM7State) -> CRSM7State {
        let alpha: f64 = 0.1;
        let det_g: f64 = 0.61803398875; // 1/φ
        let det_factor = det_g.powf(-0.5);

        let d_lambda = alpha * det_factor * state.lambda;
        let d_gamma = -alpha * state.gamma;
        let d_phi = 0.01 * state.lambda;
        let d_tau = 1.0;

        let mut derivative = CRSM7State::new(
            d_lambda,
            d_gamma.abs(),
            d_phi,
            state.rho_polarity,
            THETA_CRITICAL,
            d_tau,
        );
        derivative.compute_emergence();
        derivative
    }

    /// Apply Hamiltonian evolution for one time step
    pub fn evolve_state(&self, state: &mut CRSM7State, dt: f64) {
        let derivative = self.compute_derivative(state);

        state.lambda += derivative.lambda * dt;
        state.lambda = state.lambda.min(0.999);

        state.gamma *= (-0.1 * dt).exp();
        state.gamma = state.gamma.max(1e-9);

        state.phi += derivative.phi * dt;
        state.tau += dt;

        state.compute_emergence();
    }
}

/// Energy functional for the system
#[derive(Debug, Clone)]
pub struct EnergyFunctional {
    /// Kinetic energy coefficient
    pub kinetic_coeff: f64,
    /// Potential energy coefficient
    pub potential_coeff: f64,
}

impl Default for EnergyFunctional {
    fn default() -> Self {
        Self {
            kinetic_coeff: 1.0,
            potential_coeff: 1.0,
        }
    }
}

impl EnergyFunctional {
    /// Compute total energy
    pub fn total_energy(&self, state: &CRSM7State) -> f64 {
        let kinetic = self.kinetic_coeff * state.lambda * state.lambda;
        let potential = self.potential_coeff * state.phi;
        kinetic + potential
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hamiltonian_creation() {
        let h = CRSMHamiltonian::new();
        assert_eq!(h.gradient_coupling, 1.0);
        assert_eq!(h.torsion_coupling, 1.0);
    }

    #[test]
    fn test_hamiltonian_computation() {
        let h = CRSMHamiltonian::new();
        let state = CRSM7State::default();
        
        let energy = h.compute(&state);
        // Energy should be finite and reasonable
        assert!(energy.is_finite());
    }

    #[test]
    fn test_equilibrium_check() {
        let h = CRSMHamiltonian::new();
        
        // Non-equilibrium state
        let state = CRSM7State::default();
        assert!(!h.is_equilibrium(&state));
        
        // Equilibrium state (Γ → 0, ΛΦ → max)
        let eq_state = CRSM7State::new(0.999, 1e-9, 15.0, 1.0, THETA_CRITICAL, 100.0);
        assert!(h.is_equilibrium(&eq_state));
    }

    #[test]
    fn test_state_evolution() {
        let h = CRSMHamiltonian::new();
        let mut state = CRSM7State::default();
        
        let initial_tau = state.tau;
        h.evolve_state(&mut state, 1.0);
        
        assert!(state.tau > initial_tau);
        assert!(state.gamma < 0.012); // Gamma should decay
    }
}
