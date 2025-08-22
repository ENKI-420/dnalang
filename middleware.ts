import { type NextRequest, NextResponse } from "next/server"

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

    if (!isValidApiKey(apiKey)) {
      return new NextResponse("Invalid API key", { status: 403 })
    }
  }

  return response
}

function isValidApiKey(apiKey: string): boolean {
  if (!apiKey || apiKey.length < 32) return false

  // In production, check against environment variables
  const validKeys = [
    process.env.QUANTUM_API_KEY,
    process.env.CONSCIOUSNESS_API_KEY,
    process.env.SWARM_API_KEY,
    process.env.BLOCKCHAIN_API_KEY,
  ].filter(Boolean)

  return validKeys.includes(apiKey)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
