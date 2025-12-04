//! Ω_bind Operator Implementation
//!
//! Binds dna::}{::AST × 7dCRSM::}{::AST → Z3_state
//!
//! Mathematical specification:
//! ∀ gene_i ∈ organism:
//!     Ω_bind(gene_i) = ∂_A Ψ
//!
//! ∀ field f_j:
//!     Ω_bind(f_j) = coordinate_j ∈ M⁷
//!
//! ∀ evolve:
//!     Ω_bind(∂τ Ψ) = H_CRSM Ψ
//!
//! ∀ collapse:
//!     Γ ≤ εΓ → Π±
//!     ΛΦ = max → Ω∞.seal()

use crate::ast::{CrsmProgram, DnaProgram, Expr};
use crate::ir::{
    CollapseActionIR, CollapseConditionIR, CollapseRuleIR, EvolutionIR, FieldCoord, GeneOp,
    GeneOpType, HamiltonianTermIR, OmegaIR, Z3StateIR,
};
use serde::{Deserialize, Serialize};

/// Critical torsion angle (51.843°)
pub const THETA_CRITICAL: f64 = 51.843;

/// Decoherence tolerance
pub const GAMMA_TOLERANCE: f64 = 1e-9;

/// Sovereignty threshold for Ξ
pub const XI_THRESHOLD: f64 = 8.0;

/// Z3 State - the bound quantum state
///
/// Contains the wavefunction and all 7D manifold coordinates
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Z3State {
    /// Complex amplitude (psi_real + i*psi_imag)
    pub psi_real: f64,
    pub psi_imag: f64,
    /// 7D metric tensor g_{μν}
    pub metric: [[f64; 7]; 7],
    /// Π⁺ projector function result
    pub pi_plus_result: f64,
    /// Π⁻ projector function result
    pub pi_minus_result: f64,
    /// 7D gradient ∇7D
    pub nabla_7d: [f64; 7],
    /// Γ - decoherence
    pub gamma: f64,
    /// Λ - coherence
    pub lambda: f64,
    /// Φ - information
    pub phi: f64,
    /// Ξ - emergence
    pub xi: f64,
    /// τ - epoch
    pub tau: f64,
    /// θ - torsion angle
    pub theta: f64,
    /// ρ± - polarity
    pub rho: f64,
    /// Sealed status
    pub sealed: bool,
}

impl Default for Z3State {
    fn default() -> Self {
        Self::new()
    }
}

impl Z3State {
    pub fn new() -> Self {
        // Initialize with default 7D metric: g_{μν} = diag(1, 1, 1, sin²θ, sin²φ, -1, f(χ))
        let theta_rad = THETA_CRITICAL.to_radians();
        let sin_sq = theta_rad.sin().powi(2);

        let mut metric = [[0.0; 7]; 7];
        metric[0][0] = 1.0;
        metric[1][1] = 1.0;
        metric[2][2] = 1.0;
        metric[3][3] = sin_sq;
        metric[4][4] = sin_sq;
        metric[5][5] = -1.0;
        metric[6][6] = 0.869; // f(χ) ≈ λ

        Self {
            psi_real: 1.0,
            psi_imag: 0.0,
            metric,
            pi_plus_result: 0.0,
            pi_minus_result: 0.0,
            nabla_7d: [0.0; 7],
            gamma: 0.012,
            lambda: 0.869,
            phi: 7.6901,
            xi: 0.0,
            tau: 0.0,
            theta: THETA_CRITICAL,
            rho: 1.0,
            sealed: false,
        }
    }

    /// Compute the emergence factor Ξ = ΛΦ/Γ
    pub fn compute_emergence(&mut self) {
        if self.gamma > GAMMA_TOLERANCE {
            self.xi = (self.lambda * self.phi) / self.gamma;
        } else {
            self.xi = 1e12; // Cap for numerical stability
        }
    }

    /// Apply Π⁺ projector: Π⁺ = (I + J) / 2
    pub fn apply_pi_plus(&mut self, psi: f64) -> f64 {
        let j_psi = -psi; // J involution: J(Ψ) = -Ψ
        let result = 0.5 * (psi + j_psi);
        self.pi_plus_result = result;
        result
    }

    /// Apply Π⁻ projector: Π⁻ = (I - J) / 2
    pub fn apply_pi_minus(&mut self, psi: f64) -> f64 {
        let j_psi = -psi; // J involution
        let result = 0.5 * (psi - j_psi);
        self.pi_minus_result = result;
        result
    }

    /// Check if sovereignty conditions are met
    /// Ξ ≥ 8 and Γ ≤ εΓ
    pub fn check_sovereignty(&self) -> bool {
        self.xi >= XI_THRESHOLD && self.gamma <= GAMMA_TOLERANCE
    }

    /// Seal the state (Ω∞.seal())
    pub fn seal(&mut self) {
        if self.check_sovereignty() {
            self.sealed = true;
        }
    }
}

/// The Ω_bind operator implementation
///
/// Binds DNA AST and CRSM AST into unified Z3 state
pub fn omega_bind(program_dna: &DnaProgram, program_crsm: &CrsmProgram) -> Z3State {
    let mut state = Z3State::new();

    // Map genes → ∂_A Ψ
    for organism in &program_dna.organisms {
        for gene in &organism.genes {
            // Each gene contributes to the covariant derivative
            for expr in &gene.body {
                match expr {
                    Expr::Bifurcate(_) => {
                        // Bifurcation affects the projectors
                        state.apply_pi_plus(state.psi_real);
                        state.apply_pi_minus(state.psi_real);
                    }
                    Expr::Sovereign => {
                        // Check and seal sovereignty
                        state.compute_emergence();
                        if state.check_sovereignty() {
                            state.seal();
                        }
                    }
                    _ => {}
                }
            }
        }

        // Map fields → coordinates ∈ M⁷
        for (idx, field) in organism.fields.iter().enumerate() {
            if idx < 7 {
                // Map field to corresponding coordinate
                match field.field_type.as_str() {
                    "coherence" => state.nabla_7d[idx] = state.lambda,
                    "decoherence" => state.nabla_7d[idx] = state.gamma,
                    "information" => state.nabla_7d[idx] = state.phi,
                    "emergence" => state.nabla_7d[idx] = state.xi,
                    "polarity" => state.nabla_7d[idx] = state.rho,
                    "torsion" => state.nabla_7d[idx] = state.theta,
                    "epoch" => state.nabla_7d[idx] = state.tau,
                    _ => {}
                }
            }
        }
    }

    // Bind evolution: ∂τΨ = H_CRSM Ψ
    for manifold in &program_crsm.manifolds {
        // Process Hamiltonian terms
        for term in &manifold.hamiltonian.terms {
            use crate::ast::HamiltonianTerm;
            match term {
                HamiltonianTerm::Product(_, _) => {
                    // DΛ∇7D term
                    state.lambda += 0.01;
                }
                HamiltonianTerm::Negative(_) => {
                    // -KΓ term: suppress decoherence
                    state.gamma *= 0.99;
                }
                HamiltonianTerm::Simple(_, _) => {
                    // Π±Jθ term
                }
            }
        }
    }

    // Enforce collapse rules
    state.compute_emergence();
    if state.gamma <= GAMMA_TOLERANCE {
        // Γ ≤ εΓ → apply Π±
        state.apply_pi_plus(state.psi_real);
    }
    if state.lambda * state.phi > 10.0 {
        // ΛΦ = max → Ω∞.seal()
        state.seal();
    }

    state
}

/// Generate Omega IR from bound programs
pub fn generate_omega_ir(program_dna: &DnaProgram, program_crsm: &CrsmProgram) -> OmegaIR {
    let mut ir = OmegaIR::new();

    // Convert Z3 state
    let z3_state = omega_bind(program_dna, program_crsm);
    ir.z3_state = Z3StateIR {
        psi_real: z3_state.psi_real,
        psi_imag: z3_state.psi_imag,
        metric_diag: [
            z3_state.metric[0][0],
            z3_state.metric[1][1],
            z3_state.metric[2][2],
            z3_state.metric[3][3],
            z3_state.metric[4][4],
            z3_state.metric[5][5],
            z3_state.metric[6][6],
        ],
        nabla_7d: z3_state.nabla_7d,
        gamma: z3_state.gamma,
        lambda: z3_state.lambda,
        phi: z3_state.phi,
        xi: z3_state.xi,
    };

    // Map genes to operations
    for organism in &program_dna.organisms {
        for (idx, gene) in organism.genes.iter().enumerate() {
            let op_type = if gene.body.is_empty() {
                GeneOpType::Sovereign
            } else {
                match &gene.body[0] {
                    Expr::Emit(s) => GeneOpType::Emit(s.clone()),
                    Expr::Bifurcate(_) => GeneOpType::Bifurcate,
                    Expr::Sovereign => GeneOpType::Sovereign,
                    Expr::Call(name, _) => GeneOpType::Call(name.clone(), vec![]),
                    Expr::Ident(name) => GeneOpType::Call(name.clone(), vec![]),
                };
                GeneOpType::Sovereign
            };

            ir.gene_ops.push(GeneOp {
                name: gene.name.clone(),
                connection_index: idx,
                op_type,
            });
        }

        // Map fields to coordinates
        for (idx, field) in organism.fields.iter().enumerate() {
            ir.field_coords.push(FieldCoord {
                field_name: field.name.clone(),
                coord_index: idx,
                coord_value: z3_state.nabla_7d.get(idx).copied().unwrap_or(0.0),
            });
        }
    }

    // Generate Hamiltonian terms for evolution
    ir.evolution = EvolutionIR {
        hamiltonian_terms: vec![
            HamiltonianTermIR::CoherenceGradient { coefficient: 1.0 },
            HamiltonianTermIR::DecoherenceSuppression { coefficient: 0.1 },
            HamiltonianTermIR::DualityTorsion {
                coefficient: 1.0,
                theta: THETA_CRITICAL,
            },
            HamiltonianTermIR::Sovereignty { threshold: XI_THRESHOLD },
        ],
        dt: 0.01,
    };

    // Generate collapse rules
    ir.collapse_rules = vec![
        CollapseRuleIR {
            condition: CollapseConditionIR::GammaToZero {
                threshold: GAMMA_TOLERANCE,
            },
            action: CollapseActionIR::ApplyProjector,
        },
        CollapseRuleIR {
            condition: CollapseConditionIR::LambdaPhiMax { threshold: 10.0 },
            action: CollapseActionIR::SealSovereignty,
        },
    ];

    ir
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::ast::{Field, Gene, Manifold, Organism};

    #[test]
    fn test_z3_state_creation() {
        let state = Z3State::new();
        assert_eq!(state.theta, THETA_CRITICAL);
        assert!(!state.sealed);
    }

    #[test]
    fn test_pi_plus_pi_minus_sum() {
        let mut state = Z3State::new();
        let psi = 2.5;
        let plus = state.apply_pi_plus(psi);
        let minus = state.apply_pi_minus(psi);
        // Π⁺ + Π⁻ = I
        assert!((plus + minus - psi).abs() < 1e-10);
    }

    #[test]
    fn test_emergence_calculation() {
        let mut state = Z3State::new();
        state.compute_emergence();
        // Ξ = ΛΦ/Γ = 0.869 * 7.6901 / 0.012 ≈ 556.7
        assert!(state.xi > 500.0);
    }

    #[test]
    fn test_omega_bind() {
        let mut dna = DnaProgram::new();
        let mut organism = Organism::new("Test");
        organism.fields.push(Field::new("lambda", "coherence"));
        organism.genes.push(Gene::new("main"));
        dna.add_organism(organism);

        let mut crsm = CrsmProgram::new();
        crsm.add_manifold(Manifold::new("CRSM7"));

        let state = omega_bind(&dna, &crsm);
        assert!(state.lambda > 0.0);
    }

    #[test]
    fn test_sovereignty_check() {
        let mut state = Z3State::new();
        state.gamma = 1e-10;
        state.xi = 10.0;
        assert!(state.check_sovereignty());
    }
}
