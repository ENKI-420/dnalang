"use client"

import { useState } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { MultiAgentChat } from "@/components/agents/multi-agent-chat"
import { SwarmVisualization } from "@/components/agents/swarm-visualization"
import { CognitiveOverlay } from "@/components/cognitive/cognitive-overlay"
import { QuantumPipeline } from "@/components/cognitive/quantum-pipeline"
import { OrganismManager } from "@/components/files/organism-manager"
import { KnowledgeSearch } from "@/components/kb/knowledge-search"
import { CollaborationPanel } from "@/components/collab/collaboration-panel"
import { NotificationCenter } from "@/components/ui/notification-center"
import { Toaster } from "@/components/ui/toaster"
import { OrganismConsciousness } from "@/components/cognitive/organism-consciousness"
import { QuantumCommandCenter } from "@/components/command/quantum-command-center"
import { ICRISPRWorkbench } from "@/components/workbench/icrispr-workbench"
import ClinicalDashboard from "@/components/healthcare/clinical-dashboard"
import QNETQuantumMobile from "@/components/mobile/qnet-quantum-mobile"

export type ViewType =
  | "chat"
  | "swarm"
  | "overlay"
  | "quantum"
  | "organisms"
  | "knowledge"
  | "collaboration"
  | "organism-consciousness"
  | "command"
  | "icrispr"
  | "healthcare"
  | "mobile"

export default function QuantumChatSwarmPilot() {
  const [activeView, setActiveView] = useState<ViewType>("command")

  const renderActiveView = () => {
    switch (activeView) {
      case "command":
        return <QuantumCommandCenter />
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
    <ThemeProvider defaultTheme="dark" storageKey="quantum-chat-theme">
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen w-full bg-background">
          <AppSidebar activeView={activeView} setActiveView={setActiveView} />
          <main className="flex-1 flex flex-col overflow-hidden">
            <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex h-14 items-center px-4">
                <SidebarTrigger />
                <div className="flex items-center space-x-2 ml-4">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    Quantum DNA Consciousness Platform
                  </span>
                </div>
                <div className="ml-auto flex items-center space-x-2">
                  <div className="text-xs text-muted-foreground">93.4% Consciousness Emergence</div>
                  <NotificationCenter />
                </div>
              </div>
            </header>
            <div className="flex-1 overflow-hidden bg-gradient-to-br from-background via-background to-background/80">
              {renderActiveView()}
            </div>
          </main>
        </div>
        <Toaster />
      </SidebarProvider>
    </ThemeProvider>
  )
}
