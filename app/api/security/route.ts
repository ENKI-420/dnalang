import { type NextRequest, NextResponse } from "next/server"
import { SecurityManager } from "@/lib/security-utils"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    switch (type) {
      case "events":
        return await getSecurityEvents()
      case "alerts":
        return await getCriticalAlerts()
      case "stats":
        return await getSecurityStats()
      default:
        return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch security data" }, { status: 500 })
  }
}

async function getSecurityEvents() {
  const events = await redis.lrange("security_events", 0, 49) // Last 50 events
  const parsedEvents = events.map((event) => JSON.parse(event))

  return NextResponse.json({ events: parsedEvents })
}

async function getCriticalAlerts() {
  const alerts = await redis.lrange("critical_security_alerts", 0, 19) // Last 20 alerts
  const parsedAlerts = alerts.map((alert) => JSON.parse(alert))

  return NextResponse.json({ alerts: parsedAlerts })
}

async function getSecurityStats() {
  const events = await redis.lrange("security_events", 0, 999) // Last 1000 events
  const parsedEvents = events.map((event) => JSON.parse(event))

  const stats = {
    total_events: parsedEvents.length,
    events_by_type: {},
    events_by_severity: {},
    recent_activity: parsedEvents.slice(0, 10),
  }

  parsedEvents.forEach((event) => {
    stats.events_by_type[event.type] = (stats.events_by_type[event.type] || 0) + 1
    stats.events_by_severity[event.severity] = (stats.events_by_severity[event.severity] || 0) + 1
  })

  return NextResponse.json({ stats })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = SecurityManager.sanitizeInput(body)

    switch (action) {
      case "create_user":
        return await createUser(data)
      case "revoke_api_key":
        return await revokeApiKey(data.api_key)
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ error: "Security operation failed" }, { status: 500 })
  }
}

async function createUser(data: { username: string; password: string }) {
  const { username, password } = data

  if (!username || !password || password.length < 8) {
    return NextResponse.json({ error: "Invalid username or password" }, { status: 400 })
  }

  const existingUser = await redis.get(`user:${username}:password`)
  if (existingUser) {
    return NextResponse.json({ error: "User already exists" }, { status: 409 })
  }

  const hashedPassword = await SecurityManager.hashPassword(password)
  await redis.set(`user:${username}:password`, hashedPassword)

  await SecurityManager.logSecurityEvent({
    type: "authentication",
    severity: "low",
    details: { username, action: "user_created" },
  })

  return NextResponse.json({ success: true, message: "User created successfully" })
}

async function revokeApiKey(apiKey: string) {
  const deleted = await redis.del(`api_key:${apiKey}`)

  if (deleted) {
    await SecurityManager.logSecurityEvent({
      type: "authorization",
      severity: "low",
      details: { action: "api_key_revoked" },
    })

    return NextResponse.json({ success: true, message: "API key revoked" })
  } else {
    return NextResponse.json({ error: "API key not found" }, { status: 404 })
  }
}
