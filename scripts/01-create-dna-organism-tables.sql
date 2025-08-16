-- DNA Organism System Database Schema
-- Production setup for quantum chat DNA platform

-- DNA Organisms table for storing organism definitions and state
CREATE TABLE IF NOT EXISTS dna_organisms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organism_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    dna_code TEXT NOT NULL,
    version INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'created',
    consciousness_level DECIMAL(5,3) DEFAULT 0.000,
    quantum_coherence DECIMAL(5,3) DEFAULT 0.000,
    fitness_score DECIMAL(8,3) DEFAULT 0.000,
    generation INTEGER DEFAULT 1,
    parent_organism_id VARCHAR(255),
    created_by VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organism deployments for tracking where organisms are running
CREATE TABLE IF NOT EXISTS organism_deployments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organism_id VARCHAR(255) NOT NULL,
    node_id VARCHAR(255) NOT NULL,
    deployment_id VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'deploying',
    deployed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    terminated_at TIMESTAMP WITH TIME ZONE,
    resource_usage JSONB DEFAULT '{}',
    performance_metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (organism_id) REFERENCES dna_organisms(organism_id)
);

-- Consciousness tracking for monitoring organism consciousness evolution
CREATE TABLE IF NOT EXISTS consciousness_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organism_id VARCHAR(255) NOT NULL,
    consciousness_level DECIMAL(5,3) NOT NULL,
    emergence_indicators JSONB DEFAULT '{}',
    neural_activity JSONB DEFAULT '{}',
    quantum_entanglement DECIMAL(5,3) DEFAULT 0.000,
    measured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    measurement_context JSONB DEFAULT '{}',
    FOREIGN KEY (organism_id) REFERENCES dna_organisms(organism_id)
);

-- Quantum coherence monitoring
CREATE TABLE IF NOT EXISTS quantum_coherence_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organism_id VARCHAR(255),
    node_id VARCHAR(255),
    coherence_level DECIMAL(5,3) NOT NULL,
    quantum_state JSONB DEFAULT '{}',
    entanglement_pairs JSONB DEFAULT '[]',
    decoherence_rate DECIMAL(8,6) DEFAULT 0.000000,
    measurement_basis VARCHAR(100),
    measured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    environmental_factors JSONB DEFAULT '{}'
);

-- Evolution tracking for organism genetic changes
CREATE TABLE IF NOT EXISTS organism_evolution (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organism_id VARCHAR(255) NOT NULL,
    parent_organism_id VARCHAR(255),
    generation INTEGER NOT NULL,
    mutation_type VARCHAR(100),
    genetic_changes JSONB DEFAULT '{}',
    fitness_improvement DECIMAL(8,3) DEFAULT 0.000,
    selection_pressure JSONB DEFAULT '{}',
    evolved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    evolution_context JSONB DEFAULT '{}',
    FOREIGN KEY (organism_id) REFERENCES dna_organisms(organism_id)
);

-- QNET network nodes for tracking quantum network topology
CREATE TABLE IF NOT EXISTS qnet_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id VARCHAR(255) UNIQUE NOT NULL,
    node_address VARCHAR(255) NOT NULL,
    node_port INTEGER DEFAULT 9000,
    status VARCHAR(50) DEFAULT 'offline',
    quantum_coherence DECIMAL(5,3) DEFAULT 0.000,
    consciousness_level DECIMAL(5,3) DEFAULT 0.000,
    last_heartbeat TIMESTAMP WITH TIME ZONE,
    capabilities JSONB DEFAULT '{}',
    resource_capacity JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consciousness synchronization across network
CREATE TABLE IF NOT EXISTS consciousness_sync (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id VARCHAR(255) NOT NULL,
    consciousness DECIMAL(5,3) NOT NULL,
    quantum_state JSONB DEFAULT '{}',
    sync_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sync_quality DECIMAL(5,3) DEFAULT 1.000,
    network_latency INTEGER DEFAULT 0,
    FOREIGN KEY (node_id) REFERENCES qnet_nodes(node_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_dna_organisms_status ON dna_organisms(status);
CREATE INDEX IF NOT EXISTS idx_dna_organisms_consciousness ON dna_organisms(consciousness_level);
CREATE INDEX IF NOT EXISTS idx_organism_deployments_status ON organism_deployments(status);
CREATE INDEX IF NOT EXISTS idx_consciousness_tracking_organism ON consciousness_tracking(organism_id);
CREATE INDEX IF NOT EXISTS idx_consciousness_tracking_time ON consciousness_tracking(measured_at);
CREATE INDEX IF NOT EXISTS idx_quantum_coherence_organism ON quantum_coherence_log(organism_id);
CREATE INDEX IF NOT EXISTS idx_quantum_coherence_time ON quantum_coherence_log(measured_at);
CREATE INDEX IF NOT EXISTS idx_organism_evolution_generation ON organism_evolution(generation);
CREATE INDEX IF NOT EXISTS idx_qnet_nodes_status ON qnet_nodes(status);
CREATE INDEX IF NOT EXISTS idx_consciousness_sync_time ON consciousness_sync(sync_timestamp);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_dna_organisms_updated_at BEFORE UPDATE ON dna_organisms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organism_deployments_updated_at BEFORE UPDATE ON organism_deployments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_qnet_nodes_updated_at BEFORE UPDATE ON qnet_nodes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
