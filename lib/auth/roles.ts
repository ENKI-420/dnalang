import { createClient } from "@/lib/supabase/server"

export type UserRole = "admin" | "user" | "viewer"

export interface UserWithRole {
  id: string
  email: string
  role: UserRole
  permissions: Record<string, boolean>
  created_at: string
  last_sign_in_at?: string
}

export async function getUserRole(userId: string): Promise<UserRole | null> {
  const supabase = createClient()

  const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId).single()

  if (error || !data) return null
  return data.role as UserRole
}

export async function updateUserRole(userId: string, role: UserRole): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from("user_roles")
    .upsert({ user_id: userId, role, updated_at: new Date().toISOString() })

  return !error
}

export async function getAllUsers(): Promise<UserWithRole[]> {
  const supabase = createClient()

  const { data, error } = await supabase.from("user_roles").select(`
      user_id,
      role,
      permissions,
      created_at,
      auth.users!inner(email, last_sign_in_at)
    `)

  if (error || !data) return []

  return data.map((item: any) => ({
    id: item.user_id,
    email: item.auth.users.email,
    role: item.role,
    permissions: item.permissions || {},
    created_at: item.created_at,
    last_sign_in_at: item.auth.users.last_sign_in_at,
  }))
}

export function hasPermission(role: UserRole, permission: string): boolean {
  const permissions = {
    admin: ["read", "write", "delete", "manage_users", "system_admin"],
    user: ["read", "write"],
    viewer: ["read"],
  }

  return permissions[role]?.includes(permission) || false
}
