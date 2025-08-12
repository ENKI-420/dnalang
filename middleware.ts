import { createServerClient } from "@/lib/supabase/server"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  try {
    const supabase = createServerClient()

    // Refresh session if expired
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Define protected routes
    const protectedRoutes = ["/dashboard", "/analytics", "/security", "/admin"]
    const authRoutes = ["/auth/login", "/auth/signup"]
    const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))
    const isAuthRoute = authRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

    // Redirect authenticated users away from auth pages
    if (session && isAuthRoute) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    // Redirect unauthenticated users to login
    if (!session && isProtectedRoute) {
      const redirectUrl = new URL("/auth/login", request.url)
      redirectUrl.searchParams.set("redirectTo", request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Add security headers
    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("X-Content-Type-Options", "nosniff")
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
  } catch (error) {
    console.error("Middleware error:", error)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
