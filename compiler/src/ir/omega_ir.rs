//! Omega Intermediate Representation
//!
//! Unified IR that bridges dna::}{::lang and 7dCRSM::}{::lang
//! after the Ω_bind operation fuses them into a single execution model.

use serde::{Deserialize, Serialize};

/// The unified Omega IR representation after binding
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OmegaIR {
    /// Bound state from Z3 binding operation
    pub z3_state: Z3StateIR,
    /// Gene operations mapped to covariant derivatives
    pub gene_ops: Vec<GeneOp>,
    /// Field mappings to 7D coordinates
    pub field_coords: Vec<FieldCoord>,
    /// Evolution equations from Hamiltonian
    pub evolution: EvolutionIR,
    /// Collapse rules
    pub collapse_rules: Vec<CollapseRuleIR>,
}

impl Default for OmegaIR {
    fn default() -> Self {
        Self::new()
    }
}

impl OmegaIR {
    pub fn new() -> Self {
        Self {
            z3_state: Z3StateIR::default(),
            gene_ops: Vec::new(),
            field_coords: Vec::new(),
            evolution: EvolutionIR::default(),
            collapse_rules: Vec::new(),
        }
    }
}

/// Z3 State in IR form
/// Contains the bound quantum state and 7D metric
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Z3StateIR {
    /// Complex amplitude (real part)
    pub psi_real: f64,
    /// Complex amplitude (imaginary part)
    pub psi_imag: f64,
    /// 7D metric tensor (diagonal approximation)
    pub metric_diag: [f64; 7],
    /// 7D gradient vector
    pub nabla_7d: [f64; 7],
    /// Decoherence parameter
    pub gamma: f64,
    /// Coherence parameter
    pub lambda: f64,
    /// Information parameter
    pub phi: f64,
    /// Emergence factor
    pub xi: f64,
}

impl Default for Z3StateIR {
    fn default() -> Self {
        Self {
            psi_real: 1.0,
            psi_imag: 0.0,
            metric_diag: [1.0, 1.0, 1.0, 0.0, 0.0, -1.0, 0.0],
            nabla_7d: [0.0; 7],
            gamma: 0.012,
            lambda: 0.869,
            phi: 7.6901,
            xi: 0.0,
        }
    }
}

/// Gene operation mapped to covariant derivative
/// gene_i → ∂_A Ψ
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeneOp {
    pub name: String,
    /// Index in the connection form
    pub connection_index: usize,
    /// Type of operation
    pub op_type: GeneOpType,
}

/// Types of gene operations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum GeneOpType {
    /// Emit string output
    Emit(String),
    /// Bifurcate into Π+ and Π-
    Bifurcate,
    /// Mark as sovereign
    Sovereign,
    /// Call another function
    Call(String, Vec<String>),
}

/// Field coordinate mapping
/// field f_j → coordinate_j ∈ M⁷
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FieldCoord {
    pub field_name: String,
    pub coord_index: usize,
    pub coord_value: f64,
}

/// Evolution equations in IR form
/// ∂τΨ = H_CRSM Ψ
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvolutionIR {
    /// Hamiltonian terms
    pub hamiltonian_terms: Vec<HamiltonianTermIR>,
    /// Time step
    pub dt: f64,
}

impl Default for EvolutionIR {
    fn default() -> Self {
        Self {
            hamiltonian_terms: Vec::new(),
            dt: 0.01,
        }
    }
}

/// Hamiltonian term in IR
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum HamiltonianTermIR {
    /// DΛ∇7D - coherence gradient coupling
    CoherenceGradient { coefficient: f64 },
    /// -KΓ - decoherence suppression
    DecoherenceSuppression { coefficient: f64 },
    /// Π±Jθ - duality torsion term
    DualityTorsion { coefficient: f64, theta: f64 },
    /// Ω∞ - sovereignty operator
    Sovereignty { threshold: f64 },
}

/// Collapse rule in IR
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CollapseRuleIR {
    pub condition: CollapseConditionIR,
    pub action: CollapseActionIR,
}

/// Collapse condition in IR
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CollapseConditionIR {
    /// Γ → 0
    GammaToZero { threshold: f64 },
    /// ΛΦ → max
    LambdaPhiMax { threshold: f64 },
}

/// Collapse action in IR
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CollapseActionIR {
    /// Apply Π± projector
    ApplyProjector,
    /// Seal sovereignty with Ω∞
    SealSovereignty,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_omega_ir_creation() {
        let ir = OmegaIR::new();
        assert!(ir.gene_ops.is_empty());
        assert!(ir.field_coords.is_empty());
    }

    #[test]
    fn test_z3_state_defaults() {
        let state = Z3StateIR::default();
        assert_eq!(state.gamma, 0.012);
        assert_eq!(state.lambda, 0.869);
    }

    #[test]
    fn test_hamiltonian_terms() {
        let term = HamiltonianTermIR::DualityTorsion {
            coefficient: 1.0,
            theta: 51.843,
        };
        if let HamiltonianTermIR::DualityTorsion { theta, .. } = term {
            assert_eq!(theta, 51.843);
        }
    }
}
