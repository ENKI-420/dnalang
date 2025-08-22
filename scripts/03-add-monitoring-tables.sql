-- Add monitoring tables for system metrics and alerts
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
    alert_id VARCHAR(100) NOT NULL,
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
