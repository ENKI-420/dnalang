import { type NextRequest, NextResponse } from "next/server"
import { SecurityManager } from "@/lib/security-utils"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const sanitizedBody = SecurityManager.sanitizeInput(body)

    const { action, username, password, apiKey } = sanitizedBody
    const ip = request.ip ?? "127.0.0.1"

    const isSuspicious = await SecurityManager.checkSuspiciousActivity(ip, "auth_attempt")
    if (isSuspicious) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    switch (action) {
      case "login":
        return await handleLogin(username, password, ip)
      case "generate_api_key":
        return await handleApiKeyGeneration(username, password, ip)
      case "validate_api_key":
        return await handleApiKeyValidation(apiKey, ip)
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    await SecurityManager.logSecurityEvent({
      type: "authentication",
      severity: "medium",
      details: { error: error instanceof Error ? error.message : "Unknown error" },
      ip: request.ip,
    })

    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}

async function handleLogin(username: string, password: string, ip: string) {
  const storedPassword = await redis.get(`user:${username}:password`)

  if (!storedPassword || !(await SecurityManager.verifyPassword(password, storedPassword))) {
    await SecurityManager.logSecurityEvent({
      type: "authentication",
      severity: "medium",
      details: { username, reason: "invalid_credentials" },
      ip,
    })

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  }

  const sessionToken = SecurityManager.generateSessionToken()
  await redis.setex(
    `session:${sessionToken}`,
    3600,
    JSON.stringify({
      username,
      ip,
      created_at: Date.now(),
    }),
  )

  await SecurityManager.logSecurityEvent({
    type: "authentication",
    severity: "low",
    details: { username, action: "successful_login" },
    ip,
  })

  return NextResponse.json({
    success: true,
    session_token: sessionToken,
    expires_in: 3600,
  })
}

async function handleApiKeyGeneration(username: string, password: string, ip: string) {
  const storedPassword = await redis.get(`user:${username}:password`)

  if (!storedPassword || !(await SecurityManager.verifyPassword(password, storedPassword))) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  }

  const apiKey = SecurityManager.generateApiKey()
  await redis.setex(
    `api_key:${apiKey}`,
    86400 * 30,
    JSON.stringify({
      // 30 days
      username,
      created_at: Date.now(),
      permissions: ["quantum", "consciousness", "swarm", "blockchain"],
    }),
  )

  await SecurityManager.logSecurityEvent({
    type: "authentication",
    severity: "low",
    details: { username, action: "api_key_generated" },
    ip,
  })

  return NextResponse.json({
    success: true,
    api_key: apiKey,
    expires_in: 86400 * 30,
  })
}

async function handleApiKeyValidation(apiKey: string, ip: string) {
  const keyData = await redis.get(`api_key:${apiKey}`)

  if (!keyData) {
    await SecurityManager.logSecurityEvent({
      type: "authorization",
      severity: "medium",
      details: { reason: "invalid_api_key" },
      ip,
    })

    return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
  }

  const parsedKeyData = JSON.parse(keyData)

  return NextResponse.json({
    valid: true,
    permissions: parsedKeyData.permissions,
    username: parsedKeyData.username,
  })
}
