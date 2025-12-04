//! DNA Lang AST Definitions
//!
//! AST nodes for dna::}{::lang (organism-layer)
//!
//! Grammar reference:
//! - program ::= organism*
//! - organism ::= "organism" IDENT "{" body "}"
//! - body ::= (field | gene | evolve | collapse)*

use serde::{Deserialize, Serialize};

/// A complete DNA program consisting of organisms
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DnaProgram {
    pub organisms: Vec<Organism>,
}

impl Default for DnaProgram {
    fn default() -> Self {
        Self::new()
    }
}

impl DnaProgram {
    pub fn new() -> Self {
        Self {
            organisms: Vec::new(),
        }
    }

    pub fn add_organism(&mut self, organism: Organism) {
        self.organisms.push(organism);
    }
}

/// An organism definition in DNA lang
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Organism {
    pub name: String,
    pub fields: Vec<Field>,
    pub genes: Vec<Gene>,
    pub evolve: Option<Evolve>,
    pub collapse: Option<Collapse>,
}

impl Organism {
    pub fn new(name: &str) -> Self {
        Self {
            name: name.to_string(),
            fields: Vec::new(),
            genes: Vec::new(),
            evolve: None,
            collapse: None,
        }
    }
}

/// Field definition: field IDENT : IDENT
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Field {
    pub name: String,
    pub field_type: String,
}

impl Field {
    pub fn new(name: &str, field_type: &str) -> Self {
        Self {
            name: name.to_string(),
            field_type: field_type.to_string(),
        }
    }
}

/// Gene definition with body expressions
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Gene {
    pub name: String,
    pub body: Vec<Expr>,
}

impl Gene {
    pub fn new(name: &str) -> Self {
        Self {
            name: name.to_string(),
            body: Vec::new(),
        }
    }
}

/// Expression types in gene bodies
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Expr {
    Emit(String),
    Bifurcate(String),
    Sovereign,
    Call(String, Vec<Expr>),
    Ident(String),
}

/// Evolution block with ODEs
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Evolve {
    pub odes: Vec<Ode>,
}

impl Default for Evolve {
    fn default() -> Self {
        Self::new()
    }
}

impl Evolve {
    pub fn new() -> Self {
        Self { odes: Vec::new() }
    }
}

/// Ordinary differential equation: ∂τ (vars) = rhs
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Ode {
    pub state_vars: Vec<String>,
    pub rhs_func: String,
    pub rhs_args: Vec<String>,
}

/// Collapse block with rules
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Collapse {
    pub rules: Vec<CollapseRule>,
}

impl Default for Collapse {
    fn default() -> Self {
        Self::new()
    }
}

impl Collapse {
    pub fn new() -> Self {
        Self { rules: Vec::new() }
    }
}

/// Collapse rule: if condition then action
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CollapseRule {
    pub condition: CollapseCondition,
    pub action: String,
}

/// Collapse condition types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CollapseCondition {
    LessOrEqual(String, String),
    TendsTo(String, f64),
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_program_creation() {
        let mut program = DnaProgram::new();
        let organism = Organism::new("TestOrganism");
        program.add_organism(organism);
        assert_eq!(program.organisms.len(), 1);
    }

    #[test]
    fn test_organism_with_fields() {
        let mut organism = Organism::new("CRSM7");
        organism.fields.push(Field::new("lambda", "coherence"));
        organism.fields.push(Field::new("gamma", "decoherence"));
        assert_eq!(organism.fields.len(), 2);
    }

    #[test]
    fn test_gene_with_expressions() {
        let mut gene = Gene::new("main");
        gene.body.push(Expr::Emit("Hello".to_string()));
        gene.body.push(Expr::Bifurcate("psi".to_string()));
        gene.body.push(Expr::Sovereign);
        assert_eq!(gene.body.len(), 3);
    }
}
