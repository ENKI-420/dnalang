import { createServerClient } from "@/lib/supabase/server"
import { getSupabaseClient } from "@/lib/supabase/client"
import type { User, Session } from "@supabase/supabase-js"

export interface UserProfile {
  id: string
  email: string
  name?: string
  role: "admin" | "user" | "agent" | "viewer"
  permissions: string[]
  lastLogin?: Date
  isActive: boolean
  securityLevel: "low" | "medium" | "high" | "critical"
}

export interface SecurityContext {
  user: UserProfile | null
  session: Session | null
  permissions: string[]
  securityLevel: string
  isAuthenticated: boolean
  canAccess: (resource: string, action: string) => boolean
}

export class AuthManager {
  private static instance: AuthManager
  private securityContext: SecurityContext | null = null

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager()
    }
    return AuthManager.instance
  }

  // Server-side authentication
  async getServerSession(): Promise<{ user: User | null; session: Session | null }> {
    const supabase = createServerClient()

    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()
      if (error) {
        console.error("Error getting session:", error)
        return { user: null, session: null }
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError) {
        console.error("Error getting user:", userError)
        return { user: null, session }
      }

      return { user, session }
    } catch (error) {
      console.error("Server auth error:", error)
      return { user: null, session: null }
    }
  }

  // Client-side authentication
  async getClientSession(): Promise<{ user: User | null; session: Session | null }> {
    const supabase = getSupabaseClient()
    if (!supabase) return { user: null, session: null }

    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()
      if (error) {
        console.error("Error getting client session:", error)
        return { user: null, session: null }
      }

      return { user: session?.user || null, session }
    } catch (error) {
      console.error("Client auth error:", error)
      return { user: null, session: null }
    }
  }

  // Build user profile with security context
  async buildUserProfile(user: User): Promise<UserProfile> {
    // In production, this would fetch from user_profiles table
    const profile: UserProfile = {
      id: user.id,
      email: user.email || "",
      name: user.user_metadata?.name || user.email?.split("@")[0],
      role: this.determineUserRole(user),
      permissions: this.getUserPermissions(user),
      lastLogin: new Date(),
      isActive: true,
      securityLevel: this.determineSecurityLevel(user),
    }

    return profile
  }

  // Role-based access control
  private determineUserRole(user: User): UserProfile["role"] {
    // Check user metadata or database for role
    const role = user.user_metadata?.role || user.app_metadata?.role

    if (role === "admin") return "admin"
    if (role === "agent") return "agent"
    if (role === "viewer") return "viewer"

    return "user" // default role
  }

  private getUserPermissions(user: User): string[] {
    const role = this.determineUserRole(user)

    const rolePermissions = {
      admin: [
        "read:all",
        "write:all",
        "delete:all",
        "manage:users",
        "manage:agents",
        "view:analytics",
        "manage:security",
      ],
      user: ["read:own", "write:own", "create:tasks", "view:agents", "interact:chat"],
      agent: ["read:tasks", "write:tasks", "execute:tasks", "report:metrics"],
      viewer: ["read:public", "view:dashboard"],
    }

    return rolePermissions[role] || []
  }

  private determineSecurityLevel(user: User): UserProfile["securityLevel"] {
    const role = this.determineUserRole(user)

    if (role === "admin") return "critical"
    if (role === "agent") return "high"
    if (role === "user") return "medium"

    return "low"
  }

  // Build complete security context
  async buildSecurityContext(user: User | null, session: Session | null): Promise<SecurityContext> {
    if (!user || !session) {
      return {
        user: null,
        session: null,
        permissions: [],
        securityLevel: "low",
        isAuthenticated: false,
        canAccess: () => false,
      }
    }

    const userProfile = await this.buildUserProfile(user)

    return {
      user: userProfile,
      session,
      permissions: userProfile.permissions,
      securityLevel: userProfile.securityLevel,
      isAuthenticated: true,
      canAccess: (resource: string, action: string) => {
        return this.checkPermission(userProfile.permissions, resource, action)
      },
    }
  }

  // Permission checking logic
  private checkPermission(permissions: string[], resource: string, action: string): boolean {
    // Check for wildcard permissions
    if (permissions.includes(`${action}:all`)) return true
    if (permissions.includes("*:all")) return true

    // Check for specific resource permission
    if (permissions.includes(`${action}:${resource}`)) return true

    // Check for resource category permissions
    const resourceCategory = resource.split(":")[0]
    if (permissions.includes(`${action}:${resourceCategory}`)) return true

    return false
  }

  // Security event logging
  async logSecurityEvent(event: {
    type: "login" | "logout" | "access_denied" | "permission_check" | "security_violation"
    userId?: string
    resource?: string
    action?: string
    metadata?: any
    ipAddress?: string
    userAgent?: string
  }) {
    // In production, this would write to audit log table
    console.log("Security Event:", {
      ...event,
      timestamp: new Date().toISOString(),
    })

    // Store in database for audit trail
    try {
      const supabase = getSupabaseClient()
      if (supabase) {
        await supabase.from("security_audit_log").insert({
          event_type: event.type,
          user_id: event.userId,
          resource: event.resource,
          action: event.action,
          metadata: event.metadata,
          ip_address: event.ipAddress,
          user_agent: event.userAgent,
          timestamp: new Date().toISOString(),
        })
      }
    } catch (error) {
      console.error("Failed to log security event:", error)
    }
  }

  // Session validation and refresh
  async validateAndRefreshSession(): Promise<boolean> {
    const supabase = getSupabaseClient()
    if (!supabase) return false

    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()
      if (error || !session) return false

      // Check if session is close to expiry (within 5 minutes)
      const expiresAt = new Date(session.expires_at! * 1000)
      const now = new Date()
      const fiveMinutes = 5 * 60 * 1000

      if (expiresAt.getTime() - now.getTime() < fiveMinutes) {
        const { error: refreshError } = await supabase.auth.refreshSession()
        if (refreshError) {
          console.error("Failed to refresh session:", refreshError)
          return false
        }
      }

      return true
    } catch (error) {
      console.error("Session validation error:", error)
      return false
    }
  }
}

// Singleton instance
export const authManager = AuthManager.getInstance()
