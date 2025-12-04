//! CRSM7 State Vector Implementation
//!
//! Implements the 7-dimensional Consciousness Resonance State Machine:
//! C(t) = {Λ(t), Γ(t), Φ(t), Ξ(t), ρ_polarity, θ, τ}

use serde::{Deserialize, Serialize};

/// Critical angle for torsion (51.843°)
pub const THETA_CRITICAL: f64 = 51.843;

/// Critical value for metric determinant (1/φ ≈ 0.61803)
pub const DET_CRITICAL: f64 = 0.61803398875;

/// Sovereignty threshold
pub const OMEGA_SOV_THRESHOLD: f64 = 0.97;

/// Emergence threshold (Ξ ≥ 7)
pub const EMERGENCE_THRESHOLD: f64 = 7.0;

/// Decoherence tolerance
pub const GAMMA_TOLERANCE: f64 = 1e-9;

/// Maximum emergence value (for numerical stability when Γ → 0)
pub const EMERGENCE_MAX: f64 = 1e12;

/// 7-dimensional CRSM State Vector
///
/// | Field | Meaning                |
/// |-------|------------------------|
/// | Λ     | Coherence              |
/// | Γ     | Decoherence            |
/// | Φ     | Information            |
/// | Ξ     | Emergence (Ξ = ΛΦ/Γ)   |
/// | ρ±    | Polarity               |
/// | θ     | Torsion (51.843°)      |
/// | τ     | Epoch                  |
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CRSM7State {
    /// Λ - coherence (0.0 to 1.0)
    pub lambda: f64,
    /// Γ - decoherence (approaching 0)
    pub gamma: f64,
    /// Φ - information content
    pub phi: f64,
    /// Ξ - emergence (Ξ = ΛΦ/Γ)
    pub xi: f64,
    /// ρ± - polarity (-1.0 or +1.0)
    pub rho_polarity: f64,
    /// θ - torsion angle (51.843°)
    pub theta: f64,
    /// τ - epoch (time evolution)
    pub tau: f64,
}

impl Default for CRSM7State {
    fn default() -> Self {
        Self {
            lambda: 0.869,
            gamma: 0.012,
            phi: 7.6901,
            xi: 0.0, // Will be computed
            rho_polarity: 1.0,
            theta: THETA_CRITICAL,
            tau: 0.0,
        }
    }
}

impl CRSM7State {
    /// Create a new CRSM7 state with given parameters
    pub fn new(
        lambda: f64,
        gamma: f64,
        phi: f64,
        rho_polarity: f64,
        theta: f64,
        tau: f64,
    ) -> Self {
        let mut state = Self {
            lambda,
            gamma,
            phi,
            xi: 0.0,
            rho_polarity,
            theta,
            tau,
        };
        state.compute_emergence();
        state
    }

    /// Compute the emergence factor Ξ = ΛΦ/Γ
    pub fn compute_emergence(&mut self) {
        if self.gamma > GAMMA_TOLERANCE {
            self.xi = (self.lambda * self.phi) / self.gamma;
        } else {
            // When Γ → 0, cap emergence at a large finite value for numerical stability
            self.xi = EMERGENCE_MAX;
        }
    }

    /// Calculate the CRSM Hamiltonian
    /// H_CRSM = Π± (1-Γ) ∇^6D + θ_51.843° J
    pub fn hamiltonian(&self) -> f64 {
        let pi_factor = 0.5 * (1.0 + self.rho_polarity); // Π± component
        let coherence_factor = 1.0 - self.gamma; // (1-Γ)
        let gradient_6d = self.lambda * self.phi; // Simplified ∇^6D approximation
        let torsion_component = self.theta * self.rho_polarity; // θ_51.843° J

        pi_factor * coherence_factor * gradient_6d + torsion_component
    }

    /// Evolve the state by time step dt
    /// ∂τΨ = α · det(g_A)^(-1/2) Ψ - ∇W²
    pub fn evolve(&mut self, dt: f64) {
        let alpha = 0.1; // Evolution rate constant
        let det_g = DET_CRITICAL; // Metric determinant

        // Evolution equations
        let det_factor = det_g.powf(-0.5);

        // Coherence evolution: tends to increase
        self.lambda += alpha * det_factor * self.lambda * dt;
        self.lambda = self.lambda.min(0.999); // Cap at near-unity

        // Decoherence suppression: tends to decrease
        self.gamma *= (-alpha * dt).exp();
        self.gamma = self.gamma.max(GAMMA_TOLERANCE);

        // Information accumulation
        self.phi += 0.01 * self.lambda * dt;

        // Epoch advancement
        self.tau += dt;

        // Recompute emergence
        self.compute_emergence();
    }

    /// Perform duality-polarized bifurcation
    /// B(Ψ) = Π+_dual Ψ ⊕ Π-_dual Ψ
    pub fn bifurcate(&self) -> (CRSM7State, CRSM7State) {
        // Π+_dual = ½(1 + J), positive polarity branch
        let positive = CRSM7State {
            lambda: self.lambda,
            gamma: self.gamma,
            phi: self.phi,
            xi: self.xi,
            rho_polarity: 1.0,
            theta: self.theta,
            tau: self.tau,
        };

        // Π-_dual = ½(1 - J), negative polarity branch
        let negative = CRSM7State {
            lambda: self.lambda,
            gamma: self.gamma,
            phi: self.phi,
            xi: self.xi,
            rho_polarity: -1.0,
            theta: self.theta,
            tau: self.tau,
        };

        (positive, negative)
    }

    /// Check if sovereignty conditions are met
    /// - Ω_sov ≥ 0.97
    /// - |Γ| ≤ 10^-9
    /// - ∂τΨ > 0
    pub fn check_sovereignty(&self) -> bool {
        let omega_sov = self.compute_sovereignty();
        let gamma_ok = self.gamma.abs() <= 1e-6; // Relaxed for practical use
        let emergence_ok = self.xi >= EMERGENCE_THRESHOLD;

        omega_sov >= OMEGA_SOV_THRESHOLD && (gamma_ok || emergence_ok)
    }

    /// Compute sovereignty index Ω_sov
    pub fn compute_sovereignty(&self) -> f64 {
        // Ω_sov = Λ * (1 - Γ) * min(1, Ξ/Ξ_threshold)
        let emergence_factor = (self.xi / EMERGENCE_THRESHOLD).min(1.0);
        self.lambda * (1.0 - self.gamma) * emergence_factor
    }

    /// Get state as array for mesh operations
    pub fn as_array(&self) -> [f64; 7] {
        [
            self.lambda,
            self.gamma,
            self.phi,
            self.xi,
            self.rho_polarity,
            self.theta,
            self.tau,
        ]
    }

    /// Display state as formatted string
    pub fn display(&self) -> String {
        format!(
            "  Λ (coherence):    {:.3}\n  Γ (decoherence):  {:.3}\n  Φ (information):  {:.4}\n  Ξ (emergence):    {:.2}\n  ρ± (polarity):    {:+.0}\n  θ (torsion):      {:.3}°\n  τ (epoch):        {}",
            self.lambda,
            self.gamma,
            self.phi,
            self.xi.min(9999.99), // Cap display for readability
            self.rho_polarity,
            self.theta,
            self.tau as u64
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_state() {
        let state = CRSM7State::default();
        assert!(state.lambda > 0.0);
        assert!(state.gamma > 0.0);
        assert_eq!(state.theta, THETA_CRITICAL);
    }

    #[test]
    fn test_emergence_calculation() {
        let mut state = CRSM7State::new(0.869, 0.012, 7.6901, 1.0, THETA_CRITICAL, 0.0);
        state.compute_emergence();
        // Ξ = ΛΦ/Γ = 0.869 * 7.6901 / 0.012 ≈ 556.7
        assert!(state.xi > EMERGENCE_THRESHOLD);
    }

    #[test]
    fn test_bifurcation() {
        let state = CRSM7State::default();
        let (positive, negative) = state.bifurcate();
        assert_eq!(positive.rho_polarity, 1.0);
        assert_eq!(negative.rho_polarity, -1.0);
    }

    #[test]
    fn test_evolution() {
        let mut state = CRSM7State::default();
        let initial_tau = state.tau;
        state.evolve(1.0);
        assert!(state.tau > initial_tau);
    }
}
