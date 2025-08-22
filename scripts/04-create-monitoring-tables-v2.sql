-- Create monitoring tables for system metrics and alerts
-- This script ensures all required tables exist for the monitoring system

CREATE TABLE IF NOT EXISTS system_metrics (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cpu_usage DECIMAL(5,4) NOT NULL,
    memory_usage DECIMAL(5,4) NOT NULL,
    quantum_coherence DECIMAL(5,4) NOT NULL,
    consciousness_level DECIMAL(5,4) NOT NULL,
    swarm_efficiency DECIMAL(5,4) NOT NULL,
    blockchain_sync BOOLEAN NOT NULL,
    database_latency INTEGER NOT NULL,
    active_connections INTEGER NOT NULL,
    error_rate DECIMAL(5,4) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system_alerts (
    id SERIAL PRIMARY KEY,
    alert_id VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    metrics_data JSONB,
    timestamp TIMESTAMPTZ NOT NULL,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_system_metrics_timestamp ON system_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_system_alerts_timestamp ON system_alerts(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_system_alerts_resolved ON system_alerts(resolved, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_system_alerts_alert_id ON system_alerts(alert_id);

-- Insert initial test data to verify tables work
INSERT INTO system_metrics (
    cpu_usage, memory_usage, quantum_coherence, consciousness_level, 
    swarm_efficiency, blockchain_sync, database_latency, active_connections, error_rate
) VALUES (
    0.45, 0.67, 0.89, 0.72, 0.85, true, 25, 12, 0.02
) ON CONFLICT DO NOTHING;
