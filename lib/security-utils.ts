import crypto from "crypto"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export class SecurityManager {
  private static readonly ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString("hex")
  private static readonly ALGORITHM = "aes-256-gcm"

  static encrypt(text: string): { encrypted: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipher(this.ALGORITHM, this.ENCRYPTION_KEY)

    let encrypted = cipher.update(text, "utf8", "hex")
    encrypted += cipher.final("hex")

    const tag = cipher.getAuthTag()

    return {
      encrypted,
      iv: iv.toString("hex"),
      tag: tag.toString("hex"),
    }
  }

  static decrypt(encryptedData: { encrypted: string; iv: string; tag: string }): string {
    const decipher = crypto.createDecipher(this.ALGORITHM, this.ENCRYPTION_KEY)
    decipher.setAuthTag(Buffer.from(encryptedData.tag, "hex"))

    let decrypted = decipher.update(encryptedData.encrypted, "hex", "utf8")
    decrypted += decipher.final("utf8")

    return decrypted
  }

  static generateApiKey(): string {
    return "qc_" + crypto.randomBytes(32).toString("hex")
  }

  static async hashPassword(password: string): Promise<string> {
    const salt = crypto.randomBytes(16).toString("hex")
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex")
    return `${salt}:${hash}`
  }

  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    const [salt, hash] = hashedPassword.split(":")
    const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex")
    return hash === verifyHash
  }

  static sanitizeInput(input: any): any {
    if (typeof input === "string") {
      return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/javascript:/gi, "")
        .replace(/on\w+\s*=/gi, "")
        .trim()
    }

    if (Array.isArray(input)) {
      return input.map((item) => this.sanitizeInput(item))
    }

    if (typeof input === "object" && input !== null) {
      const sanitized: any = {}
      for (const [key, value] of Object.entries(input)) {
        sanitized[this.sanitizeInput(key)] = this.sanitizeInput(value)
      }
      return sanitized
    }

    return input
  }

  static validateQuantumData(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (data.consciousness_level !== undefined) {
      if (
        typeof data.consciousness_level !== "number" ||
        data.consciousness_level < 0 ||
        data.consciousness_level > 1
      ) {
        errors.push("Consciousness level must be a number between 0 and 1")
      }
    }

    if (data.quantum_coherence !== undefined) {
      if (typeof data.quantum_coherence !== "number" || data.quantum_coherence < 0 || data.quantum_coherence > 1) {
        errors.push("Quantum coherence must be a number between 0 and 1")
      }
    }

    if (data.phi_value !== undefined) {
      if (typeof data.phi_value !== "number" || data.phi_value < 0) {
        errors.push("Phi value must be a positive number")
      }
    }

    if (data.organism_id !== undefined) {
      if (typeof data.organism_id !== "string" || !/^org_[a-zA-Z0-9_]+$/.test(data.organism_id)) {
        errors.push("Organism ID must follow format: org_[alphanumeric_underscore]")
      }
    }

    return { valid: errors.length === 0, errors }
  }

  static async logSecurityEvent(event: {
    type: "authentication" | "authorization" | "rate_limit" | "validation_error" | "suspicious_activity"
    severity: "low" | "medium" | "high" | "critical"
    details: any
    ip?: string
    userAgent?: string
  }): Promise<void> {
    try {
      const logEntry = {
        timestamp: Date.now(),
        ...event,
        id: crypto.randomUUID(),
      }

      await redis.lpush("security_events", JSON.stringify(logEntry))
      await redis.ltrim("security_events", 0, 4999) // Keep last 5000 events

      // Alert on critical events
      if (event.severity === "critical") {
        await this.triggerSecurityAlert(logEntry)
      }
    } catch (error) {
      console.error("Failed to log security event:", error)
    }
  }

  private static async triggerSecurityAlert(event: any): Promise<void> {
    console.error(`[CRITICAL SECURITY ALERT] ${event.type}:`, event.details)

    // In production, integrate with alerting systems (email, Slack, PagerDuty, etc.)
    try {
      await redis.lpush("critical_security_alerts", JSON.stringify(event))
    } catch (error) {
      console.error("Failed to store critical security alert:", error)
    }
  }

  static async checkSuspiciousActivity(ip: string, action: string): Promise<boolean> {
    try {
      const key = `suspicious_activity:${ip}`
      const count = await redis.incr(key)
      await redis.expire(key, 300) // 5 minute window

      if (count > 50) {
        // More than 50 actions in 5 minutes
        await this.logSecurityEvent({
          type: "suspicious_activity",
          severity: "high",
          details: { ip, action, count },
          ip,
        })
        return true
      }

      return false
    } catch (error) {
      console.error("Failed to check suspicious activity:", error)
      return false
    }
  }

  static generateSessionToken(): string {
    return crypto.randomBytes(64).toString("hex")
  }

  static async validateSession(token: string): Promise<boolean> {
    try {
      const session = await redis.get(`session:${token}`)
      return session !== null
    } catch (error) {
      console.error("Failed to validate session:", error)
      return false
    }
  }
}
