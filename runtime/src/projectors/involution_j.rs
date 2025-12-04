//! J Involution Implementation
//!
//! J: polarity involution
//! J² = I, JΨ = -Ψ

/// J involution operator
///
/// The polarity involution satisfies:
/// - J² = I (involution property: applying twice gives identity)
/// - JΨ = -Ψ (polarity inversion)
#[inline]
pub fn involution_j(psi: f64) -> f64 {
    -psi
}

/// Verify the involution property J² = I
pub fn verify_j_squared(psi: f64) -> bool {
    let j_j_psi = involution_j(involution_j(psi));
    (j_j_psi - psi).abs() < 1e-10
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_j_involution() {
        let psi = 1.5;
        assert_eq!(involution_j(psi), -1.5);
    }

    #[test]
    fn test_j_squared_is_identity() {
        let psi = 1.5;
        assert_eq!(involution_j(involution_j(psi)), psi);
    }

    #[test]
    fn test_j_squared_various_values() {
        for psi in [-5.0, -1.0, 0.0, 1.0, 3.14159, 100.0] {
            assert!(verify_j_squared(psi));
        }
    }

    #[test]
    fn test_verify_j_squared() {
        assert!(verify_j_squared(2.5));
        assert!(verify_j_squared(-3.7));
        assert!(verify_j_squared(0.0));
    }
}
