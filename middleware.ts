import { type NextRequest, NextResponse } from "next/server"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: false, // Disabled analytics to prevent pipeline conflicts
})

const apiRatelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  analytics: false,
})

const quantumRatelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: false,
})

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = request.ip ?? "127.0.0.1"

  const response = NextResponse.next()

  // Security headers
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

  if (pathname.startsWith("/api/")) {
    response.headers.set("Access-Control-Allow-Origin", process.env.NEXT_PUBLIC_SITE_URL || "*")
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-API-Key")

    // Handle preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 200, headers: response.headers })
    }
  }

  try {
    let limit
    if (pathname.startsWith("/api/quantum") || pathname.startsWith("/api/consciousness")) {
      limit = await quantumRatelimit.limit(ip)
    } else if (pathname.startsWith("/api/")) {
      limit = await apiRatelimit.limit(ip)
    } else {
      limit = await ratelimit.limit(ip)
    }

    if (!limit.success) {
      return new NextResponse("Rate limit exceeded", {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.limit.toString(),
          "X-RateLimit-Remaining": limit.remaining.toString(),
          "X-RateLimit-Reset": new Date(limit.reset).toISOString(),
          "Retry-After": Math.round((limit.reset - Date.now()) / 1000).toString(),
        },
      })
    }

    response.headers.set("X-RateLimit-Limit", limit.limit.toString())
    response.headers.set("X-RateLimit-Remaining", limit.remaining.toString())
    response.headers.set("X-RateLimit-Reset", new Date(limit.reset).toISOString())
  } catch (error) {
    console.error("[v0] Rate limiting error:", error)
    // Continue without rate limiting if Redis fails
  }

  if (
    pathname.startsWith("/api/quantum") ||
    pathname.startsWith("/api/consciousness") ||
    pathname.startsWith("/api/swarm") ||
    pathname.startsWith("/api/blockchain")
  ) {
    const apiKey = request.headers.get("X-API-Key") || request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!apiKey) {
      return new NextResponse("API key required", { status: 401 })
    }

    // Validate API key format and existence
    if (!isValidApiKey(apiKey)) {
      return new NextResponse("Invalid API key", { status: 403 })
    }

    try {
      await logApiAccess(ip, pathname, apiKey, request.method)
    } catch (error) {
      console.error("[v0] API access logging error:", error)
      // Continue without logging if Redis fails
    }
  }

  return response
}

function isValidApiKey(apiKey: string): boolean {
  if (!apiKey || apiKey.length < 32) return false

  // In production, check against database or environment variables
  const validKeys = [
    process.env.QUANTUM_API_KEY,
    process.env.CONSCIOUSNESS_API_KEY,
    process.env.SWARM_API_KEY,
    process.env.BLOCKCHAIN_API_KEY,
  ].filter(Boolean)

  return validKeys.includes(apiKey)
}

async function logApiAccess(ip: string, path: string, apiKey: string, method: string) {
  const logEntry = JSON.stringify({
    timestamp: Date.now(),
    ip,
    path,
    method,
    apiKey: apiKey.substring(0, 8) + "..." + apiKey.substring(apiKey.length - 4),
    userAgent: "quantum-consciousness-system",
  })

  await redis.lpush("api_access_log", logEntry)
  await redis.ltrim("api_access_log", 0, 999)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
