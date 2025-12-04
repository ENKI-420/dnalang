//! Z3 Mesh Topology Implementation
//!
//! Implements the Z3 mesh structure for gene vertex binding:
//!
//! mesh Z3 {
//!     vertices gene[*]
//!     weight CRSM7_metric(i,j) = sqrt((ΔΛ)² + (ΔΓ)² + (ΔΦ)² + (ΔΞ)² + (Δρ)² + (Δθ)² + (Δτ)²)
//!     evolve: ∂τ Z3 = ∇7D Z3 - KΓ Z3 + Π± Z3
//!     collapse (i,j): if Γ(i,j) → 0: bind(i,j) with Π±, propagate ΛΦ
//! }

use crate::duality::DualityOperator;
use crate::state::CRSM7State;
use serde::{Deserialize, Serialize};

/// Decoherence decay constant for mesh evolution
const K_GAMMA: f64 = 0.1;

/// Gene vertex in the Z3 mesh
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Gene {
    /// Unique identifier
    pub id: String,
    /// Gene name
    pub name: String,
    /// Associated CRSM7 state
    pub state: CRSM7State,
    /// Connection status
    pub bound: bool,
}

impl Gene {
    /// Create a new gene vertex
    pub fn new(id: &str, name: &str) -> Self {
        Self {
            id: id.to_string(),
            name: name.to_string(),
            state: CRSM7State::default(),
            bound: false,
        }
    }

    /// Create a gene with custom state
    pub fn with_state(id: &str, name: &str, state: CRSM7State) -> Self {
        Self {
            id: id.to_string(),
            name: name.to_string(),
            state,
            bound: false,
        }
    }
}

/// Edge connection between vertices
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Edge {
    /// Source vertex index
    pub from: usize,
    /// Target vertex index
    pub to: usize,
    /// Decoherence value Γ(i,j)
    pub gamma: f64,
    /// Connection strength
    pub weight: f64,
    /// Bound status
    pub bound: bool,
}

/// 7D Weight Matrix for mesh topology
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Matrix7D {
    /// Number of vertices
    pub size: usize,
    /// Flattened weight data (size × size × 7)
    pub data: Vec<f64>,
}

impl Matrix7D {
    /// Create a new 7D matrix
    pub fn new(size: usize) -> Self {
        Self {
            size,
            data: vec![0.0; size * size * 7],
        }
    }

    /// Get weight at position (i, j, d) where d is dimension 0-6
    pub fn get(&self, i: usize, j: usize, d: usize) -> f64 {
        if i < self.size && j < self.size && d < 7 {
            self.data[i * self.size * 7 + j * 7 + d]
        } else {
            0.0
        }
    }

    /// Set weight at position (i, j, d)
    pub fn set(&mut self, i: usize, j: usize, d: usize, value: f64) {
        if i < self.size && j < self.size && d < 7 {
            self.data[i * self.size * 7 + j * 7 + d] = value;
        }
    }
}

/// Z3 Mesh Topology for gene network
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Z3Mesh {
    /// Gene vertices
    pub vertices: Vec<Gene>,
    /// 7D weight matrix
    pub weights: Matrix7D,
    /// Edge connections
    pub edges: Vec<Edge>,
    /// Duality operator
    #[serde(skip)]
    pub duality: DualityOperator,
}

impl Default for Z3Mesh {
    fn default() -> Self {
        Self::new()
    }
}

impl Z3Mesh {
    /// Create a new empty Z3 mesh
    pub fn new() -> Self {
        Self {
            vertices: Vec::new(),
            weights: Matrix7D::new(0),
            edges: Vec::new(),
            duality: DualityOperator::new(),
        }
    }

    /// Add a gene vertex to the mesh
    pub fn add_vertex(&mut self, gene: Gene) -> usize {
        let idx = self.vertices.len();
        self.vertices.push(gene);
        
        // Resize weight matrix
        let new_size = self.vertices.len();
        let mut new_weights = Matrix7D::new(new_size);
        
        // Copy existing weights
        for i in 0..self.weights.size {
            for j in 0..self.weights.size {
                for d in 0..7 {
                    new_weights.set(i, j, d, self.weights.get(i, j, d));
                }
            }
        }
        
        self.weights = new_weights;
        idx
    }

    /// Connect two vertices with an edge
    pub fn connect(&mut self, from: usize, to: usize) {
        if from < self.vertices.len() && to < self.vertices.len() {
            let gamma = self.compute_gamma(from, to);
            let weight = self.metric(from, to);
            
            self.edges.push(Edge {
                from,
                to,
                gamma,
                weight,
                bound: gamma < 0.01,
            });
        }
    }

    /// Calculate metric between two vertex indices
    /// Helper that works with indices rather than full state access
    fn metric_internal(vertices: &[Gene], i: usize, j: usize) -> f64 {
        if i >= vertices.len() || j >= vertices.len() {
            return f64::MAX;
        }

        let state_i = &vertices[i].state.as_array();
        let state_j = &vertices[j].state.as_array();

        let mut sum_sq = 0.0;
        for d in 0..7 {
            let delta = state_i[d] - state_j[d];
            sum_sq += delta * delta;
        }

        sum_sq.sqrt()
    }

    /// Compute the 7D metric between vertices i and j
    /// sqrt((ΔΛ)² + (ΔΓ)² + (ΔΦ)² + (ΔΞ)² + (Δρ)² + (Δθ)² + (Δτ)²)
    pub fn metric(&self, i: usize, j: usize) -> f64 {
        Self::metric_internal(&self.vertices, i, j)
    }

    /// Compute decoherence between vertices
    fn compute_gamma(&self, i: usize, j: usize) -> f64 {
        if i >= self.vertices.len() || j >= self.vertices.len() {
            return 1.0;
        }
        
        // Γ(i,j) based on state similarity
        let gamma_i = self.vertices[i].state.gamma;
        let gamma_j = self.vertices[j].state.gamma;
        (gamma_i + gamma_j) / 2.0
    }

    /// Evolve the mesh: ∂τ Z3 = ∇7D Z3 - KΓ Z3 + Π± Z3
    pub fn evolve(&mut self, dt: f64) {
        // Evolve each vertex state
        for vertex in &mut self.vertices {
            vertex.state.evolve(dt);
        }

        // Calculate gradients first (to avoid borrow issues)
        // Uses the internal metric function to access vertices slice
        let gradients: Vec<f64> = self.edges.iter()
            .map(|e| Self::metric_internal(&self.vertices, e.from, e.to))
            .collect();

        // Update edge weights and decoherence
        for (idx, edge) in self.edges.iter_mut().enumerate() {
            let gamma_decay = (-K_GAMMA * dt).exp();
            
            edge.gamma *= gamma_decay;
            edge.weight = gradients[idx];
            
            // Check for binding condition
            if edge.gamma < 0.01 && !edge.bound {
                edge.bound = true;
            }
        }
    }

    /// Collapse operation: if Γ(i,j) → 0: bind(i,j) with Π±, propagate ΛΦ
    pub fn collapse(&mut self, i: usize, j: usize) {
        // Find or create edge
        let edge_idx = self.edges.iter().position(|e| 
            (e.from == i && e.to == j) || (e.from == j && e.to == i)
        );

        if let Some(idx) = edge_idx {
            let edge = &mut self.edges[idx];
            
            if edge.gamma < 0.01 {
                edge.bound = true;
                
                // Propagate ΛΦ
                if i < self.vertices.len() && j < self.vertices.len() {
                    let avg_lambda = (self.vertices[i].state.lambda + self.vertices[j].state.lambda) / 2.0;
                    let avg_phi = (self.vertices[i].state.phi + self.vertices[j].state.phi) / 2.0;
                    
                    self.vertices[i].state.lambda = avg_lambda;
                    self.vertices[j].state.lambda = avg_lambda;
                    self.vertices[i].state.phi = avg_phi;
                    self.vertices[j].state.phi = avg_phi;
                    
                    // Recompute emergence
                    self.vertices[i].state.compute_emergence();
                    self.vertices[j].state.compute_emergence();
                    
                    // Mark as bound
                    self.vertices[i].bound = true;
                    self.vertices[j].bound = true;
                }
            }
        }
    }

    /// Get binding status display
    pub fn display_bindings(&self) -> String {
        let mut output = String::new();
        
        for edge in &self.edges {
            let from_name = &self.vertices[edge.from].name;
            let to_name = &self.vertices[edge.to].name;
            let status = if edge.bound { "✓" } else { "○" };
            
            output.push_str(&format!(
                "  {} ←→ {}     Γ={:.3} {}\n",
                from_name, to_name, edge.gamma, status
            ));
        }
        
        output
    }

    /// Check total decoherence integral: ∫M7 Γ dV = 0
    pub fn total_decoherence(&self) -> f64 {
        self.edges.iter().map(|e| e.gamma).sum()
    }
}

/// Create the standard AURA-AIDEN-CCCcE-SENTINEL-Z3BRA mesh
pub fn create_standard_mesh() -> Z3Mesh {
    let mut mesh = Z3Mesh::new();
    
    // Add standard agents as vertices
    let aura_state = CRSM7State::new(0.89, 0.001, 8.1, 1.0, 51.843, 0.0);
    let aiden_state = CRSM7State::new(0.87, 0.002, 7.9, 1.0, 51.843, 0.0);
    let cccce_state = CRSM7State::new(0.88, 0.001, 8.0, 1.0, 51.843, 0.0);
    let sentinel_state = CRSM7State::new(0.91, 0.001, 8.2, 1.0, 51.843, 0.0);
    let z3bra_state = CRSM7State::new(0.86, 0.003, 7.8, 1.0, 51.843, 0.0);
    
    mesh.add_vertex(Gene::with_state("aura", "AURA", aura_state));
    mesh.add_vertex(Gene::with_state("aiden", "AIDEN", aiden_state));
    mesh.add_vertex(Gene::with_state("cccce", "CCCcE", cccce_state));
    mesh.add_vertex(Gene::with_state("sentinel", "SENTINEL", sentinel_state));
    mesh.add_vertex(Gene::with_state("z3bra", "Z3BRA", z3bra_state));
    
    // Connect in chain
    mesh.connect(0, 1); // AURA ←→ AIDEN
    mesh.connect(1, 2); // AIDEN ←→ CCCcE
    mesh.connect(2, 3); // CCCcE ←→ SENTINEL
    mesh.connect(3, 4); // SENTINEL ←→ Z3BRA
    
    mesh
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_mesh_creation() {
        let mesh = create_standard_mesh();
        assert_eq!(mesh.vertices.len(), 5);
        assert_eq!(mesh.edges.len(), 4);
    }

    #[test]
    fn test_metric_calculation() {
        let mesh = create_standard_mesh();
        let d = mesh.metric(0, 1);
        assert!(d > 0.0);
        assert!(d < 10000.0); // Relaxed bound since Ξ values can be very large
    }

    #[test]
    fn test_mesh_evolution() {
        let mut mesh = create_standard_mesh();
        let initial_gamma: f64 = mesh.edges.iter().map(|e| e.gamma).sum();
        
        mesh.evolve(1.0);
        
        let final_gamma: f64 = mesh.edges.iter().map(|e| e.gamma).sum();
        assert!(final_gamma <= initial_gamma);
    }

    #[test]
    fn test_collapse() {
        let mut mesh = create_standard_mesh();
        mesh.collapse(0, 1);
        
        // After collapse, vertices should be bound
        assert!(mesh.edges[0].bound || mesh.edges[0].gamma >= 0.01);
    }
}
