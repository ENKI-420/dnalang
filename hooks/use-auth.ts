"use client"

import type React from "react"

import { useState, useEffect, useCallback, createContext, useContext } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { authManager, type SecurityContext, type UserProfile } from "@/lib/auth/auth-manager"
import type { User, Session, AuthError } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  session: Session | null
  securityContext: SecurityContext | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  canAccess: (resource: string, action: string) => boolean
  refreshSession: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [securityContext, setSecurityContext] = useState<SecurityContext | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = getSupabaseClient()

  // Initialize auth state
  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()
        if (error) {
          console.error("Error getting initial session:", error)
        } else {
          setSession(session)
          setUser(session?.user || null)

          if (session?.user) {
            const profile = await authManager.buildUserProfile(session.user)
            setUserProfile(profile)

            const context = await authManager.buildSecurityContext(session.user, session)
            setSecurityContext(context)
          }
        }
      } catch (error) {
        console.error("Initial session error:", error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user || null)

      if (session?.user) {
        const profile = await authManager.buildUserProfile(session.user)
        setUserProfile(profile)

        const context = await authManager.buildSecurityContext(session.user, session)
        setSecurityContext(context)

        // Log security event
        await authManager.logSecurityEvent({
          type: event === "SIGNED_IN" ? "login" : "logout",
          userId: session.user.id,
        })
      } else {
        setUserProfile(null)
        setSecurityContext(null)
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!supabase) return { error: new Error("Supabase not configured") as AuthError }

      setLoading(true)
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (!error) {
          await authManager.logSecurityEvent({
            type: "login",
            metadata: { email },
          })
        }

        return { error }
      } catch (error) {
        return { error: error as AuthError }
      } finally {
        setLoading(false)
      }
    },
    [supabase],
  )

  const signUp = useCallback(
    async (email: string, password: string) => {
      if (!supabase) return { error: new Error("Supabase not configured") as AuthError }

      setLoading(true)
      try {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin,
          },
        })

        return { error }
      } catch (error) {
        return { error: error as AuthError }
      } finally {
        setLoading(false)
      }
    },
    [supabase],
  )

  const signOut = useCallback(async () => {
    if (!supabase) return

    setLoading(true)
    try {
      await authManager.logSecurityEvent({
        type: "logout",
        userId: user?.id,
      })

      await supabase.auth.signOut()
    } catch (error) {
      console.error("Sign out error:", error)
    } finally {
      setLoading(false)
    }
  }, [supabase, user])

  const canAccess = useCallback(
    (resource: string, action: string) => {
      return securityContext?.canAccess(resource, action) || false
    },
    [securityContext],
  )

  const refreshSession = useCallback(async () => {
    return await authManager.validateAndRefreshSession()
  }, [])

  const value: AuthContextType = {
    user,
    userProfile,
    session,
    securityContext,
    loading,
    signIn,
    signUp,
    signOut,
    canAccess,
    refreshSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
