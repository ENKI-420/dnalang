//! Z3braOS-Quantum Edition v9.0.CRSM7D QByteFusion Mining
//!
//! Quantum byte mining based on system entropy and CRSM7D parameters.
//!
//! qbyte = f(ε_sys, ΛΦ, θ_drift, χ_res)
//! R_QB = ∂qbyte/∂τ

use crate::constants::LAMBDA_PHI;

/// QByteFusion mining system
#[derive(Debug, Clone)]
pub struct QByteFusion {
    /// System entropy H(S_info)
    pub entropy_sys: f64,
    /// Lambda-Phi coherence constant
    pub lambda_phi: f64,
    /// Theta drift from lock angle
    pub theta_drift: f64,
    /// Chi resonance factor
    pub chi_resonance: f64,
    /// Previous mined value (for rate calculation)
    previous: f64,
}

impl Default for QByteFusion {
    fn default() -> Self {
        Self {
            entropy_sys: 1.0,
            lambda_phi: LAMBDA_PHI,
            theta_drift: 0.0,
            chi_resonance: 1.0,
            previous: 0.0,
        }
    }
}

impl QByteFusion {
    /// Create a new QByteFusion miner
    pub fn new() -> Self {
        Self::default()
    }

    /// Compute current qbyte value
    ///
    /// qbyte = f(ε_sys, ΛΦ, θ_drift, χ_res)
    pub fn mine(&self) -> f64 {
        self.entropy_sys
            * self.lambda_phi
            * (1.0 + self.theta_drift.sin())
            * self.chi_resonance
    }

    /// Compute mining rate
    ///
    /// R_QB = ∂qbyte/∂τ
    pub fn mining_rate(&self, dt: f64) -> f64 {
        if dt.abs() < 1e-15 {
            return 0.0;
        }
        (self.mine() - self.previous) / dt
    }

    /// Update previous value after mining
    pub fn tick(&mut self) {
        self.previous = self.mine();
    }

    /// Update entropy
    pub fn set_entropy(&mut self, entropy: f64) {
        self.entropy_sys = entropy;
    }

    /// Update theta drift
    pub fn set_theta_drift(&mut self, drift: f64) {
        self.theta_drift = drift;
    }

    /// Update chi resonance
    pub fn set_chi_resonance(&mut self, resonance: f64) {
        self.chi_resonance = resonance;
    }
}
