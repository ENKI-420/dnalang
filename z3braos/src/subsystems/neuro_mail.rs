//! Z3braOS-Quantum Edition v9.0.CRSM7D neuro_mail Subsystem
//!
//! Signal routing subsystem based on neural synapse model.
//!
//! SUBSYSTEM neuro_mail {
//!     S = (payload, τ, ρ, Ξ, χ)
//!     route = ∇_mesh7D S
//!     synapse_gap = wait(φ_active)
//!     deliver = route ∘ synapse_gap
//! }

use crate::constants::PHI_GOLDEN;

/// A signal message in the neuro_mail system
#[derive(Debug, Clone)]
pub struct Signal {
    /// Payload data
    pub payload: Vec<u8>,
    /// Temporal epoch τ
    pub tau: f64,
    /// Priority ρ
    pub rho: f64,
    /// Resonance index Ξ
    pub xi: f64,
    /// Non-local dimension χ
    pub chi: f64,
    /// Source node ID
    pub source: usize,
    /// Destination node ID
    pub destination: usize,
}

impl Signal {
    pub fn new(payload: Vec<u8>, source: usize, destination: usize) -> Self {
        Self {
            payload,
            tau: 0.0,
            rho: 1.0,
            xi: 1.0,
            chi: 0.0,
            source,
            destination,
        }
    }
}

/// A synapse connection between nodes
#[derive(Debug, Clone)]
pub struct Synapse {
    pub from: usize,
    pub to: usize,
    pub weight: f64,
    pub active: bool,
}

/// neuro_mail signal routing subsystem
#[derive(Debug)]
pub struct NeuroMail {
    pub synapses: Vec<Synapse>,
    pub queue: Vec<Signal>,
    pub delivered: Vec<Signal>,
}

impl NeuroMail {
    pub fn new() -> Self {
        Self {
            synapses: Vec::new(),
            queue: Vec::new(),
            delivered: Vec::new(),
        }
    }

    /// Add a synapse connection
    pub fn add_synapse(&mut self, from: usize, to: usize, weight: f64) {
        self.synapses.push(Synapse {
            from,
            to,
            weight,
            active: true,
        });
    }

    /// Compute routing gradient for a signal
    ///
    /// route = ∇_mesh7D S
    fn route(&self, signal: &Signal) -> Option<usize> {
        // Find best synapse path based on weight
        self.synapses
            .iter()
            .filter(|s| s.from == signal.source && s.active)
            .max_by(|a, b| a.weight.partial_cmp(&b.weight).unwrap())
            .map(|s| s.to)
    }

    /// Synapse gap wait based on φ-activity
    ///
    /// synapse_gap = wait(φ_active)
    fn synapse_gap(&self, phi_active: f64) -> f64 {
        // Wait time inversely proportional to activity level
        PHI_GOLDEN / (phi_active + 1e-10)
    }

    /// Queue a signal for delivery
    pub fn send(&mut self, signal: Signal) {
        self.queue.push(signal);
    }

    /// Deliver queued signals
    ///
    /// deliver = route ∘ synapse_gap
    pub fn deliver(&mut self) -> usize {
        let mut delivered_count = 0;
        let mut requeue = Vec::new();
        
        while let Some(mut signal) = self.queue.pop() {
            if let Some(next_hop) = self.route(&signal) {
                let _gap = self.synapse_gap(1.0);
                signal.tau += 0.001; // Increment temporal epoch

                if next_hop == signal.destination {
                    self.delivered.push(signal);
                    delivered_count += 1;
                } else {
                    // Multi-hop: update source and re-queue
                    signal.source = next_hop;
                    requeue.push(signal);
                }
            }
        }
        
        // Re-queue signals that need additional hops
        self.queue.extend(requeue);

        delivered_count
    }

    /// Check if routing is active
    pub fn is_active(&self) -> bool {
        !self.synapses.is_empty()
    }

    /// Initialize default routing mesh
    pub fn init_mesh(&mut self, node_count: usize) {
        // Create ring topology
        for i in 0..node_count {
            let next = (i + 1) % node_count;
            self.add_synapse(i, next, 1.0);
        }
    }
}

impl Default for NeuroMail {
    fn default() -> Self {
        Self::new()
    }
}
