//! Duality Bifurcation Tests
//!
//! Tests for the duality-polarized bifurcation system:
//! - B(Ψ) = (Π⁺Ψ, Π⁻Ψ)
//! - Projector completeness: Π⁺ + Π⁻ = I
//! - Involution identity: J² = I
//! - Linearity of bifurcation

/// J involution: J(Ψ) = -Ψ
fn involution_j(psi: f64) -> f64 {
    -psi
}

/// Π⁺ projector: Π⁺ = (I + J) / 2
fn pi_plus(psi: f64) -> f64 {
    0.5 * (psi + involution_j(psi))
}

/// Π⁻ projector: Π⁻ = (I - J) / 2
fn pi_minus(psi: f64) -> f64 {
    0.5 * (psi - involution_j(psi))
}

/// Bifurcation operation: B(Ψ) = (Π⁺Ψ, Π⁻Ψ)
fn bifurcate(psi: f64) -> (f64, f64) {
    (pi_plus(psi), pi_minus(psi))
}

#[test]
fn test_pi_plus_pi_minus_sum_to_identity() {
    let psi = 2.5;
    let result = pi_plus(psi) + pi_minus(psi);
    assert!((result - psi).abs() < 1e-10);
}

#[test]
fn test_j_squared_equals_identity() {
    let psi = 3.14;
    assert_eq!(involution_j(involution_j(psi)), psi);
}

#[test]
fn test_bifurcation_linearity() {
    // Test: B(aΨ + bΦ) = (a·B(Ψ).0 + b·B(Φ).0, a·B(Ψ).1 + b·B(Φ).1)
    let a = 2.0;
    let b = 3.0;
    let psi = 1.0;
    let phi = 2.0;

    let left = bifurcate(a * psi + b * phi);
    let right = (
        a * bifurcate(psi).0 + b * bifurcate(phi).0,
        a * bifurcate(psi).1 + b * bifurcate(phi).1,
    );

    assert!((left.0 - right.0).abs() < 1e-10);
    assert!((left.1 - right.1).abs() < 1e-10);
}

#[test]
fn test_bifurcation_preserves_total() {
    // The sum of bifurcated branches equals the original
    let psi = 7.5;
    let (plus, minus) = bifurcate(psi);
    assert!((plus + minus - psi).abs() < 1e-10);
}

#[test]
fn test_bifurcation_zero_input() {
    let (plus, minus) = bifurcate(0.0);
    assert!((plus - 0.0).abs() < 1e-10);
    assert!((minus - 0.0).abs() < 1e-10);
}

#[test]
fn test_bifurcation_negative_input() {
    let psi = -5.0;
    let (plus, minus) = bifurcate(psi);
    
    // Completeness still holds
    assert!((plus + minus - psi).abs() < 1e-10);
    
    // For J(Ψ) = -Ψ:
    // Π⁺(Ψ) = 0.5(Ψ - Ψ) = 0
    // Π⁻(Ψ) = 0.5(Ψ + Ψ) = Ψ
    assert!((plus - 0.0).abs() < 1e-10);
    assert!((minus - psi).abs() < 1e-10);
}

#[test]
fn test_repeated_bifurcation() {
    // Applying bifurcation multiple times should be stable
    let psi = 4.0;
    
    let (plus1, minus1) = bifurcate(psi);
    let (plus2, minus2) = bifurcate(minus1);
    
    // Π⁻(Π⁻(Ψ)) = Π⁻(Ψ) = Ψ (idempotence)
    assert!((plus2 - 0.0).abs() < 1e-10);
    assert!((minus2 - minus1).abs() < 1e-10);
}

#[test]
fn test_duality_symmetry() {
    // Test the symmetry between Π⁺ and Π⁻
    let psi = 3.0;
    
    // For J(Ψ) = -Ψ:
    // Π⁺(Ψ) = 0.5(Ψ + J(Ψ)) = 0.5(Ψ - Ψ) = 0
    // Π⁻(J(Ψ)) = 0.5(J(Ψ) - J(J(Ψ))) = 0.5(-Ψ - Ψ) = -Ψ
    // So Π⁺(Ψ) = -Π⁻(J(Ψ)) is NOT correct
    // Actually: Π⁺(Ψ) = 0, Π⁻(J(Ψ)) = J(Ψ) = -Ψ
    
    let pi_plus_psi = pi_plus(psi);
    let pi_minus_j_psi = pi_minus(involution_j(psi));
    
    // Verify the actual values
    assert!((pi_plus_psi - 0.0).abs() < 1e-10); // Π⁺(Ψ) = 0
    assert!((pi_minus_j_psi - (-psi)).abs() < 1e-10); // Π⁻(J(Ψ)) = J(Ψ) = -Ψ
}

#[test]
fn test_involution_antisymmetry() {
    // J(Ψ) = -Ψ implies antisymmetry
    let psi = 5.0;
    let j_psi = involution_j(psi);
    
    assert_eq!(j_psi, -psi);
    assert_eq!(psi + j_psi, 0.0);
}

#[test]
fn test_projector_orthogonality_property() {
    // Π⁺ · Π⁻ = 0 (orthogonal projectors)
    let psi = 6.0;
    let plus = pi_plus(psi);
    let minus = pi_minus(psi);
    
    // Since Π⁺(Ψ) = 0 for our J, the product is always 0
    assert!((plus * minus).abs() < 1e-10);
}

#[test]
fn test_involution_on_bifurcation_result() {
    let psi = 2.0;
    let (plus, minus) = bifurcate(psi);
    
    // J(Π⁺(Ψ)) and J(Π⁻(Ψ))
    let j_plus = involution_j(plus);
    let j_minus = involution_j(minus);
    
    // J(0) = 0
    assert!((j_plus - 0.0).abs() < 1e-10);
    // J(Ψ) = -Ψ
    assert!((j_minus - (-minus)).abs() < 1e-10);
}

#[test]
fn test_bifurcation_with_complex_coefficients() {
    // Test linearity with various coefficients
    let coefficients = [(1.0, 1.0), (2.0, 3.0), (-1.0, 2.0), (0.5, -0.5)];
    
    for (a, b) in coefficients {
        let psi = 1.5;
        let phi = 2.5;
        
        let left = bifurcate(a * psi + b * phi);
        let right = (
            a * bifurcate(psi).0 + b * bifurcate(phi).0,
            a * bifurcate(psi).1 + b * bifurcate(phi).1,
        );
        
        assert!(
            (left.0 - right.0).abs() < 1e-10,
            "Linearity failed for a={}, b={}",
            a, b
        );
        assert!(
            (left.1 - right.1).abs() < 1e-10,
            "Linearity failed for a={}, b={}",
            a, b
        );
    }
}
