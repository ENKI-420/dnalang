"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Video, MessageCircle, Share, Settings, UserPlus } from "lucide-react"

interface TeamMember {
  id: string
  name: string
  role: string
  status: "online" | "away" | "offline"
  avatar?: string
  currentTask?: string
}

interface CollaborationSession {
  id: string
  name: string
  participants: string[]
  type: "quantum-research" | "swarm-development" | "organism-design"
  status: "active" | "scheduled" | "completed"
  startTime: Date
  duration: number
}

export function CollaborationPanel() {
  const [teamMembers] = useState<TeamMember[]>([
    {
      id: "1",
      name: "Dr. Sarah Chen",
      role: "Quantum Researcher",
      status: "online",
      currentTask: "Optimizing entanglement protocols",
    },
    {
      id: "2",
      name: "Marcus Rodriguez",
      role: "Swarm Engineer",
      status: "online",
      currentTask: "Agent coordination algorithms",
    },
    {
      id: "3",
      name: "Elena Vasquez",
      role: "Bio-Digital Specialist",
      status: "away",
      currentTask: "Neural interface calibration",
    },
    {
      id: "4",
      name: "Dr. James Park",
      role: "Compliance Officer",
      status: "offline",
      currentTask: "DARPA OT review",
    },
  ])

  const [sessions] = useState<CollaborationSession[]>([
    {
      id: "1",
      name: "Quantum Pipeline Optimization",
      participants: ["1", "2"],
      type: "quantum-research",
      status: "active",
      startTime: new Date(),
      duration: 45,
    },
    {
      id: "2",
      name: "Swarm Intelligence Review",
      participants: ["2", "3"],
      type: "swarm-development",
      status: "scheduled",
      startTime: new Date(Date.now() + 3600000),
      duration: 60,
    },
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "away":
        return "bg-yellow-500"
      case "offline":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case "quantum-research":
        return "bg-blue-500"
      case "swarm-development":
        return "bg-purple-500"
      case "organism-design":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="h-full p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Collaboration Hub</h2>
          <p className="text-muted-foreground">Real-time co-editing, presence, and team coordination</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Invite
          </Button>
          <Button size="sm">
            <Video className="h-4 w-4 mr-2" />
            Start Session
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
        {/* Main Collaboration Area */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="sessions" className="h-full">
            <TabsList>
              <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
              <TabsTrigger value="shared">Shared Workspace</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="sessions" className="h-[calc(100%-3rem)]">
              <div className="space-y-4">
                {sessions.map((session) => (
                  <Card key={session.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${getSessionTypeColor(session.type)}`}>
                            <Users className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{session.name}</CardTitle>
                            <p className="text-sm text-muted-foreground capitalize">{session.type.replace("-", " ")}</p>
                          </div>
                        </div>
                        <Badge
                          variant={session.status === "active" ? "default" : "secondary"}
                          className={session.status === "active" ? "bg-green-500" : ""}
                        >
                          {session.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">Participants:</span>
                          <div className="flex -space-x-2">
                            {session.participants.map((participantId) => {
                              const member = teamMembers.find((m) => m.id === participantId)
                              return (
                                <Avatar key={participantId} className="h-6 w-6 border-2 border-background">
                                  <AvatarFallback className="text-xs">
                                    {member?.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                              )
                            })}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Chat
                          </Button>
                          <Button variant="outline" size="sm">
                            <Share className="h-4 w-4 mr-2" />
                            Share
                          </Button>
                          {session.status === "active" && (
                            <Button size="sm">
                              <Video className="h-4 w-4 mr-2" />
                              Join
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="shared" className="h-[calc(100%-3rem)]">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-sm">Shared Workspace</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Share className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Collaborative Editing</h3>
                    <p className="text-muted-foreground mb-4">
                      Real-time collaborative editing of organisms and documents
                    </p>
                    <Button>
                      <Share className="h-4 w-4 mr-2" />
                      Create Shared Document
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="h-[calc(100%-3rem)]">
              <ScrollArea className="h-full">
                <div className="space-y-3">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Bio-Digital Interface Design</h4>
                          <p className="text-sm text-muted-foreground">Completed 2 hours ago</p>
                        </div>
                        <Badge variant="outline">Completed</Badge>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Quantum Algorithm Review</h4>
                          <p className="text-sm text-muted-foreground">Completed yesterday</p>
                        </div>
                        <Badge variant="outline">Completed</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Team Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Team Members
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-64">
                <div className="space-y-3 p-4">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="text-xs">
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background ${getStatusColor(member.status)}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{member.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{member.role}</p>
                        {member.currentTask && (
                          <p className="text-xs text-muted-foreground truncate">{member.currentTask}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                <Video className="h-4 w-4 mr-2" />
                Start Video Call
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                <MessageCircle className="h-4 w-4 mr-2" />
                Team Chat
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                <Share className="h-4 w-4 mr-2" />
                Share Screen
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Presence Indicators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span>Online - Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                  <span>Away - In Meeting</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-gray-500" />
                  <span>Offline</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
