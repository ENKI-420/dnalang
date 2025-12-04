//! Π⁻ Projector Implementation
//!
//! Implements Π⁻ = (I - J) / 2
//! where J is the polarity involution

use super::involution_j::involution_j;

/// Π⁻ projector: Π⁻ = (I - J) / 2
///
/// Projects onto the negative polarity subspace.
/// For J(Ψ) = -Ψ:
/// Π⁻(Ψ) = 0.5(Ψ - (-Ψ)) = Ψ
#[inline]
pub fn pi_minus(psi: f64) -> f64 {
    0.5 * (psi - involution_j(psi))
}

/// Generic Π⁻ with custom involution
pub fn pi_minus_with_j<F>(psi: f64, j: F) -> f64
where
    F: Fn(f64) -> f64,
{
    0.5 * (psi - j(psi))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_pi_minus_standard() {
        let psi = 2.0;
        let result = pi_minus(psi);
        // For J(Ψ) = -Ψ, Π⁻(Ψ) = Ψ
        assert!((result - psi).abs() < 1e-10);
    }

    #[test]
    fn test_pi_minus_with_custom_j() {
        let psi = 3.5;
        let result = pi_minus_with_j(psi, involution_j);
        assert!((result - psi).abs() < 1e-10);
    }

    #[test]
    fn test_pi_minus_zero_input() {
        let psi = 0.0;
        let result = pi_minus(psi);
        assert!((result - 0.0).abs() < 1e-10);
    }
}
