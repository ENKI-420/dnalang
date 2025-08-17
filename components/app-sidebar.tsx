"use client"

import {
  Brain,
  MessageSquare,
  Network,
  Cpu,
  FileCode,
  Search,
  Users,
  Settings,
  Sparkles,
  Command,
  Dna,
  Heart,
  Smartphone,
  Shield,
  BarChart3,
  HelpCircle,
  BookOpen,
} from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import type { ViewType } from "@/app/page"

interface AppSidebarProps {
  activeView: ViewType
  setActiveView: (view: ViewType) => void
  userRole?: string
}

const navigationGroups = [
  {
    label: "Core Operations",
    items: [
      {
        title: "Command Center",
        icon: Command,
        view: "command" as ViewType,
        description: "System overview and control",
        priority: "high",
      },
      {
        title: "Multi-Agent Chat",
        icon: MessageSquare,
        view: "chat" as ViewType,
        description: "Interact with AI agents",
        priority: "high",
      },
      {
        title: "Analytics Dashboard",
        icon: BarChart3,
        view: "analytics" as ViewType,
        description: "Performance insights",
        priority: "medium",
      },
    ],
  },
  {
    label: "Development Tools",
    items: [
      {
        title: "iCRISPR Workbench",
        icon: Dna,
        view: "icrispr" as ViewType,
        description: "DNA organism development",
        priority: "high",
      },
      {
        title: "Organism Manager",
        icon: FileCode,
        view: "organisms" as ViewType,
        description: "Manage DNA organisms",
        priority: "medium",
      },
      {
        title: "Knowledge Search",
        icon: Search,
        view: "knowledge" as ViewType,
        description: "Research and documentation",
        priority: "medium",
      },
    ],
  },
  {
    label: "Monitoring & Analysis",
    items: [
      {
        title: "Agent Swarm",
        icon: Network,
        view: "swarm" as ViewType,
        description: "Network visualization",
        priority: "medium",
      },
      {
        title: "Organism Consciousness",
        icon: Sparkles,
        view: "organism-consciousness" as ViewType,
        description: "Consciousness monitoring",
        priority: "medium",
      },
      {
        title: "Quantum Pipeline",
        icon: Cpu,
        view: "quantum" as ViewType,
        description: "Processing pipeline",
        priority: "low",
      },
    ],
  },
  {
    label: "Applications",
    items: [
      {
        title: "Healthcare Dashboard",
        icon: Heart,
        view: "healthcare" as ViewType,
        description: "Clinical applications",
        priority: "high",
      },
      {
        title: "Collaboration Panel",
        icon: Users,
        view: "collaboration" as ViewType,
        description: "Team workspace",
        priority: "medium",
      },
      {
        title: "Mobile Interface",
        icon: Smartphone,
        view: "mobile" as ViewType,
        description: "Mobile access",
        priority: "low",
      },
    ],
  },
  {
    label: "Advanced Features",
    items: [
      {
        title: "Cognitive Overlay",
        icon: Brain,
        view: "overlay" as ViewType,
        description: "Personal augmentation",
        priority: "low",
      },
    ],
  },
  {
    label: "Administration",
    items: [
      {
        title: "User Management",
        icon: Shield,
        view: "admin" as ViewType,
        description: "System administration",
        adminOnly: true,
        priority: "high",
      },
    ],
  },
]

export function AppSidebar({ activeView, setActiveView, userRole }: AppSidebarProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-green-500/10 text-green-600 border-green-500/20"
      case "medium":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
      case "low":
        return "bg-gray-500/10 text-gray-600 border-gray-500/20"
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20"
    }
  }

  const getWorkflowSuggestion = (currentView: ViewType) => {
    const suggestions: Record<ViewType, string> = {
      command: "Start here for system overview, then explore specific tools",
      chat: "Interact with agents, then check Analytics for insights",
      icrispr: "Develop organisms, then use Organism Manager to deploy",
      healthcare: "Clinical workflows - check Analytics for performance",
      analytics: "Review metrics, then optimize in Command Center",
      organisms: "Manage deployments, monitor in Consciousness view",
      knowledge: "Research topics, then collaborate with team",
      collaboration: "Team coordination, share insights from Analytics",
      swarm: "Network analysis, optimize in Command Center",
      "organism-consciousness": "Monitor systems, troubleshoot in Command Center",
      quantum: "Advanced processing, monitor in Analytics",
      overlay: "Personal tools, integrate with main workflows",
      mobile: "Mobile access to core features",
      admin: "System management and user administration",
    }
    return suggestions[currentView] || "Explore the platform features"
  }

  return (
    <Sidebar className="border-r border-border/40">
      <SidebarHeader className="border-b border-border/40">
        <div className="flex items-center space-x-2 px-2 py-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Quantum Platform</h2>
            <p className="text-xs text-muted-foreground">Bio-Digital Computing</p>
          </div>
        </div>

        <div className="px-2 py-2 bg-muted/30 rounded-lg mx-2 mb-2">
          <div className="flex items-center space-x-1 mb-1">
            <HelpCircle className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Workflow Guide</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{getWorkflowSuggestion(activeView)}</p>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {navigationGroups.map((group) => {
          const filteredItems = group.items.filter((item) => !item.adminOnly || userRole === "admin")

          if (filteredItems.length === 0) return null

          return (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel className="flex items-center justify-between">
                {group.label}
                {group.label === "Core Operations" && (
                  <Badge variant="outline" className="text-xs">
                    Essential
                  </Badge>
                )}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filteredItems.map((item) => (
                    <SidebarMenuItem key={item.view}>
                      <SidebarMenuButton
                        onClick={() => setActiveView(item.view)}
                        isActive={activeView === item.view}
                        className="w-full justify-start group"
                      >
                        <div className="flex items-center space-x-2 flex-1">
                          <item.icon className="h-4 w-4" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">{item.title}</span>
                              {item.priority && (
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    item.priority === "high"
                                      ? "bg-green-500"
                                      : item.priority === "medium"
                                        ? "bg-yellow-500"
                                        : "bg-gray-400"
                                  }`}
                                />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground group-hover:text-foreground/70 transition-colors">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )
        })}
      </SidebarContent>

      <SidebarFooter className="border-t border-border/40">
        <div className="px-2 py-2">
          <div className="text-xs text-muted-foreground mb-2">Quick Actions</div>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton className="text-xs">
                <BookOpen className="h-3 w-3" />
                <span>Documentation</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton className="text-xs">
                <Settings className="h-3 w-3" />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
