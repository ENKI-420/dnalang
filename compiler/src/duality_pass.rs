//! Duality Pass Implementation
//!
//! Compiler pass that implements duality-polarized bifurcation
//! throughout the AST transformation pipeline.
//!
//! Key operations:
//! - Bifurcation: B(Ψ) = (Π⁺Ψ, Π⁻Ψ)
//! - Projectors: Π± = (I ± J) / 2
//! - Involution: J² = I, JΨ = -Ψ

use crate::ast::{DnaProgram, Expr, Organism};
use crate::ir::{GeneOp, GeneOpType, OmegaIR};
use serde::{Deserialize, Serialize};

/// Result of a bifurcation operation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BifurcationResult {
    /// Π⁺ branch result
    pub positive: f64,
    /// Π⁻ branch result
    pub negative: f64,
}

impl BifurcationResult {
    pub fn new(psi: f64) -> Self {
        let (positive, negative) = bifurcate(psi);
        Self { positive, negative }
    }
}

/// J involution operator
/// J² = I (involution property)
/// JΨ = -Ψ (polarity inversion)
#[inline]
pub fn involution_j(psi: f64) -> f64 {
    -psi
}

/// Π⁺ projector: Π⁺ = (I + J) / 2
#[inline]
pub fn pi_plus(psi: f64) -> f64 {
    0.5 * (psi + involution_j(psi))
}

/// Π⁻ projector: Π⁻ = (I - J) / 2
#[inline]
pub fn pi_minus(psi: f64) -> f64 {
    0.5 * (psi - involution_j(psi))
}

/// Bifurcation operation: B(Ψ) = (Π⁺Ψ, Π⁻Ψ)
pub fn bifurcate(psi: f64) -> (f64, f64) {
    (pi_plus(psi), pi_minus(psi))
}

/// Duality pass state
#[derive(Debug, Clone)]
pub struct DualityPass {
    /// Track bifurcated branches
    pub branches: Vec<BifurcationResult>,
    /// Current polarity (+1 or -1)
    pub current_polarity: f64,
}

impl Default for DualityPass {
    fn default() -> Self {
        Self::new()
    }
}

impl DualityPass {
    pub fn new() -> Self {
        Self {
            branches: Vec::new(),
            current_polarity: 1.0,
        }
    }

    /// Run the duality pass on a DNA program
    pub fn run(&mut self, program: &DnaProgram) -> Vec<GeneOp> {
        let mut ops = Vec::new();

        for organism in &program.organisms {
            ops.extend(self.process_organism(organism));
        }

        ops
    }

    /// Process an organism and extract gene operations
    fn process_organism(&mut self, organism: &Organism) -> Vec<GeneOp> {
        let mut ops = Vec::new();

        for (idx, gene) in organism.genes.iter().enumerate() {
            for expr in &gene.body {
                match expr {
                    Expr::Bifurcate(target) => {
                        // Create bifurcation branch
                        let result = BifurcationResult::new(1.0);
                        self.branches.push(result);

                        ops.push(GeneOp {
                            name: gene.name.clone(),
                            connection_index: idx,
                            op_type: GeneOpType::Bifurcate,
                        });

                        ops.push(GeneOp {
                            name: format!("{}:bifurcate:{}", gene.name, target),
                            connection_index: idx,
                            op_type: GeneOpType::Bifurcate,
                        });
                    }
                    Expr::Sovereign => {
                        ops.push(GeneOp {
                            name: gene.name.clone(),
                            connection_index: idx,
                            op_type: GeneOpType::Sovereign,
                        });
                    }
                    Expr::Emit(s) => {
                        ops.push(GeneOp {
                            name: gene.name.clone(),
                            connection_index: idx,
                            op_type: GeneOpType::Emit(s.clone()),
                        });
                    }
                    Expr::Call(func, args) => {
                        let arg_names: Vec<String> = args
                            .iter()
                            .map(|a| match a {
                                Expr::Ident(n) => n.clone(),
                                _ => String::new(),
                            })
                            .collect();
                        ops.push(GeneOp {
                            name: gene.name.clone(),
                            connection_index: idx,
                            op_type: GeneOpType::Call(func.clone(), arg_names),
                        });
                    }
                    Expr::Ident(_) => {}
                }
            }
        }

        ops
    }

    /// Apply duality transformation to the Omega IR
    pub fn transform_ir(&self, ir: &mut OmegaIR) {
        // Update gene ops with bifurcation information
        for op in &mut ir.gene_ops {
            if matches!(op.op_type, GeneOpType::Bifurcate) {
                // Mark bifurcation operations
                op.connection_index = self.branches.len();
            }
        }
    }

    /// Verify projector completeness: Π⁺ + Π⁻ = I
    pub fn verify_completeness(&self, psi: f64) -> bool {
        let sum = pi_plus(psi) + pi_minus(psi);
        (sum - psi).abs() < 1e-10
    }

    /// Verify involution identity: J² = I
    pub fn verify_involution(&self, psi: f64) -> bool {
        let j_j_psi = involution_j(involution_j(psi));
        (j_j_psi - psi).abs() < 1e-10
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_involution_j_squared() {
        let psi = 3.14159;
        assert_eq!(involution_j(involution_j(psi)), psi);
    }

    #[test]
    fn test_projector_completeness() {
        let psi = 2.5;
        let result = pi_plus(psi) + pi_minus(psi);
        assert!((result - psi).abs() < 1e-10);
    }

    #[test]
    fn test_bifurcation() {
        let psi = 1.0;
        let (plus, minus) = bifurcate(psi);

        // For J(Ψ) = -Ψ:
        // Π⁺(Ψ) = 0.5(Ψ + (-Ψ)) = 0
        // Π⁻(Ψ) = 0.5(Ψ - (-Ψ)) = Ψ
        assert!((plus - 0.0).abs() < 1e-10);
        assert!((minus - psi).abs() < 1e-10);
    }

    #[test]
    fn test_bifurcation_linearity() {
        let a = 2.0;
        let b = 3.0;
        let psi = 1.0;
        let phi_val = 2.0;

        let left = bifurcate(a * psi + b * phi_val);
        let right = (
            a * bifurcate(psi).0 + b * bifurcate(phi_val).0,
            a * bifurcate(psi).1 + b * bifurcate(phi_val).1,
        );

        assert!((left.0 - right.0).abs() < 1e-10);
        assert!((left.1 - right.1).abs() < 1e-10);
    }

    #[test]
    fn test_duality_pass_creation() {
        let pass = DualityPass::new();
        assert_eq!(pass.current_polarity, 1.0);
        assert!(pass.branches.is_empty());
    }

    #[test]
    fn test_verify_completeness() {
        let pass = DualityPass::new();
        assert!(pass.verify_completeness(5.0));
        assert!(pass.verify_completeness(-3.0));
        assert!(pass.verify_completeness(0.0));
    }

    #[test]
    fn test_verify_involution() {
        let pass = DualityPass::new();
        assert!(pass.verify_involution(1.5));
        assert!(pass.verify_involution(-2.5));
        assert!(pass.verify_involution(0.0));
    }
}
