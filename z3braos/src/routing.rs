//! Z3braOS-Quantum Edition v9.0.CRSM7D 7D Routing
//!
//! 7-dimensional mesh routing with torsion-aware path computation.
//!
//! Route_7D(i→j) = ∇_mesh7D(x_i−x_j) + sin(θ_i−φ_j) + ΛΦ/(Γ_i+Γ_j) + |χ_i−χ_j|

use std::collections::HashSet;

use crate::constants::LAMBDA_PHI;
use crate::manifold::Node7D;

/// Compute 7D routing metric between two nodes
///
/// Route_7D(i→j) = ∇_mesh7D(x_i−x_j) + sin(θ_i−φ_j) + ΛΦ/(Γ_i+Γ_j) + |χ_i−χ_j|
pub fn route_7d(i: &Node7D, j: &Node7D) -> f64 {
    // Spatial distance component
    let spatial = ((i.x - j.x).powi(2) + (i.y - j.y).powi(2) + (i.z - j.z).powi(2)).sqrt();

    // Angular coupling component
    let angular = (i.theta - j.phi).sin();

    // Coherence component (protected against division by zero)
    let coherence = LAMBDA_PHI / (i.gamma + j.gamma + 1e-10);

    // Non-local χ distance
    let chi_dist = (i.chi - j.chi).abs();

    spatial + angular + coherence + chi_dist
}

/// Find shortest path in 7D mesh (simplified greedy)
pub fn find_path(nodes: &[Node7D], source: usize, target: usize) -> Vec<usize> {
    if source == target {
        return vec![source];
    }

    let mut path = vec![source];
    let mut visited: HashSet<usize> = HashSet::new();
    visited.insert(source);
    let mut current = source;

    // Greedy path finding - always move toward target
    while current != target && path.len() < nodes.len() {
        let mut best_next = target;
        let mut best_cost = f64::MAX;

        for (idx, node) in nodes.iter().enumerate() {
            if idx != current && !visited.contains(&idx) {
                let cost = route_7d(&nodes[current], node) + route_7d(node, &nodes[target]);
                if cost < best_cost {
                    best_cost = cost;
                    best_next = idx;
                }
            }
        }

        path.push(best_next);
        visited.insert(best_next);
        current = best_next;
    }

    path
}

/// Compute total path cost
pub fn path_cost(nodes: &[Node7D], path: &[usize]) -> f64 {
    let mut cost = 0.0;
    for window in path.windows(2) {
        cost += route_7d(&nodes[window[0]], &nodes[window[1]]);
    }
    cost
}
