//! Z3braOS-Quantum Edition v9.0.CRSM7D thalamus_pad Subsystem
//!
//! CRDT consensus layer based on thalamic relay model.
//!
//! SUBSYSTEM thalamus_pad {
//!     σ = σ(τ,χ)
//!     σ_{i→j} = merge(σ_i,σ_j)
//!     topology = Ω_phase_coupling(θ,φ,χ)
//!     consensus = lim_{τ→∞} σ_i = σ_j
//! }

use crate::constants::THETA_LOCK_RAD;

/// State vector σ at a given node
#[derive(Debug, Clone)]
pub struct StateVector {
    pub tau: f64,
    pub chi: f64,
    pub value: f64,
    pub version: u64,
}

impl StateVector {
    pub fn new(value: f64) -> Self {
        Self {
            tau: 0.0,
            chi: 0.0,
            value,
            version: 0,
        }
    }

    /// Merge two state vectors (CRDT merge operation)
    ///
    /// σ_{i→j} = merge(σ_i,σ_j)
    pub fn merge(&self, other: &StateVector) -> StateVector {
        // Last-write-wins based on version and tau
        if self.version > other.version {
            self.clone()
        } else if other.version > self.version {
            other.clone()
        } else if self.tau >= other.tau {
            self.clone()
        } else {
            other.clone()
        }
    }

    /// Update state
    pub fn update(&mut self, value: f64, tau: f64) {
        self.value = value;
        self.tau = tau;
        self.version += 1;
    }
}

/// A node in the thalamus_pad consensus network
#[derive(Debug, Clone)]
pub struct ThalamusNode {
    pub id: usize,
    pub theta: f64,
    pub phi: f64,
    pub chi: f64,
    pub state: StateVector,
}

impl ThalamusNode {
    pub fn new(id: usize) -> Self {
        Self {
            id,
            theta: THETA_LOCK_RAD,
            phi: 0.0,
            chi: 0.0,
            state: StateVector::new(0.0),
        }
    }
}

/// thalamus_pad CRDT consensus subsystem
#[derive(Debug)]
pub struct ThalamusPad {
    pub nodes: Vec<ThalamusNode>,
}

impl ThalamusPad {
    pub fn new() -> Self {
        Self { nodes: Vec::new() }
    }

    /// Add a node to the consensus network
    pub fn add_node(&mut self, node: ThalamusNode) {
        self.nodes.push(node);
    }

    /// Initialize with specified number of nodes
    pub fn init(&mut self, count: usize) {
        for i in 0..count {
            self.add_node(ThalamusNode::new(i));
        }
    }

    /// Compute phase coupling topology metric
    ///
    /// topology = Ω_phase_coupling(θ,φ,χ)
    pub fn phase_coupling(node_a: &ThalamusNode, node_b: &ThalamusNode) -> f64 {
        let theta_diff = (node_a.theta - node_b.theta).cos();
        let phi_diff = (node_a.phi - node_b.phi).cos();
        let chi_diff = (node_a.chi - node_b.chi).abs();

        theta_diff * phi_diff / (1.0 + chi_diff)
    }

    /// Synchronize two nodes (CRDT merge)
    pub fn sync_nodes(&mut self, i: usize, j: usize) {
        if i < self.nodes.len() && j < self.nodes.len() {
            let merged = self.nodes[i].state.merge(&self.nodes[j].state);
            self.nodes[i].state = merged.clone();
            self.nodes[j].state = merged;
        }
    }

    /// Check if consensus is reached
    ///
    /// consensus = lim_{τ→∞} σ_i = σ_j
    pub fn has_consensus(&self) -> bool {
        if self.nodes.len() <= 1 {
            return true;
        }

        let first_value = self.nodes[0].state.value;
        self.nodes.iter().all(|n| (n.state.value - first_value).abs() < 1e-10)
    }

    /// Run consensus round
    pub fn consensus_round(&mut self) {
        let n = self.nodes.len();
        for i in 0..n {
            for j in (i + 1)..n {
                self.sync_nodes(i, j);
            }
        }
    }

    /// Check if layer is online
    pub fn is_online(&self) -> bool {
        !self.nodes.is_empty()
    }
}

impl Default for ThalamusPad {
    fn default() -> Self {
        Self::new()
    }
}
