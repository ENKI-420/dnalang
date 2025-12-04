//! Π⁺ Projector Implementation
//!
//! Implements Π⁺ = (I + J) / 2
//! where J is the polarity involution

use super::involution_j::involution_j;

/// Π⁺ projector: Π⁺ = (I + J) / 2
///
/// Projects onto the positive polarity subspace.
/// For J(Ψ) = -Ψ:
/// Π⁺(Ψ) = 0.5(Ψ + (-Ψ)) = 0
#[inline]
pub fn pi_plus(psi: f64) -> f64 {
    0.5 * (psi + involution_j(psi))
}

/// Generic Π⁺ with custom involution
pub fn pi_plus_with_j<F>(psi: f64, j: F) -> f64
where
    F: Fn(f64) -> f64,
{
    0.5 * (psi + j(psi))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_pi_plus_standard() {
        let psi = 2.0;
        let result = pi_plus(psi);
        // For J(Ψ) = -Ψ, Π⁺(Ψ) = 0
        assert!((result - 0.0).abs() < 1e-10);
    }

    #[test]
    fn test_pi_plus_with_custom_j() {
        let psi = 2.0;
        let result = pi_plus_with_j(psi, involution_j);
        assert!((result - 0.0).abs() < 1e-10);
    }

    #[test]
    fn test_pi_plus_zero_input() {
        let psi = 0.0;
        let result = pi_plus(psi);
        assert!((result - 0.0).abs() < 1e-10);
    }
}
