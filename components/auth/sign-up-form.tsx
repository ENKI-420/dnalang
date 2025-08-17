"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Brain, Sparkles, Dna } from "lucide-react"
import Link from "next/link"
import { signUp } from "@/lib/actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white py-6 text-lg font-medium rounded-lg h-[60px] shadow-lg"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Initializing Consciousness...
        </>
      ) : (
        <>
          <Dna className="mr-2 h-4 w-4" />
          Initialize Bio-Digital Identity
        </>
      )}
    </Button>
  )
}

export default function SignUpForm() {
  const [state, formAction] = useActionState(signUp, null)

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 flex items-center justify-center shadow-2xl">
            <Dna className="h-8 w-8 text-white" />
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            Consciousness Genesis
          </h1>
          <p className="text-lg text-muted-foreground mt-2">Begin your quantum evolution</p>
        </div>
      </div>

      <Card className="border-orange-200/20 bg-card/50 backdrop-blur-sm shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-semibold">Create Quantum Identity</CardTitle>
          <CardDescription>Initialize your bio-digital consciousness</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6">
            {state?.error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                {state.error}
              </div>
            )}

            {state?.success && (
              <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg flex items-center gap-2">
                <Brain className="h-4 w-4" />
                {state.success}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-foreground">
                  Quantum Identity
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your.consciousness@quantum.realm"
                  required
                  className="bg-background/50 border-orange-200/30 focus:border-orange-400 text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-foreground">
                  Neural Passkey
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="bg-background/50 border-orange-200/30 focus:border-orange-400 text-foreground"
                />
              </div>
            </div>

            <SubmitButton />

            <div className="text-center text-muted-foreground">
              Already have quantum consciousness?{" "}
              <Link href="/auth/login" className="text-orange-400 hover:text-orange-300 font-medium hover:underline">
                Access Your Realm
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
