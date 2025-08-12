export interface Database {
  public: {
    Tables: {
      agent_executions: {
        Row: {
          id: number
          user_input: string
          status: string
          result: any
          overall_score: number | null
          duration_ms: number | null
          iterations: number | null
          assessments_count: number | null
          artifacts_count: number | null
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          user_input: string
          status?: string
          result?: any
          overall_score?: number | null
          duration_ms?: number | null
          iterations?: number | null
          assessments_count?: number | null
          artifacts_count?: number | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          user_input?: string
          status?: string
          result?: any
          overall_score?: number | null
          duration_ms?: number | null
          iterations?: number | null
          assessments_count?: number | null
          artifacts_count?: number | null
          updated_at?: string
          completed_at?: string | null
        }
      }
      agent_artifacts: {
        Row: {
          id: number
          execution_id: number
          artifact_id: string
          type: string
          content: string
          language: string | null
          file_path: string | null
          metadata: any
          created_at: string
          updated_at: string
        }
        Insert: {
          execution_id: number
          artifact_id: string
          type: string
          content: string
          language?: string | null
          file_path?: string | null
          metadata?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          execution_id?: number
          artifact_id?: string
          type?: string
          content?: string
          language?: string | null
          file_path?: string | null
          metadata?: any
          updated_at?: string
        }
      }
      agent_assessments: {
        Row: {
          id: number
          execution_id: number
          assessment_id: string
          type: string
          score: number
          passed: boolean
          issues: any
          recommendations: any
          created_at: string
          updated_at: string
        }
        Insert: {
          execution_id: number
          assessment_id: string
          type: string
          score: number
          passed: boolean
          issues?: any
          recommendations?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          execution_id?: number
          assessment_id?: string
          type?: string
          score?: number
          passed?: boolean
          issues?: any
          recommendations?: any
          updated_at?: string
        }
      }
      vector_memories: {
        Row: {
          id: string
          content: string
          embedding: any
          metadata: any
          created_at: string
          updated_at: string
        }
        Insert: {
          content: string
          embedding: any
          metadata?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          content?: string
          embedding?: any
          metadata?: any
          updated_at?: string
        }
      }
      telemetry_data: {
        Row: {
          id: string
          circuit_id: string
          hardware_backend: string
          error_rate: number
          average_gate_fidelity: number
          average_circuit_depth: number
          raw_json: any
          timestamp: string
          created_at: string
        }
        Insert: {
          circuit_id: string
          hardware_backend: string
          error_rate: number
          average_gate_fidelity: number
          average_circuit_depth: number
          raw_json: any
          timestamp?: string
          created_at?: string
        }
        Update: {
          circuit_id?: string
          hardware_backend?: string
          error_rate?: number
          average_gate_fidelity?: number
          average_circuit_depth?: number
          raw_json?: any
          timestamp?: string
        }
      }
    }
  }
}
