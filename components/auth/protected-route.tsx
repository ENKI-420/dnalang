"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermissions?: string[]
  requiredRole?: string
  fallbackPath?: string
}

export function ProtectedRoute({
  children,
  requiredPermissions = [],
  requiredRole,
  fallbackPath = "/auth/login",
}: ProtectedRouteProps) {
  const { user, userProfile, loading, canAccess } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(fallbackPath)
        return
      }

      // Check role requirement
      if (requiredRole && userProfile?.role !== requiredRole) {
        router.push("/unauthorized")
        return
      }

      // Check permission requirements
      if (requiredPermissions.length > 0) {
        const hasAllPermissions = requiredPermissions.every((permission) => {
          const [action, resource] = permission.split(":")
          return canAccess(resource, action)
        })

        if (!hasAllPermissions) {
          router.push("/unauthorized")
          return
        }
      }
    }
  }, [user, userProfile, loading, requiredPermissions, requiredRole, router, canAccess, fallbackPath])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return <>{children}</>
}
