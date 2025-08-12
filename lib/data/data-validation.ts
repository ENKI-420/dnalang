import { z } from "zod"

// Validation schemas for data integrity
export const ExecutionSchema = z.object({
  user_input: z.string().min(1).max(10000),
  status: z.enum(["running", "completed", "failed", "paused"]),
  result: z.any().optional(),
  overall_score: z.number().min(0).max(100).optional(),
  duration_ms: z.number().positive().optional(),
})

export const ArtifactSchema = z.object({
  artifact_id: z.string().min(1),
  type: z.enum(["code", "document", "image", "data", "model"]),
  content: z.string().min(1),
  language: z.string().optional(),
  file_path: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

export const AssessmentSchema = z.object({
  assessment_id: z.string().min(1),
  type: z.enum(["quality", "performance", "security", "compliance"]),
  score: z.number().min(0).max(100),
  passed: z.boolean(),
  issues: z.array(z.any()).optional(),
  recommendations: z.array(z.any()).optional(),
})

export const TelemetrySchema = z.object({
  circuit_id: z.string().min(1),
  hardware_backend: z.string().min(1),
  error_rate: z.number().min(0).max(1),
  average_gate_fidelity: z.number().min(0).max(1),
  average_circuit_depth: z.number().positive(),
  raw_json: z.record(z.any()),
})

// Validation functions
export function validateExecution(data: unknown) {
  return ExecutionSchema.safeParse(data)
}

export function validateArtifact(data: unknown) {
  return ArtifactSchema.safeParse(data)
}

export function validateAssessment(data: unknown) {
  return AssessmentSchema.safeParse(data)
}

export function validateTelemetry(data: unknown) {
  return TelemetrySchema.safeParse(data)
}
