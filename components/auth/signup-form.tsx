"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff, Shield, CheckCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"

export function SignUpForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { signUp } = useAuth()

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8
    const hasUpper = /[A-Z]/.test(password)
    const hasLower = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    return {
      minLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
      isValid: minLength && hasUpper && hasLower && hasNumber && hasSpecial,
    }
  }

  const passwordValidation = validatePassword(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (!passwordValidation.isValid) {
      setError("Password does not meet security requirements")
      return
    }

    setLoading(true)

    try {
      const { error } = await signUp(email, password)

      if (error) {
        setError(error.message)
      } else {
        setSuccess("Account created successfully! Please check your email to verify your account.")
      }
    } catch (error) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <p className="text-muted-foreground">Join the quantum chat platform</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>

              {/* Password strength indicator */}
              {password && (
                <div className="space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div
                      className={`flex items-center ${passwordValidation.minLength ? "text-green-600" : "text-red-600"}`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${passwordValidation.minLength ? "bg-green-600" : "bg-red-600"}`}
                      />
                      8+ characters
                    </div>
                    <div
                      className={`flex items-center ${passwordValidation.hasUpper ? "text-green-600" : "text-red-600"}`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${passwordValidation.hasUpper ? "bg-green-600" : "bg-red-600"}`}
                      />
                      Uppercase
                    </div>
                    <div
                      className={`flex items-center ${passwordValidation.hasLower ? "text-green-600" : "text-red-600"}`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${passwordValidation.hasLower ? "bg-green-600" : "bg-red-600"}`}
                      />
                      Lowercase
                    </div>
                    <div
                      className={`flex items-center ${passwordValidation.hasNumber ? "text-green-600" : "text-red-600"}`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${passwordValidation.hasNumber ? "bg-green-600" : "bg-red-600"}`}
                      />
                      Number
                    </div>
                    <div
                      className={`flex items-center ${passwordValidation.hasSpecial ? "text-green-600" : "text-red-600"}`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${passwordValidation.hasSpecial ? "bg-green-600" : "bg-red-600"}`}
                      />
                      Special char
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading || !passwordValidation.isValid}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/auth/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
