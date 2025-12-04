//! Duality-Polarized Bifurcation Operators
//!
//! Implements Π±_dual = ½(1 ± J) where J is the polarity involution: J² = 1, JΨ = -Ψ
//!
//! Bifurcation rule: B(Ψ) = Π+_dual Ψ ⊕ Π-_dual Ψ

use serde::{Deserialize, Serialize};

/// Duality Operator implementing Π± projections
///
/// The J involution satisfies:
/// - J² = 1 (involution property)
/// - JΨ = -Ψ (polarity inversion)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DualityOperator {
    /// Rank of the operator (should be 1 for proper duality)
    pub rank: i32,
}

impl Default for DualityOperator {
    fn default() -> Self {
        Self::new()
    }
}

impl DualityOperator {
    /// Create a new duality operator
    pub fn new() -> Self {
        Self { rank: 1 }
    }

    /// J involution: J(Ψ) = -Ψ
    /// Satisfies J² = 1
    #[inline]
    pub fn j_involution(&self, psi: f64) -> f64 {
        -psi
    }

    /// Verify J² = 1 property
    pub fn verify_involution(&self, psi: f64) -> bool {
        let j_psi = self.j_involution(psi);
        let j_j_psi = self.j_involution(j_psi);
        (j_j_psi - psi).abs() < 1e-10
    }

    /// Π+_dual = ½(1 + J)
    /// Projects onto positive polarity subspace
    pub fn pi_plus(&self, psi: f64) -> f64 {
        0.5 * (psi + self.j_involution(psi))
    }

    /// Π-_dual = ½(1 - J)
    /// Projects onto negative polarity subspace
    pub fn pi_minus(&self, psi: f64) -> f64 {
        0.5 * (psi - self.j_involution(psi))
    }

    /// Perform bifurcation: B(Ψ) = (Π+Ψ, Π-Ψ)
    pub fn bifurcate(&self, psi: f64) -> (f64, f64) {
        (self.pi_plus(psi), self.pi_minus(psi))
    }

    /// Apply duality operator to a state value
    /// Returns the transformed value based on polarity
    pub fn apply(&self, psi: f64, polarity: f64) -> f64 {
        if polarity >= 0.0 {
            self.pi_plus(psi)
        } else {
            self.pi_minus(psi)
        }
    }

    /// Check if bifurcation is at critical point
    /// Critical value: det(g_A)_crit = 1/φ ≈ 0.61803
    pub fn is_critical(&self, det_g: f64) -> bool {
        const PHI_INV: f64 = 0.61803398875; // 1/φ
        (det_g - PHI_INV).abs() < 0.01
    }

    /// Get display string for operator status
    pub fn display(&self) -> String {
        format!(
            "  Π⁺: 0.5(1+J) applied\n  Π⁻: 0.5(1-J) applied"
        )
    }
}

/// Trait for types that can undergo duality transformation
pub trait Dualizable {
    /// Apply positive polarity projection
    fn apply_pi_plus(&self, op: &DualityOperator) -> Self;
    /// Apply negative polarity projection
    fn apply_pi_minus(&self, op: &DualityOperator) -> Self;
}

impl Dualizable for f64 {
    fn apply_pi_plus(&self, op: &DualityOperator) -> Self {
        op.pi_plus(*self)
    }

    fn apply_pi_minus(&self, op: &DualityOperator) -> Self {
        op.pi_minus(*self)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_j_involution_property() {
        let op = DualityOperator::new();
        
        // Test J² = 1
        let psi = 3.14159;
        assert!(op.verify_involution(psi));
        
        // Test with various values
        for psi in [-1.0, 0.0, 1.0, 2.5, -0.5] {
            assert!(op.verify_involution(psi));
        }
    }

    #[test]
    fn test_bifurcation_completeness() {
        let op = DualityOperator::new();
        let psi = 2.0;
        
        let (plus, minus) = op.bifurcate(psi);
        
        // For J(Ψ) = -Ψ:
        // Π+(Ψ) = 0.5(Ψ + (-Ψ)) = 0
        // Π-(Ψ) = 0.5(Ψ - (-Ψ)) = Ψ
        assert!((plus - 0.0).abs() < 1e-10);
        assert!((minus - psi).abs() < 1e-10);
    }

    #[test]
    fn test_rank_is_one() {
        let op = DualityOperator::new();
        assert_eq!(op.rank, 1);
    }

    #[test]
    fn test_critical_detection() {
        let op = DualityOperator::new();
        assert!(op.is_critical(0.618));
        assert!(!op.is_critical(0.5));
    }
}
