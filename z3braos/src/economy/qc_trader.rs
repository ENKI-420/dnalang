//! Z3braOS-Quantum Edition v9.0.CRSM7D QCTrader Market
//!
//! Quantum credit trading with ΛΦ-indexed rates.
//!
//! r(t) = 50 + 100·sin(τΛΦ + χ)
//! Ω_arbitrage = ∇_τ r(t)

use crate::constants::LAMBDA_PHI;

/// QCTrader quantum credit market
#[derive(Debug, Clone)]
pub struct QCTrader {
    /// Temporal epoch τ
    pub tau: f64,
    /// Chi resonance dimension
    pub chi: f64,
}

impl Default for QCTrader {
    fn default() -> Self {
        Self { tau: 0.0, chi: 0.0 }
    }
}

impl QCTrader {
    /// Create a new QCTrader
    pub fn new() -> Self {
        Self::default()
    }

    /// Create a trader at specific time and chi
    pub fn at(tau: f64, chi: f64) -> Self {
        Self { tau, chi }
    }

    /// Compute current exchange rate
    ///
    /// r(t) = 50 + 100·sin(τΛΦ + χ)
    pub fn rate(&self) -> f64 {
        50.0 + 100.0 * (self.tau * LAMBDA_PHI + self.chi).sin()
    }

    /// Buy quantum credits with qbytes
    pub fn buy(&self, qc: f64, qb: &mut f64) {
        *qb -= self.rate() * qc;
    }

    /// Sell quantum credits for qbytes
    pub fn sell(&self, qc: f64, qb: &mut f64) {
        *qb += self.rate() * qc;
    }

    /// Compute arbitrage opportunity gradient
    ///
    /// Ω_arbitrage = ∇_τ r(t)
    pub fn arbitrage(&self) -> f64 {
        100.0 * LAMBDA_PHI * (self.tau * LAMBDA_PHI + self.chi).cos()
    }

    /// Advance time
    pub fn advance(&mut self, dt: f64) {
        self.tau += dt;
    }

    /// Update chi dimension
    pub fn set_chi(&mut self, chi: f64) {
        self.chi = chi;
    }
}
