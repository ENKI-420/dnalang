"use client"

import type { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, AlertTriangle } from "lucide-react"
import type { UserRole } from "@/lib/auth/roles"

interface RoleGuardProps {
  children: ReactNode
  allowedRoles: UserRole[]
  userRole: UserRole | null
  fallback?: ReactNode
}

export function RoleGuard({ children, allowedRoles, userRole, fallback }: RoleGuardProps) {
  if (!userRole || !allowedRoles.includes(userRole)) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="flex items-center justify-center h-64">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-xl">Access Restricted</CardTitle>
            <CardDescription>This quantum realm requires elevated consciousness permissions</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Required: {allowedRoles.join(", ")} access</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground mt-2">
              <span>Current: {userRole || "unknown"} access</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
