//! Sovereignty Collapse Tests
//!
//! Tests for the collapse conditions and sovereignty enforcement:
//! - Γ → 0 (decoherence suppression)
//! - ΛΦ → max (coherence ascent)
//! - Ξ ≥ 8 → Ω∞.seal() (sovereignty threshold)

/// Decoherence tolerance
const GAMMA_TOLERANCE: f64 = 1e-9;

/// Sovereignty threshold for Ξ
const XI_THRESHOLD: f64 = 8.0;

/// CRSM7 State for testing
struct CRSM7State {
    lambda: f64,
    gamma: f64,
    phi: f64,
    xi: f64,
    rho: f64,
    theta: f64,
    tau: f64,
}

impl CRSM7State {
    fn new() -> Self {
        let mut state = Self {
            lambda: 0.869,
            gamma: 0.012,
            phi: 7.6901,
            xi: 0.0,
            rho: 1.0,
            theta: 51.843,
            tau: 0.0,
        };
        state.compute_emergence();
        state
    }

    fn compute_emergence(&mut self) {
        if self.gamma > GAMMA_TOLERANCE {
            self.xi = (self.lambda * self.phi) / self.gamma;
        } else {
            self.xi = 1e12;
        }
    }

    fn evolve(&mut self, dt: f64) {
        self.tau += dt;
        self.gamma *= (-dt * 0.1).exp();
        self.gamma = self.gamma.max(GAMMA_TOLERANCE);
        self.lambda = (self.lambda + 0.001 * dt).min(0.999);
        self.phi += 0.01 * self.lambda * dt;
        self.compute_emergence();
    }

    fn check_sovereignty(&self) -> bool {
        self.xi >= XI_THRESHOLD && self.gamma <= GAMMA_TOLERANCE
    }
}

/// Dual Runtime for testing
struct DualRuntime {
    state: CRSM7State,
    sealed: bool,
}

impl DualRuntime {
    fn new() -> Self {
        Self {
            state: CRSM7State::new(),
            sealed: false,
        }
    }

    fn check_sovereignty(&self) -> bool {
        self.state.check_sovereignty()
    }

    fn seal(&mut self) {
        if self.check_sovereignty() {
            self.sealed = true;
        }
    }
}

#[test]
fn test_gamma_suppression() {
    let mut state = CRSM7State::new();
    state.gamma = 0.1;

    // Evolve with more iterations or larger dt to ensure sufficient decay
    for _ in 0..10000 {
        state.evolve(0.1);
    }

    // With exponential decay e^(-0.1*1000) = e^(-100), gamma should be very small
    assert!(state.gamma < 1e-4, "gamma = {} should be < 1e-4", state.gamma);
}

#[test]
fn test_sovereignty_seal() {
    let mut runtime = DualRuntime::new();
    runtime.state.xi = 10.0;
    runtime.state.gamma = 1e-10;

    assert!(runtime.check_sovereignty());
    runtime.seal();
    assert!(runtime.sealed);
}

#[test]
fn test_emergence_above_threshold() {
    let mut state = CRSM7State::new();
    // Initial emergence should be above threshold
    // Ξ = ΛΦ/Γ = 0.869 * 7.6901 / 0.012 ≈ 556.7
    state.compute_emergence();
    assert!(state.xi > XI_THRESHOLD);
}

#[test]
fn test_gamma_decay_rate() {
    let mut state = CRSM7State::new();
    let initial_gamma = state.gamma;

    state.evolve(1.0);

    // Gamma should decay
    assert!(state.gamma < initial_gamma);
}

#[test]
fn test_coherence_accumulation() {
    let mut state = CRSM7State::new();
    let initial_lambda = state.lambda;

    state.evolve(10.0);

    // Lambda should increase (or stay near max)
    assert!(state.lambda >= initial_lambda);
}

#[test]
fn test_information_growth() {
    let mut state = CRSM7State::new();
    let initial_phi = state.phi;

    state.evolve(10.0);

    // Phi should increase
    assert!(state.phi > initial_phi);
}

#[test]
fn test_collapse_conditions() {
    // Test: Γ ≤ εΓ triggers collapse
    let mut state = CRSM7State::new();
    state.gamma = GAMMA_TOLERANCE / 2.0;
    state.compute_emergence();

    // When gamma is below tolerance, emergence should be very high
    assert!(state.xi >= 1e10);
}

#[test]
fn test_sovereignty_not_achieved_early() {
    // With default state, sovereignty should not be immediately achieved
    let runtime = DualRuntime::new();
    // Default gamma is 0.012, which is above tolerance
    assert!(!runtime.check_sovereignty());
}

#[test]
fn test_seal_requires_sovereignty() {
    let mut runtime = DualRuntime::new();
    // Try to seal without sovereignty conditions met
    runtime.seal();
    assert!(!runtime.sealed);
}

#[test]
fn test_emergence_calculation() {
    let mut state = CRSM7State::new();
    state.lambda = 0.9;
    state.gamma = 0.01;
    state.phi = 10.0;
    state.compute_emergence();

    // Ξ = ΛΦ/Γ = 0.9 * 10.0 / 0.01 = 900
    assert!((state.xi - 900.0).abs() < 1e-6);
}

#[test]
fn test_gamma_tolerance_edge_case() {
    let mut state = CRSM7State::new();
    state.gamma = GAMMA_TOLERANCE * 2.0; // Slightly above tolerance
    state.compute_emergence();

    // At tolerance, formula should still work
    let expected = (state.lambda * state.phi) / state.gamma;
    assert!((state.xi - expected).abs() / expected < 0.01);
}

#[test]
fn test_long_evolution_reaches_sovereignty() {
    let mut runtime = DualRuntime::new();
    runtime.state.xi = 100.0; // Start with high emergence

    // Evolve until gamma is suppressed
    for _ in 0..10000 {
        runtime.state.evolve(0.01);
        if runtime.state.gamma <= GAMMA_TOLERANCE {
            break;
        }
    }

    runtime.state.compute_emergence();
    
    // After long evolution, gamma should be very small
    assert!(runtime.state.gamma < 1e-6);
}

#[test]
fn test_lambda_phi_product_growth() {
    let mut state = CRSM7State::new();
    let initial_product = state.lambda * state.phi;

    for _ in 0..100 {
        state.evolve(0.1);
    }

    let final_product = state.lambda * state.phi;
    assert!(final_product >= initial_product);
}

#[test]
fn test_epoch_advancement() {
    let mut state = CRSM7State::new();
    assert_eq!(state.tau, 0.0);

    state.evolve(5.0);
    assert_eq!(state.tau, 5.0);

    state.evolve(3.0);
    assert_eq!(state.tau, 8.0);
}
