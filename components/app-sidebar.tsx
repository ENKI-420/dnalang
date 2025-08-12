"use client"

import { Brain, MessageSquare, Network, Cpu, FileCode, Search, Users, Settings, Sparkles, Command } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import type { ViewType } from "@/app/page"

interface AppSidebarProps {
  activeView: ViewType
  setActiveView: (view: ViewType) => void
}

const navigationItems = [
  {
    title: "Command Center", // Added new command center option
    icon: Command,
    view: "command" as ViewType,
    description: "Quantum AI control hub",
  },
  {
    title: "Multi-Agent Chat",
    icon: MessageSquare,
    view: "chat" as ViewType,
    description: "Interact with AI agents",
  },
  {
    title: "Agent Swarm",
    icon: Network,
    view: "swarm" as ViewType,
    description: "Visualize agent network",
  },
  {
    title: "Cognitive Overlay",
    icon: Brain,
    view: "overlay" as ViewType,
    description: "Personal augmentation",
  },
  {
    title: "Quantum Pipeline",
    icon: Cpu,
    view: "quantum" as ViewType,
    description: "Quantum processing flow",
  },
  {
    title: "Organism Consciousness",
    icon: Sparkles,
    view: "organism-consciousness" as ViewType,
    description: "Monitor living systems",
  },
  {
    title: "Organism Manager",
    icon: FileCode,
    view: "organisms" as ViewType,
    description: "DNALang organisms",
  },
  {
    title: "Knowledge Search",
    icon: Search,
    view: "knowledge" as ViewType,
    description: "Semantic search",
  },
  {
    title: "Collaboration",
    icon: Users,
    view: "collaboration" as ViewType,
    description: "Team workspace",
  },
]

export function AppSidebar({ activeView, setActiveView }: AppSidebarProps) {
  return (
    <Sidebar className="border-r border-border/40">
      <SidebarHeader className="border-b border-border/40">
        <div className="flex items-center space-x-2 px-2 py-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Quantum Swarm</h2>
            <p className="text-xs text-muted-foreground">Bio-Digital OS</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.view}>
                  <SidebarMenuButton
                    onClick={() => setActiveView(item.view)}
                    isActive={activeView === item.view}
                    className="w-full justify-start"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/40">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
