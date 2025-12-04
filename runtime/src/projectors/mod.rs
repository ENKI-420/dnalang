//! Projectors Module
//!
//! Implements duality-polarized bifurcation projectors:
//! - Π⁺ = (I + J) / 2
//! - Π⁻ = (I - J) / 2
//! - J: polarity involution (J² = I, JΨ = -Ψ)

pub mod involution_j;
pub mod pi_minus;
pub mod pi_plus;

pub use involution_j::{involution_j, verify_j_squared};
pub use pi_minus::{pi_minus, pi_minus_with_j};
pub use pi_plus::{pi_plus, pi_plus_with_j};

/// Perform bifurcation: B(Ψ) = (Π⁺Ψ, Π⁻Ψ)
pub fn bifurcate(psi: f64) -> (f64, f64) {
    (pi_plus(psi), pi_minus(psi))
}

/// Verify projector completeness: Π⁺ + Π⁻ = I
pub fn verify_completeness(psi: f64) -> bool {
    let sum = pi_plus(psi) + pi_minus(psi);
    (sum - psi).abs() < 1e-10
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_bifurcate() {
        let psi = 2.0;
        let (plus, minus) = bifurcate(psi);
        assert!((plus - 0.0).abs() < 1e-10);
        assert!((minus - psi).abs() < 1e-10);
    }

    #[test]
    fn test_projector_completeness() {
        for psi in [-10.0, -1.0, 0.0, 1.0, 5.0, 100.0] {
            assert!(verify_completeness(psi), "Failed for psi = {}", psi);
        }
    }

    #[test]
    fn test_pi_plus_pi_minus_orthogonality() {
        // Π⁺ · Π⁻ should give 0 when applied to the same state
        let psi = 5.0;
        let plus = pi_plus(psi);
        let minus = pi_minus(psi);
        // Product should be small (they're orthogonal projectors)
        assert!((plus * minus).abs() < 1e-10);
    }
}
