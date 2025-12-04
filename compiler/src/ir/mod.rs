//! IR Module
//!
//! Re-exports Omega IR types

pub mod omega_ir;

pub use omega_ir::{
    CollapseActionIR, CollapseConditionIR, CollapseRuleIR, EvolutionIR, FieldCoord,
    GeneOp, GeneOpType, HamiltonianTermIR, OmegaIR, Z3StateIR,
};
