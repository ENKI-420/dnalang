"use client"

import React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Pause, Zap, Brain, Bot, Shield, Code, Plus, Activity } from "lucide-react"
import { useAgentOrchestration } from "@/hooks/use-agent-orchestration"

export function SwarmVisualization() {
  const { agents, tasks, metrics, taskQueue, submitNLPTask, submitQuantumTask, submitSwarmTask, submitComplianceTask } =
    useAgentOrchestration()

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isRunning, setIsRunning] = useState(true)
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)

  const getAgentIcon = (type: string) => {
    const icons = {
      nlp: Brain,
      quantum: Zap,
      swarm: Bot,
      compliance: Shield,
      copilot: Code,
      analytics: Activity,
      security: Shield,
    }
    return icons[type as keyof typeof icons] || Bot
  }

  const getAgentColor = (type: string, status: string) => {
    const baseColors = {
      nlp: "#3b82f6",
      quantum: "#8b5cf6",
      swarm: "#10b981",
      compliance: "#f59e0b",
      copilot: "#6366f1",
      analytics: "#ec4899",
      security: "#ef4444",
    }

    const color = baseColors[type as keyof typeof baseColors] || "#64748b"

    // Adjust opacity based on status
    switch (status) {
      case "idle":
        return color + "80"
      case "busy":
        return color
      case "overloaded":
        return color + "CC"
      case "offline":
        return "#64748b"
      default:
        return color
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "idle":
        return "bg-green-500"
      case "busy":
        return "bg-blue-500"
      case "overloaded":
        return "bg-red-500"
      case "offline":
        return "bg-gray-500"
      case "maintenance":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const drawVisualization = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw connections between agents
    agents.forEach((agent) => {
      agent.connections.forEach((connectionId) => {
        const targetAgent = agents.find((a) => a.id === connectionId)
        if (targetAgent) {
          ctx.beginPath()
          ctx.moveTo(agent.location.x, agent.location.y)
          ctx.lineTo(targetAgent.location.x, targetAgent.location.y)

          // Connection strength based on shared tasks
          const sharedTasks = agent.currentTasks.filter((taskId) => targetAgent.currentTasks.includes(taskId)).length

          ctx.strokeStyle = sharedTasks > 0 ? "#22c55e" : "#374151"
          ctx.lineWidth = Math.max(1, sharedTasks * 2)
          ctx.stroke()

          // Draw data flow animation for active connections
          if (isRunning && sharedTasks > 0) {
            const progress = (Date.now() / 1000) % 1
            const x = agent.location.x + (targetAgent.location.x - agent.location.x) * progress
            const y = agent.location.y + (targetAgent.location.y - agent.location.y) * progress

            ctx.beginPath()
            ctx.arc(x, y, 3, 0, 2 * Math.PI)
            ctx.fillStyle = "#22c55e"
            ctx.fill()
          }
        }
      })
    })

    // Draw agents
    agents.forEach((agent) => {
      const isSelected = selectedAgent === agent.id
      const baseRadius = 20
      const activityRadius = baseRadius + agent.currentTasks.length * 3

      // Agent circle
      ctx.beginPath()
      ctx.arc(agent.location.x, agent.location.y, activityRadius, 0, 2 * Math.PI)
      ctx.fillStyle = getAgentColor(agent.capabilities[0].type, agent.status)
      ctx.fill()

      // Selection ring
      if (isSelected) {
        ctx.beginPath()
        ctx.arc(agent.location.x, agent.location.y, activityRadius + 5, 0, 2 * Math.PI)
        ctx.strokeStyle = "#ffffff"
        ctx.lineWidth = 2
        ctx.stroke()
      }

      // Performance ring
      if (agent.status === "busy" || agent.status === "overloaded") {
        ctx.beginPath()
        ctx.arc(agent.location.x, agent.location.y, activityRadius + 8, 0, 2 * Math.PI * agent.performance.efficiency)
        ctx.strokeStyle = agent.performance.efficiency > 0.8 ? "#22c55e" : "#f59e0b"
        ctx.lineWidth = 3
        ctx.stroke()
      }

      // Task count indicator
      if (agent.currentTasks.length > 0) {
        ctx.fillStyle = "#ffffff"
        ctx.font = "12px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(agent.currentTasks.length.toString(), agent.location.x, agent.location.y + 3)
      }

      // Agent label
      ctx.fillStyle = "#ffffff"
      ctx.font = "10px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(agent.name, agent.location.x, agent.location.y + activityRadius + 15)
    })
  }

  useEffect(() => {
    if (isRunning) {
      drawVisualization()
    }
  }, [agents, isRunning, selectedAgent])

  useEffect(() => {
    const interval = setInterval(() => {
      if (isRunning) {
        drawVisualization()
      }
    }, 100)

    return () => clearInterval(interval)
  }, [isRunning])

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Find clicked agent
    const clickedAgent = agents.find((agent) => {
      const distance = Math.sqrt(Math.pow(x - agent.location.x, 2) + Math.pow(y - agent.location.y, 2))
      return distance <= 30
    })

    setSelectedAgent(clickedAgent ? clickedAgent.id : null)
  }

  const selectedAgentData = selectedAgent ? agents.find((a) => a.id === selectedAgent) : null

  return (
    <div className="h-full p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Advanced Agent Orchestration</h2>
          <p className="text-muted-foreground">Intelligent swarm coordination with dynamic task distribution</p>
        </div>
        <div className="flex space-x-2">
          <Button variant={isRunning ? "default" : "outline"} size="sm" onClick={() => setIsRunning(!isRunning)}>
            {isRunning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isRunning ? "Pause" : "Resume"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => submitNLPTask("Analyze system performance")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardContent className="p-6 h-full">
              <canvas
                ref={canvasRef}
                width={700}
                height={500}
                className="w-full h-full border border-border rounded-lg bg-background cursor-pointer"
                onClick={handleCanvasClick}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 overflow-y-auto">
          <Tabs defaultValue="metrics" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="agents">Agents</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
            </TabsList>

            <TabsContent value="metrics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">System Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>System Load</span>
                      <span>{(metrics.systemLoad * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={metrics.systemLoad * 100} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Agent Utilization</span>
                      <span>{(metrics.agentUtilization * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={metrics.agentUtilization * 100} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Network Efficiency</span>
                      <span>{(metrics.networkEfficiency * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={metrics.networkEfficiency * 100} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Task Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Tasks</span>
                    <Badge variant="default">{metrics.totalTasks}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Completed</span>
                    <Badge variant="secondary">{metrics.completedTasks}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Failed</span>
                    <Badge variant="destructive">{metrics.failedTasks}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Queue Length</span>
                    <Badge variant="outline">{metrics.queueLength}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Avg Time</span>
                    <span className="text-sm">{(metrics.averageTaskTime / 1000).toFixed(1)}s</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="agents" className="space-y-4">
              {selectedAgentData && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center">
                      {React.createElement(getAgentIcon(selectedAgentData.capabilities[0].type), {
                        className: "h-4 w-4 mr-2",
                      })}
                      {selectedAgentData.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className={`h-2 w-2 rounded-full ${getStatusColor(selectedAgentData.status)}`} />
                      <span className="text-sm capitalize">{selectedAgentData.status}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Success Rate</span>
                        <span>{(selectedAgentData.performance.successRate * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Efficiency</span>
                        <span>{(selectedAgentData.performance.efficiency * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tasks Completed</span>
                        <span>{selectedAgentData.performance.tasksCompleted}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Current Load</span>
                        <span>{selectedAgentData.currentTasks.length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Agent Types</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Array.from(new Set(agents.map((a) => a.capabilities[0].type))).map((type) => {
                    const typeAgents = agents.filter((a) => a.capabilities[0].type === type)
                    const activeCount = typeAgents.filter(
                      (a) => a.status === "busy" || a.status === "overloaded",
                    ).length

                    return (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getAgentColor(type, "busy").slice(0, 7) }}
                          />
                          <span className="text-sm capitalize">{type}</span>
                        </div>
                        <div className="flex space-x-1">
                          <Badge variant="outline" className="text-xs">
                            {activeCount}/{typeAgents.length}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Task Queue</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 max-h-40 overflow-y-auto">
                  {taskQueue.slice(0, 5).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div>
                        <p className="text-xs font-medium">{task.type}</p>
                        <p className="text-xs text-muted-foreground">Priority: {task.priority}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {task.complexity}/10
                      </Badge>
                    </div>
                  ))}
                  {taskQueue.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No tasks in queue</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button size="sm" className="w-full" onClick={() => submitNLPTask("Process user feedback", "high")}>
                    Submit NLP Task
                  </Button>
                  <Button size="sm" className="w-full" onClick={() => submitQuantumTask("Optimize routing", "medium")}>
                    Submit Quantum Task
                  </Button>
                  <Button size="sm" className="w-full" onClick={() => submitSwarmTask("Coordinate agents", "low")}>
                    Submit Swarm Task
                  </Button>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => submitComplianceTask("Security audit", "critical")}
                  >
                    Submit Compliance Task
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
