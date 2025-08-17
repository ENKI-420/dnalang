"use client"

import React from "react"

import { useState, useEffect, useMemo, useCallback, Suspense, lazy } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { NotificationCenter } from "@/components/ui/notification-center"
import { Toaster } from "@/components/ui/toaster"
import { UserProfile } from "@/components/auth/user-profile"
import { createClient } from "@/lib/supabase/client"
import { getUserRole } from "@/lib/auth/roles"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Lightbulb, Loader2, Sparkles, Zap, Activity, Heart } from "lucide-react"
import { usePerformance } from "@/hooks/use-performance"
import type { User } from "@supabase/supabase-js"
import type { UserRole } from "@/lib/auth/roles"

const MultiAgentChat = lazy(() =>
  import("@/components/agents/multi-agent-chat").then((m) => ({ default: m.MultiAgentChat })),
)
const SwarmVisualization = lazy(() =>
  import("@/components/agents/swarm-visualization").then((m) => ({ default: m.SwarmVisualization })),
)
const CognitiveOverlay = lazy(() =>
  import("@/components/cognitive/cognitive-overlay").then((m) => ({ default: m.CognitiveOverlay })),
)
const QuantumPipeline = lazy(() =>
  import("@/components/cognitive/quantum-pipeline").then((m) => ({ default: m.QuantumPipeline })),
)
const OrganismManager = lazy(() =>
  import("@/components/files/organism-manager").then((m) => ({ default: m.OrganismManager })),
)
const KnowledgeSearch = lazy(() =>
  import("@/components/kb/knowledge-search").then((m) => ({ default: m.KnowledgeSearch })),
)
const CollaborationPanel = lazy(() =>
  import("@/components/collab/collaboration-panel").then((m) => ({ default: m.CollaborationPanel })),
)
const OrganismConsciousness = lazy(() =>
  import("@/components/cognitive/organism-consciousness").then((m) => ({ default: m.OrganismConsciousness })),
)
const QuantumCommandCenter = lazy(() =>
  import("@/components/command/quantum-command-center").then((m) => ({ default: m.QuantumCommandCenter })),
)
const ICRISPRWorkbench = lazy(() =>
  import("@/components/workbench/icrispr-workbench").then((m) => ({ default: m.ICRISPRWorkbench })),
)
const ClinicalDashboard = lazy(() => import("@/components/healthcare/clinical-dashboard"))
const QNETQuantumMobile = lazy(() => import("@/components/mobile/qnet-quantum-mobile"))
const UserManagement = lazy(() =>
  import("@/components/admin/user-management").then((m) => ({ default: m.UserManagement })),
)
const AnalyticsDashboard = lazy(() =>
  import("@/components/analytics/analytics-dashboard").then((m) => ({ default: m.AnalyticsDashboard })),
)
const QuantumProcessor = lazy(() =>
  import("@/components/quantum/quantum-processor").then((m) => ({ default: m.QuantumProcessor })),
)
const QuantumHardwareInterface = lazy(() =>
  import("@/components/quantum/quantum-hardware-interface").then((m) => ({ default: m.QuantumHardwareInterface })),
)

export type ViewType =
  | "chat"
  | "swarm"
  | "overlay"
  | "quantum"
  | "quantum-processor"
  | "quantum-hardware"
  | "organisms"
  | "knowledge"
  | "collaboration"
  | "organism-consciousness"
  | "command"
  | "icrispr"
  | "healthcare"
  | "mobile"
  | "admin"
  | "analytics"

const QuantumSkeletonLoader = () => (
  <div className="flex h-full items-center justify-center p-8 page-transition">
    <div className="text-center space-y-8 max-w-lg">
      <div className="relative">
        <div className="h-20 w-20 rounded-full quantum-gradient-primary flex items-center justify-center shadow-2xl mx-auto glass-morphism premium-card">
          <div className="h-10 w-10 rounded-full bg-white/30 dna-helix-rotate" />
        </div>
        <div className="absolute inset-0 h-20 w-20 rounded-full border-2 border-primary/20 mx-auto quantum-pulse" />
        <div className="absolute -inset-4 h-28 w-28 rounded-full border border-primary/10 mx-auto neural-network-pulse" />
      </div>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Quantum Systems Initializing
        </h2>
        <div className="space-y-3">
          <div className="h-4 bg-muted rounded-full skeleton w-3/4 mx-auto" />
          <div className="h-3 bg-muted rounded-full skeleton w-1/2 mx-auto" />
          <div className="h-3 bg-muted rounded-full skeleton w-2/3 mx-auto" />
        </div>
      </div>
      <div className="flex items-center justify-center space-x-3 text-sm text-muted-foreground">
        <Activity className="h-4 w-4 neural-network-pulse text-primary" />
        <span className="font-medium">Calibrating consciousness protocols...</span>
      </div>
      <div className="w-full max-w-xs mx-auto">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full progress-indicator-quantum w-2/3 animate-pulse" />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>Loading...</span>
          <span>67%</span>
        </div>
      </div>
    </div>
  </div>
)

const ComponentLoader = () => (
  <div className="flex h-full items-center justify-center page-transition">
    <div className="text-center space-y-6">
      <div className="relative">
        <div className="h-12 w-12 rounded-full quantum-gradient-primary flex items-center justify-center mx-auto glass-morphism premium-card">
          <Loader2 className="h-6 w-6 animate-spin text-white" />
        </div>
        <div className="absolute inset-0 h-12 w-12 rounded-full border border-primary/20 mx-auto quantum-pulse" />
      </div>
      <div className="space-y-2">
        <p className="text-lg font-semibold text-foreground">Loading Component</p>
        <p className="text-sm text-muted-foreground">Preparing quantum interface...</p>
      </div>
      <div className="w-48 mx-auto">
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full progress-indicator-consciousness w-1/2 animate-pulse" />
        </div>
      </div>
    </div>
  </div>
)

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[v0] Component error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex h-full items-center justify-center">
            <div className="text-center space-y-4">
              <div className="text-red-500 text-lg font-semibold">Something went wrong</div>
              <p className="text-muted-foreground">Please refresh the page or try again later.</p>
              <Button onClick={() => window.location.reload()}>Refresh Page</Button>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}

export default function QuantumChatSwarmPilot() {
  const [activeView, setActiveView] = useState<ViewType>("command")
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const { measureApiCall, getCached, setCached, optimizePerformance } = usePerformance()

  const workflowSuggestions = useMemo(
    () => ({
      command: { next: "quantum-hardware" as ViewType, reason: "Execute on real quantum hardware" },
      "quantum-processor": { next: "quantum-hardware" as ViewType, reason: "Deploy to IBM Quantum backends" },
      "quantum-hardware": { next: "analytics" as ViewType, reason: "Analyze quantum execution results" },
      chat: { next: "analytics" as ViewType, reason: "Review conversation insights" },
      icrispr: { next: "organisms" as ViewType, reason: "Deploy your DNA organisms" },
      organisms: { next: "organism-consciousness" as ViewType, reason: "Monitor organism behavior" },
      healthcare: { next: "analytics" as ViewType, reason: "Analyze clinical performance" },
      analytics: { next: "command" as ViewType, reason: "Optimize system settings" },
      knowledge: { next: "collaboration" as ViewType, reason: "Share findings with team" },
      collaboration: { next: "analytics" as ViewType, reason: "Track team productivity" },
      swarm: { next: "command" as ViewType, reason: "Adjust network parameters" },
      "organism-consciousness": { next: "command" as ViewType, reason: "Review system health" },
      quantum: { next: "quantum-hardware" as ViewType, reason: "Execute on real hardware" },
      overlay: { next: "chat" as ViewType, reason: "Apply insights to conversations" },
      mobile: { next: "command" as ViewType, reason: "Return to main interface" },
      admin: { next: "analytics" as ViewType, reason: "Review system usage" },
    }),
    [],
  )

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const supabase = createClient()

        // Check cache first
        const cachedSession = getCached("user_session")
        if (cachedSession && Date.now() - cachedSession.timestamp < 300000) {
          // 5 min cache
          setUser(cachedSession.user)
          setUserRole(cachedSession.role)
          setLoading(false)
          return
        }

        const {
          data: { session },
          error,
        } = await measureApiCall("auth_session", () => supabase.auth.getSession())

        if (error) {
          setAuthError(error.message)
          setLoading(false)
          return
        }

        setUser(session?.user ?? null)

        if (session?.user) {
          const role = await measureApiCall("user_role", () => getUserRole(session.user.id))
          setUserRole(role)

          // Cache the session
          setCached(
            "user_session",
            {
              user: session.user,
              role,
              timestamp: Date.now(),
            },
            300,
          ) // 5 minutes

          const hasSeenOnboarding = localStorage.getItem("quantum-platform-onboarding")
          if (!hasSeenOnboarding) {
            setShowOnboarding(true)
          }
        }

        setLoading(false)
      } catch (error) {
        console.error("[v0] Auth initialization error:", error)
        setAuthError("Failed to initialize authentication")
        setLoading(false)
      }
    }

    initializeAuth()

    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)

      if (session?.user) {
        const role = await getUserRole(session.user.id)
        setUserRole(role)

        // Update cache
        setCached(
          "user_session",
          {
            user: session.user,
            role,
            timestamp: Date.now(),
          },
          300,
        )
      } else {
        setUserRole(null)
        // Clear cache
        setCached("user_session", null)
      }
    })

    return () => subscription.unsubscribe()
  }, [measureApiCall, getCached, setCached])

  const handleViewChange = useCallback(
    (view: ViewType) => {
      setActiveView(view)

      // Preload next suggested component
      const suggestion = workflowSuggestions[view]
      if (suggestion) {
        // Trigger preload of next component
        setTimeout(() => {
          import(`@/components/${getComponentPath(suggestion.next)}`)
        }, 1000)
      }
    },
    [workflowSuggestions],
  )

  const getComponentPath = (view: ViewType): string => {
    const paths: Record<ViewType, string> = {
      command: "command/quantum-command-center",
      "quantum-processor": "quantum/quantum-processor",
      "quantum-hardware": "quantum/quantum-hardware-interface",
      admin: "admin/user-management",
      analytics: "analytics/analytics-dashboard",
      chat: "agents/multi-agent-chat",
      swarm: "agents/swarm-visualization",
      overlay: "cognitive/cognitive-overlay",
      quantum: "cognitive/quantum-pipeline",
      "organism-consciousness": "cognitive/organism-consciousness",
      organisms: "files/organism-manager",
      knowledge: "kb/knowledge-search",
      collaboration: "collab/collaboration-panel",
      icrispr: "workbench/icrispr-workbench",
      healthcare: "healthcare/clinical-dashboard",
      mobile: "mobile/qnet-quantum-mobile",
    }
    return paths[view] || "command/quantum-command-center"
  }

  const handleCompleteOnboarding = useCallback(() => {
    localStorage.setItem("quantum-platform-onboarding", "completed")
    setShowOnboarding(false)
    optimizePerformance() // Optimize after onboarding
  }, [optimizePerformance])

  const renderActiveView = useCallback(() => {
    const ViewComponent = () => {
      switch (activeView) {
        case "command":
          return <QuantumCommandCenter />
        case "quantum-processor":
          return <QuantumProcessor />
        case "quantum-hardware":
          return <QuantumHardwareInterface />
        case "admin":
          return <UserManagement />
        case "analytics":
          return <AnalyticsDashboard />
        case "chat":
          return <MultiAgentChat />
        case "swarm":
          return <SwarmVisualization />
        case "overlay":
          return <CognitiveOverlay />
        case "quantum":
          return <QuantumPipeline />
        case "organism-consciousness":
          return <OrganismConsciousness />
        case "organisms":
          return <OrganismManager />
        case "knowledge":
          return <KnowledgeSearch />
        case "collaboration":
          return <CollaborationPanel />
        case "icrispr":
          return <ICRISPRWorkbench />
        case "healthcare":
          return <ClinicalDashboard />
        case "mobile":
          return <QNETQuantumMobile />
        default:
          return <QuantumCommandCenter />
      }
    }

    return (
      <ErrorBoundary>
        <Suspense fallback={<ComponentLoader />}>
          <ViewComponent />
        </Suspense>
      </ErrorBoundary>
    )
  }, [activeView])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-background via-card/50 to-background">
        <div className="text-center space-y-8 max-w-lg mx-4">
          <div className="relative">
            <div className="h-24 w-24 rounded-full quantum-gradient-primary flex items-center justify-center mx-auto glass-morphism shadow-2xl premium-card">
              <div className="h-12 w-12 rounded-full bg-white/30 dna-helix-rotate" />
            </div>
            <div className="absolute inset-0 h-24 w-24 rounded-full border-2 border-primary/30 mx-auto quantum-pulse" />
            <div className="absolute -inset-2 h-28 w-28 rounded-full border border-primary/10 mx-auto neural-network-pulse" />
          </div>
          <div className="space-y-4">
            <div className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Quantum DNA Platform
            </div>
            <div className="text-base text-muted-foreground font-medium">
              Initializing bio-digital consciousness systems...
            </div>
          </div>
          <div className="space-y-4 w-full max-w-sm mx-auto">
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div className="h-full progress-indicator-quantum w-3/4 animate-pulse" />
            </div>
            <div className="flex items-center justify-center space-x-3 text-sm text-muted-foreground">
              <Heart className="h-4 w-4 neural-network-pulse text-primary" />
              <span className="font-medium">Optimizing neural pathways...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (authError) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-destructive/10 via-background to-destructive/5">
        <div className="text-center space-y-8 max-w-md mx-4 p-8 glass-morphism rounded-xl border border-destructive/20 shadow-2xl premium-card">
          <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto border border-destructive/20">
            <Zap className="h-10 w-10 text-destructive" />
          </div>
          <div className="space-y-3">
            <div className="text-2xl font-bold text-destructive">Authentication Error</div>
            <p className="text-muted-foreground leading-relaxed">{authError}</p>
          </div>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="interactive-element focus-ring quantum-button"
            size="lg"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Retry Connection
          </Button>
        </div>
      </div>
    )
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="quantum-chat-theme">
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen w-full bg-background">
          <AppSidebar activeView={activeView} setActiveView={handleViewChange} userRole={userRole} />
          <main className="flex-1 flex flex-col overflow-hidden">
            <header className="border-b border-border/20 glass-morphism supports-[backdrop-filter]:bg-card/30 backdrop-blur-xl">
              <div className="flex h-16 items-center px-6">
                <SidebarTrigger className="interactive-element focus-ring" />
                <div className="flex items-center space-x-4 ml-6">
                  <div className="h-3 w-3 rounded-full bg-primary quantum-pulse consciousness-indicator" />
                  <div className="flex flex-col">
                    <span className="text-lg font-bold quantum-gradient-primary bg-clip-text text-transparent">
                      Quantum DNA Platform
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">Bio-Digital Computing System</span>
                  </div>
                </div>
                <div className="ml-auto flex items-center space-x-4">
                  {(() => {
                    const suggestion = workflowSuggestions[activeView]
                    return suggestion ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewChange(suggestion.next)}
                        className="hidden md:flex items-center space-x-2 text-xs interactive-element glass-morphism focus-ring card-hover"
                      >
                        <Lightbulb className="h-3 w-3 neural-network-pulse" />
                        <span>Next: {suggestion.reason}</span>
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    ) : null
                  })()}

                  <div className="flex items-center space-x-2 px-4 py-2 rounded-full glass-morphism border border-primary/20 interactive-element premium-card">
                    <div className="h-2 w-2 rounded-full bg-primary quantum-pulse" />
                    <span className="text-sm font-semibold text-primary">System Active</span>
                  </div>
                  <NotificationCenter />
                  {user && <UserProfile user={user} userRole={userRole} />}
                </div>
              </div>
            </header>

            {showOnboarding && (
              <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-md">
                <div className="glass-morphism p-8 rounded-xl shadow-2xl max-w-lg mx-4 border border-primary/20 animate-in fade-in-0 zoom-in-95 duration-500 premium-card">
                  <div className="text-center mb-8">
                    <div className="h-16 w-16 rounded-full quantum-gradient-primary flex items-center justify-center mx-auto mb-6 shadow-lg premium-card">
                      <Sparkles className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      Welcome to Quantum Platform
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Start with the Command Center for system overview, then explore specific tools based on your
                      workflow needs.
                    </p>
                  </div>
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center space-x-4 p-3 rounded-lg glass-morphism card-hover">
                      <Badge
                        variant="outline"
                        className="bg-green-500/10 text-green-600 border-green-500/20 font-semibold"
                      >
                        Essential
                      </Badge>
                      <span className="text-sm font-medium">Command Center, Chat, Analytics</span>
                    </div>
                    <div className="flex items-center space-x-4 p-3 rounded-lg glass-morphism card-hover">
                      <Badge
                        variant="outline"
                        className="bg-blue-500/10 text-blue-600 border-blue-500/20 font-semibold"
                      >
                        Development
                      </Badge>
                      <span className="text-sm font-medium">iCRISPR Workbench, Organism Manager</span>
                    </div>
                    <div className="flex items-center space-x-4 p-3 rounded-lg glass-morphism card-hover">
                      <Badge
                        variant="outline"
                        className="bg-purple-500/10 text-purple-600 border-purple-500/20 font-semibold"
                      >
                        Applications
                      </Badge>
                      <span className="text-sm font-medium">Healthcare, Collaboration</span>
                    </div>
                  </div>
                  <Button
                    onClick={handleCompleteOnboarding}
                    className="w-full interactive-element focus-ring quantum-button"
                    size="lg"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Get Started
                  </Button>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-hidden bg-gradient-to-br from-background via-card/20 to-background relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/2 via-transparent to-accent/2 pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(347_77%_50%_/_0.03)_0%,transparent_50%)] pointer-events-none" />
              <div className="relative z-10 h-full page-transition">
                <Suspense fallback={<QuantumSkeletonLoader />}>{renderActiveView()}</Suspense>
              </div>
            </div>
          </main>
        </div>
        <Toaster />
      </SidebarProvider>
    </ThemeProvider>
  )
}
