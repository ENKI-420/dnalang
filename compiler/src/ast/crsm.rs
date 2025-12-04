//! CRSM Lang AST Definitions
//!
//! AST nodes for 7dCRSM::}{::lang (manifold-layer)
//!
//! Grammar reference:
//! - manifold ::= "manifold" IDENT "{" m_body "}"
//! - m_body ::= state hamiltonian constraint*

use serde::{Deserialize, Serialize};

/// A complete CRSM manifold program
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CrsmProgram {
    pub manifolds: Vec<Manifold>,
}

impl Default for CrsmProgram {
    fn default() -> Self {
        Self::new()
    }
}

impl CrsmProgram {
    pub fn new() -> Self {
        Self {
            manifolds: Vec::new(),
        }
    }

    pub fn add_manifold(&mut self, manifold: Manifold) {
        self.manifolds.push(manifold);
    }
}

/// A manifold definition in 7dCRSM lang
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Manifold {
    pub name: String,
    pub state: State,
    pub hamiltonian: Hamiltonian,
    pub constraints: Vec<Constraint>,
    pub operators: Vec<String>,
}

impl Manifold {
    pub fn new(name: &str) -> Self {
        Self {
            name: name.to_string(),
            state: State::default(),
            hamiltonian: Hamiltonian::default(),
            constraints: Vec::new(),
            operators: Vec::new(),
        }
    }
}

/// State definition: state IDENT = (vars...)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct State {
    pub name: String,
    pub variables: Vec<String>,
}

impl Default for State {
    fn default() -> Self {
        Self {
            name: String::new(),
            variables: Vec::new(),
        }
    }
}

impl State {
    pub fn new(name: &str, variables: Vec<String>) -> Self {
        Self {
            name: name.to_string(),
            variables,
        }
    }
}

/// Hamiltonian law definition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Hamiltonian {
    pub name: String,
    pub terms: Vec<HamiltonianTerm>,
}

impl Default for Hamiltonian {
    fn default() -> Self {
        Self {
            name: String::new(),
            terms: Vec::new(),
        }
    }
}

impl Hamiltonian {
    pub fn new(name: &str) -> Self {
        Self {
            name: name.to_string(),
            terms: Vec::new(),
        }
    }
}

/// Hamiltonian term types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum HamiltonianTerm {
    /// Positive term: +IDENT IDENT
    Product(String, String),
    /// Negative term: -IDENT
    Negative(String),
    /// Simple term: IDENT IDENT
    Simple(String, String),
}

/// Constraint definition with integral
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Constraint {
    pub integral: Integral,
}

/// Integral constraint: ∫ IDENT IDENT IDENT = NUMBER
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Integral {
    pub domain: String,
    pub integrand: String,
    pub variable: String,
    pub value: f64,
}

impl Integral {
    pub fn new(domain: &str, integrand: &str, variable: &str, value: f64) -> Self {
        Self {
            domain: domain.to_string(),
            integrand: integrand.to_string(),
            variable: variable.to_string(),
            value,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_program_creation() {
        let mut program = CrsmProgram::new();
        let manifold = Manifold::new("CRSM7");
        program.add_manifold(manifold);
        assert_eq!(program.manifolds.len(), 1);
    }

    #[test]
    fn test_manifold_with_state() {
        let mut manifold = Manifold::new("TestManifold");
        manifold.state = State::new(
            "C7D",
            vec![
                "Λ".to_string(),
                "Γ".to_string(),
                "Φ".to_string(),
                "Ξ".to_string(),
                "ρ".to_string(),
                "θ".to_string(),
                "τ".to_string(),
            ],
        );
        assert_eq!(manifold.state.variables.len(), 7);
    }

    #[test]
    fn test_hamiltonian_terms() {
        let mut h = Hamiltonian::new("H_CRSM");
        h.terms.push(HamiltonianTerm::Product("DΛ".to_string(), "∇7D".to_string()));
        h.terms.push(HamiltonianTerm::Negative("KΓ".to_string()));
        h.terms.push(HamiltonianTerm::Simple("Π±".to_string(), "Jθ".to_string()));
        assert_eq!(h.terms.len(), 3);
    }

    #[test]
    fn test_constraint() {
        let constraint = Constraint {
            integral: Integral::new("M7", "Γ", "dV", 0.0),
        };
        assert_eq!(constraint.integral.value, 0.0);
    }
}
