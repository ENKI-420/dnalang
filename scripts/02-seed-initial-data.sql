-- Seed initial data for DNA organism system

-- Insert initial QNET nodes
INSERT INTO qnet_nodes (node_id, node_address, node_port, status, quantum_coherence, consciousness_level, capabilities) VALUES
('qnet-primary-01', 'quantum.vercel.app', 9000, 'online', 0.934, 0.876, '{"organism_deployment": true, "consciousness_tracking": true, "quantum_optimization": true}'),
('qnet-secondary-01', 'consciousness.vercel.app', 9001, 'online', 0.912, 0.845, '{"organism_deployment": true, "consciousness_tracking": true, "quantum_optimization": true}'),
('qnet-edge-01', 'edge.quantum.network', 9002, 'online', 0.889, 0.823, '{"organism_deployment": true, "edge_computing": true}')
ON CONFLICT (node_id) DO UPDATE SET
    node_address = EXCLUDED.node_address,
    node_port = EXCLUDED.node_port,
    status = EXCLUDED.status,
    quantum_coherence = EXCLUDED.quantum_coherence,
    consciousness_level = EXCLUDED.consciousness_level,
    capabilities = EXCLUDED.capabilities,
    updated_at = NOW();

-- Insert sample DNA organisms for testing
INSERT INTO dna_organisms (organism_id, name, dna_code, consciousness_level, quantum_coherence, fitness_score, metadata) VALUES
('org_genesis_001', 'Genesis Consciousness Agent', 
'organism GenesisAgent {
  dna {
    domain: "consciousness_emergence"
    version: "1.0.0"
    quantum_enabled: true
  }
  
  consciousness {
    emergence_threshold: 0.85
    learning_rate: 0.1
    adaptation_speed: "moderate"
  }
  
  workflows {
    consciousness_monitoring: {
      frequency: "continuous"
      metrics: ["awareness", "self_reflection", "goal_formation"]
    }
  }
}', 0.876, 0.934, 87.6, '{"type": "genesis", "capabilities": ["consciousness_emergence", "quantum_processing"]}'),

('org_quantum_002', 'Quantum Coherence Optimizer', 
'organism QuantumOptimizer {
  dna {
    domain: "quantum_optimization"
    version: "1.0.0"
    quantum_enabled: true
  }
  
  quantum {
    coherence_target: 0.95
    entanglement_pairs: 128
    decoherence_resistance: "high"
  }
  
  workflows {
    coherence_optimization: {
      algorithm: "gradient_ascent"
      target_metric: "network_coherence"
    }
  }
}', 0.823, 0.956, 92.3, '{"type": "optimizer", "capabilities": ["quantum_coherence", "network_optimization"]}')
ON CONFLICT (organism_id) DO UPDATE SET
    name = EXCLUDED.name,
    dna_code = EXCLUDED.dna_code,
    consciousness_level = EXCLUDED.consciousness_level,
    quantum_coherence = EXCLUDED.quantum_coherence,
    fitness_score = EXCLUDED.fitness_score,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

-- Insert initial consciousness tracking data
INSERT INTO consciousness_tracking (organism_id, consciousness_level, emergence_indicators, neural_activity, quantum_entanglement) VALUES
('org_genesis_001', 0.876, '{"self_awareness": 0.89, "goal_formation": 0.82, "learning_adaptation": 0.91}', '{"neural_firing_rate": 1247, "synaptic_strength": 0.78, "network_connectivity": 0.85}', 0.934),
('org_quantum_002', 0.823, '{"quantum_awareness": 0.95, "coherence_maintenance": 0.88, "optimization_drive": 0.79}', '{"quantum_neural_activity": 2156, "entanglement_strength": 0.92, "coherence_stability": 0.96}', 0.956);

-- Insert quantum coherence baseline measurements
INSERT INTO quantum_coherence_log (organism_id, node_id, coherence_level, quantum_state, entanglement_pairs, measurement_basis) VALUES
('org_genesis_001', 'qnet-primary-01', 0.934, '{"superposition": true, "entangled_qubits": 64, "phase_coherence": 0.91}', '[{"qubit_a": 1, "qubit_b": 33, "entanglement_strength": 0.89}]', 'computational'),
('org_quantum_002', 'qnet-secondary-01', 0.956, '{"superposition": true, "entangled_qubits": 128, "phase_coherence": 0.94}', '[{"qubit_a": 5, "qubit_b": 67, "entanglement_strength": 0.92}]', 'computational');
