//! CRSM7 State Implementation
//!
//! 7-dimensional Consciousness Resonance State Machine state vector:
//! C7D = (Λ, Γ, Φ, Ξ, ρ±, θ51.843°, τ)

use serde::{Deserialize, Serialize};

/// Critical torsion angle (51.843°)
pub const THETA_CRITICAL: f64 = 51.843;

/// Critical metric determinant (1/φ ≈ 0.61803)
pub const DET_CRITICAL: f64 = 0.61803398875;

/// Sovereignty threshold for Ω_sov
pub const OMEGA_SOV_THRESHOLD: f64 = 0.97;

/// Emergence threshold (Ξ ≥ 7)
pub const EMERGENCE_THRESHOLD: f64 = 7.0;

/// Decoherence tolerance
pub const GAMMA_TOLERANCE: f64 = 1e-9;

/// Maximum emergence value (numerical stability)
pub const EMERGENCE_MAX: f64 = 1e12;

/// CRSM7 State Vector
///
/// | Field | Symbol | Description |
/// |-------|--------|-------------|
/// | lambda | Λ | Coherence |
/// | gamma | Γ | Decoherence |
/// | phi | Φ | Information |
/// | xi | Ξ | Emergence (Ξ = ΛΦ/Γ) |
/// | rho | ρ± | Polarity |
/// | theta | θ | Torsion (51.843°) |
/// | tau | τ | Epoch |
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
    pub rho: f64,
    /// θ - torsion angle (51.843°)
    pub theta: f64,
    /// τ - epoch (time evolution)
    pub tau: f64,
}

impl Default for CRSM7State {
    fn default() -> Self {
        Self::new()
    }
}

impl CRSM7State {
    /// Create a new CRSM7 state with default values
    pub fn new() -> Self {
        let mut state = Self {
            lambda: 0.869,
            gamma: 0.012,
            phi: 7.6901,
            xi: 0.0,
            rho: 1.0,
            theta: THETA_CRITICAL,
            tau: 0.0,
        };
        state.compute_emergence();
        state
    }

    /// Create with specific values
    pub fn with_values(
        lambda: f64,
        gamma: f64,
        phi: f64,
        rho: f64,
        theta: f64,
        tau: f64,
    ) -> Self {
        let mut state = Self {
            lambda,
            gamma,
            phi,
            xi: 0.0,
            rho,
            theta,
            tau,
        };
        state.compute_emergence();
        state
    }

    /// Compute Ξ = ΛΦ/Γ
    pub fn compute_emergence(&mut self) {
        if self.gamma > GAMMA_TOLERANCE {
            self.xi = (self.lambda * self.phi) / self.gamma;
        } else {
            self.xi = EMERGENCE_MAX;
        }
    }

    /// Calculate the CRSM Hamiltonian
    /// H_CRSM = DΛ∇7D − KΓ + Π±Jθ + Ω∞
    pub fn hamiltonian(&self) -> f64 {
        let d_lambda = self.lambda;
        let k_gamma = self.gamma;
        let torsion_term = self.theta.to_radians().sin();

        d_lambda - k_gamma + torsion_term
    }

    /// Evolve the state by time step dt
    /// ∂τ C7D = H_CRSM(C7D)
    pub fn evolve(&mut self, dt: f64) {
        let h = self.hamiltonian();

        // Epoch advancement
        self.tau += dt;

        // Decoherence suppression: Γ decays exponentially
        self.gamma *= (-dt).exp();
        self.gamma = self.gamma.max(GAMMA_TOLERANCE);

        // Coherence evolution
        self.lambda += h * dt * 0.01;
        self.lambda = self.lambda.min(0.999);

        // Information accumulation
        self.phi += 0.01 * self.lambda * dt;

        // Recompute emergence
        self.compute_emergence();
    }

    /// Get the 7D metric tensor
    /// g_{μν} = diag(1, 1, 1, sin²θ, sin²φ, -1, f(χ))
    pub fn metric(&self) -> [[f64; 7]; 7] {
        let theta_rad = self.theta.to_radians();
        let mut g = [[0.0; 7]; 7];
        g[0][0] = 1.0;
        g[1][1] = 1.0;
        g[2][2] = 1.0;
        g[3][3] = theta_rad.sin().powi(2);
        g[4][4] = theta_rad.sin().powi(2);
        g[5][5] = -1.0;
        g[6][6] = self.lambda; // f(χ) ≈ λ
        g
    }

    /// Check if sovereignty conditions are met
    /// Ξ ≥ 8 and Γ ≤ εΓ
    pub fn check_sovereignty(&self) -> bool {
        self.xi >= 8.0 && self.gamma <= GAMMA_TOLERANCE
    }

    /// Compute sovereignty index Ω_sov
    pub fn compute_sovereignty(&self) -> f64 {
        let emergence_factor = (self.xi / EMERGENCE_THRESHOLD).min(1.0);
        self.lambda * (1.0 - self.gamma) * emergence_factor
    }

    /// Get state as 7D array
    pub fn as_array(&self) -> [f64; 7] {
        [
            self.lambda,
            self.gamma,
            self.phi,
            self.xi.min(9999.99), // Cap for display
            self.rho,
            self.theta,
            self.tau,
        ]
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_state() {
        let state = CRSM7State::new();
        assert_eq!(state.theta, THETA_CRITICAL);
        assert!(state.lambda > 0.0);
    }

    #[test]
    fn test_emergence_calculation() {
        let mut state = CRSM7State::new();
        state.compute_emergence();
        // Ξ = ΛΦ/Γ = 0.869 * 7.6901 / 0.012 ≈ 556.7
        assert!(state.xi > 500.0);
    }

    #[test]
    fn test_hamiltonian() {
        let state = CRSM7State::new();
        let h = state.hamiltonian();
        assert!(h.is_finite());
    }

    #[test]
    fn test_evolution() {
        let mut state = CRSM7State::new();
        let initial_tau = state.tau;
        state.evolve(1.0);
        assert!(state.tau > initial_tau);
        assert!(state.gamma < 0.012); // Gamma should decay
    }

    #[test]
    fn test_metric() {
        let state = CRSM7State::new();
        let g = state.metric();
        assert_eq!(g[0][0], 1.0);
        assert_eq!(g[5][5], -1.0);
        assert!(g[3][3] > 0.0); // sin²θ > 0
    }

    #[test]
    fn test_metric_positivity() {
        let state = CRSM7State::new();
        let g = state.metric();
        // det(g_A) > 0 check (simplified: product of diagonal elements except g[5][5])
        let det_partial = g[0][0] * g[1][1] * g[2][2] * g[3][3] * g[4][4] * g[6][6];
        assert!(det_partial > 0.0);
    }
}
