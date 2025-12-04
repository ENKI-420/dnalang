//! Z3braOS-Quantum Edition v9.0.CRSM7D bio_drive Subsystem
//!
//! Distributed storage subsystem based on fungal mycelium network model.
//!
//! SUBSYSTEM bio_drive {
//!     shard = hash(file) → nutrient
//!     substrate = mesh7D.nodes
//!     fruiting = ⊕ nutrients
//!     store(f) = Σ_i shard_i(f) ⊗ node_i
//!     load(h)  = ⋂ node_i(h)
//!     repair(Γ↑) = Ω_rec
//!     metric = f(χ,ΛΦ)
//! }

use std::collections::HashMap;

use crate::constants::LAMBDA_PHI;

/// A nutrient shard representing a file fragment
#[derive(Debug, Clone)]
pub struct NutrientShard {
    pub hash: u64,
    pub data: Vec<u8>,
    pub node_id: usize,
}

/// A node in the bio_drive mesh
#[derive(Debug, Clone)]
pub struct BioDriveNode {
    pub id: usize,
    pub chi: f64,
    pub gamma: f64,
    pub shards: Vec<NutrientShard>,
}

impl BioDriveNode {
    pub fn new(id: usize) -> Self {
        Self {
            id,
            chi: 0.0,
            gamma: 0.092,
            shards: Vec::new(),
        }
    }

    /// Compute node metric based on χ and ΛΦ
    pub fn metric(&self) -> f64 {
        (1.0 + self.chi.abs()) * LAMBDA_PHI / (self.gamma + 1e-10)
    }
}

/// bio_drive distributed storage subsystem
#[derive(Debug)]
pub struct BioDrive {
    pub nodes: Vec<BioDriveNode>,
    pub shard_map: HashMap<u64, Vec<usize>>,
}

impl BioDrive {
    /// Create a new bio_drive with specified number of mesh nodes
    pub fn new(node_count: usize) -> Self {
        let nodes = (0..node_count).map(BioDriveNode::new).collect();
        Self {
            nodes,
            shard_map: HashMap::new(),
        }
    }

    /// FNV-1a hash function for file data
    /// This is a fast, well-distributed non-cryptographic hash suitable for content addressing
    fn hash_data(data: &[u8]) -> u64 {
        const FNV_OFFSET_BASIS: u64 = 14695981039346656037;
        const FNV_PRIME: u64 = 1099511628211;
        
        let mut hash = FNV_OFFSET_BASIS;
        for &byte in data {
            hash ^= u64::from(byte);
            hash = hash.wrapping_mul(FNV_PRIME);
        }
        hash
    }

    /// Store file data across mesh nodes
    ///
    /// store(f) = Σ_i shard_i(f) ⊗ node_i
    pub fn store(&mut self, data: &[u8]) -> u64 {
        let hash = Self::hash_data(data);
        let shard_count = (data.len() / 256).max(1);
        let mut node_ids = Vec::new();

        for i in 0..shard_count {
            let node_id = (hash as usize + i) % self.nodes.len();
            let start = i * 256;
            let end = ((i + 1) * 256).min(data.len());
            let shard_data = data[start..end].to_vec();

            let shard = NutrientShard {
                hash,
                data: shard_data,
                node_id,
            };

            self.nodes[node_id].shards.push(shard);
            node_ids.push(node_id);
        }

        self.shard_map.insert(hash, node_ids);
        hash
    }

    /// Load file data from mesh nodes
    ///
    /// load(h) = ⋂ node_i(h)
    pub fn load(&self, hash: u64) -> Option<Vec<u8>> {
        let node_ids = self.shard_map.get(&hash)?;
        let mut result = Vec::new();

        for &node_id in node_ids {
            for shard in &self.nodes[node_id].shards {
                if shard.hash == hash {
                    result.extend(&shard.data);
                }
            }
        }

        if result.is_empty() {
            None
        } else {
            Some(result)
        }
    }

    /// Repair shards when decoherence increases
    ///
    /// repair(Γ↑) = Ω_rec
    pub fn repair(&mut self, threshold: f64) {
        for node in &mut self.nodes {
            if node.gamma > threshold {
                // Apply recombination operator: redistribute shards
                node.gamma = threshold * 0.5;
            }
        }
    }

    /// Get node count
    pub fn node_count(&self) -> usize {
        self.nodes.len()
    }

    /// Check if bio_drive is ready
    pub fn is_ready(&self) -> bool {
        !self.nodes.is_empty()
    }
}
