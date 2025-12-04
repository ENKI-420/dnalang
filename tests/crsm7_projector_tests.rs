//! CRSM7 Projector Tests
//!
//! Tests for the duality-polarized bifurcation operators:
//! - Π⁺ = (I + J) / 2
//! - Π⁻ = (I - J) / 2
//! - J: polarity involution (J² = I, JΨ = -Ψ)

/// J involution: J(Ψ) = -Ψ
fn involution_j(psi: f64) -> f64 {
    -psi
}

/// Π⁺ projector
fn pi_plus(psi: f64) -> f64 {
    0.5 * (psi + involution_j(psi))
}

/// Π⁻ projector
fn pi_minus(psi: f64) -> f64 {
    0.5 * (psi - involution_j(psi))
}

/// Bifurcation operation
fn bifurcate(psi: f64) -> (f64, f64) {
    (pi_plus(psi), pi_minus(psi))
}

#[test]
fn test_j_involution_basic() {
    assert_eq!(involution_j(1.0), -1.0);
    assert_eq!(involution_j(-3.5), 3.5);
    assert_eq!(involution_j(0.0), 0.0);
}

#[test]
fn test_j_squared_equals_identity() {
    let test_values = [-100.0, -3.14, -1.0, 0.0, 1.0, 2.718, 42.0];
    
    for psi in test_values {
        let j_j_psi = involution_j(involution_j(psi));
        assert!(
            (j_j_psi - psi).abs() < 1e-10,
            "J² = I failed for psi = {}",
            psi
        );
    }
}

#[test]
fn test_pi_plus_formula() {
    let psi = 2.0;
    // Π⁺(Ψ) = 0.5(Ψ + J(Ψ)) = 0.5(Ψ - Ψ) = 0
    let result = pi_plus(psi);
    assert!((result - 0.0).abs() < 1e-10);
}

#[test]
fn test_pi_minus_formula() {
    let psi = 2.0;
    // Π⁻(Ψ) = 0.5(Ψ - J(Ψ)) = 0.5(Ψ + Ψ) = Ψ
    let result = pi_minus(psi);
    assert!((result - psi).abs() < 1e-10);
}

#[test]
fn test_projector_completeness() {
    // Invariant: Π⁺ + Π⁻ = I
    let test_values = [-10.0, -1.0, 0.0, 1.0, 3.14159, 100.0];
    
    for psi in test_values {
        let sum = pi_plus(psi) + pi_minus(psi);
        assert!(
            (sum - psi).abs() < 1e-10,
            "Π⁺ + Π⁻ = I failed for psi = {}",
            psi
        );
    }
}

#[test]
fn test_projector_orthogonality() {
    // Π⁺ and Π⁻ are orthogonal projectors
    // Π⁺ · Π⁻ should give zero contribution
    let psi = 5.0;
    let plus = pi_plus(psi);
    let minus = pi_minus(psi);
    
    // The product should be approximately zero
    assert!((plus * minus).abs() < 1e-10);
}

#[test]
fn test_bifurcation() {
    let psi = 2.5;
    let (plus, minus) = bifurcate(psi);
    
    // Check completeness
    assert!((plus + minus - psi).abs() < 1e-10);
    
    // Check expected values
    assert!((plus - 0.0).abs() < 1e-10);
    assert!((minus - psi).abs() < 1e-10);
}

#[test]
fn test_projector_idempotence() {
    // Π⁺² = Π⁺ and Π⁻² = Π⁻ (projector idempotence)
    let psi = 3.0;
    
    // For Π⁺: since Π⁺(Ψ) = 0, Π⁺(Π⁺(Ψ)) = Π⁺(0) = 0
    let pi_plus_once = pi_plus(psi);
    let pi_plus_twice = pi_plus(pi_plus_once);
    assert!((pi_plus_twice - pi_plus_once).abs() < 1e-10);
    
    // For Π⁻: since Π⁻(Ψ) = Ψ, Π⁻(Π⁻(Ψ)) = Π⁻(Ψ) = Ψ
    let pi_minus_once = pi_minus(psi);
    let pi_minus_twice = pi_minus(pi_minus_once);
    assert!((pi_minus_twice - pi_minus_once).abs() < 1e-10);
}

#[test]
fn test_bifurcation_with_generic_j() {
    // Test with a custom J involution
    fn custom_j(psi: f64) -> f64 {
        -psi // Same as standard
    }
    
    fn pi_plus_generic<F: Fn(f64) -> f64>(psi: f64, j: F) -> f64 {
        0.5 * (psi + j(psi))
    }
    
    fn pi_minus_generic<F: Fn(f64) -> f64>(psi: f64, j: F) -> f64 {
        0.5 * (psi - j(psi))
    }
    
    let psi = 4.0;
    let plus = pi_plus_generic(psi, custom_j);
    let minus = pi_minus_generic(psi, custom_j);
    
    assert!((plus + minus - psi).abs() < 1e-10);
}
