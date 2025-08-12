"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Brain, Target, Zap, Shield, TrendingUp, Activity } from "lucide-react"

interface CognitiveMetric {
  id: string
  name: string
  value: number
  target: number
  trend: "up" | "down" | "stable"
  category: "focus" | "memory" | "processing" | "creativity"
}

interface Goal {
  id: string
  title: string
  description: string
  progress: number
  priority: "high" | "medium" | "low"
  status: "active" | "completed" | "paused"
}

export function CognitiveOverlay() {
  const [metrics, setMetrics] = useState<CognitiveMetric[]>([
    { id: "1", name: "Focus Intensity", value: 87, target: 90, trend: "up", category: "focus" },
    { id: "2", name: "Memory Coherence", value: 92, target: 95, trend: "stable", category: "memory" },
    { id: "3", name: "Processing Speed", value: 78, target: 85, trend: "up", category: "processing" },
    { id: "4", name: "Creative Flow", value: 65, target: 80, trend: "down", category: "creativity" },
  ])

  const [goals, setGoals] = useState<Goal[]>([
    {
      id: "1",
      title: "Quantum Algorithm Optimization",
      description: "Enhance quantum processing efficiency by 15%",
      progress: 73,
      priority: "high",
      status: "active",
    },
    {
      id: "2",
      title: "Swarm Intelligence Integration",
      description: "Implement distributed decision-making protocols",
      progress: 45,
      priority: "medium",
      status: "active",
    },
    {
      id: "3",
      title: "Bio-Digital Interface Calibration",
      description: "Fine-tune neural-digital synchronization",
      progress: 89,
      priority: "high",
      status: "active",
    },
  ])

  const [augmentationLevel, setAugmentationLevel] = useState(78)

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) =>
        prev.map((metric) => ({
          ...metric,
          value: Math.max(0, Math.min(100, metric.value + (Math.random() - 0.5) * 3)),
        })),
      )

      setAugmentationLevel((prev) => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 2)))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "focus":
        return Target
      case "memory":
        return Brain
      case "processing":
        return Zap
      case "creativity":
        return Activity
      default:
        return Brain
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "focus":
        return "text-blue-500"
      case "memory":
        return "text-purple-500"
      case "processing":
        return "text-green-500"
      case "creativity":
        return "text-orange-500"
      default:
        return "text-gray-500"
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return "↗"
      case "down":
        return "↘"
      case "stable":
        return "→"
      default:
        return "→"
    }
  }

  return (
    <div className="h-full p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Cognitive Overlay Dashboard</h2>
          <p className="text-muted-foreground">Personal augmentation and goal tracking system</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Augmentation Level</p>
            <p className="text-2xl font-bold text-primary">{augmentationLevel.toFixed(1)}%</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Brain className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const IconComponent = getCategoryIcon(metric.category)
          return (
            <Card key={metric.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                  <IconComponent className={`h-4 w-4 ${getCategoryColor(metric.category)}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{metric.value.toFixed(0)}%</span>
                    <span className="text-sm text-muted-foreground">
                      {getTrendIcon(metric.trend)} Target: {metric.target}%
                    </span>
                  </div>
                  <Progress value={metric.value} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Active Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {goals.map((goal) => (
                <div key={goal.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{goal.title}</h4>
                      <Badge
                        variant={
                          goal.priority === "high"
                            ? "destructive"
                            : goal.priority === "medium"
                              ? "default"
                              : "secondary"
                        }
                        className="text-xs"
                      >
                        {goal.priority}
                      </Badge>
                    </div>
                    <span className="text-sm font-medium">{goal.progress}%</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{goal.description}</p>
                  <Progress value={goal.progress} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Neural Sync</span>
                <Badge variant="default" className="bg-green-500">
                  Online
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Quantum Link</span>
                <Badge variant="default" className="bg-blue-500">
                  Stable
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Swarm Network</span>
                <Badge variant="default" className="bg-purple-500">
                  Active
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Bio-Digital Bridge</span>
                <Badge variant="secondary">Calibrating</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Performance Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">
                <p className="text-muted-foreground">Peak Performance Window</p>
                <p className="font-medium">2:00 PM - 4:30 PM</p>
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground">Optimal Focus Duration</p>
                <p className="font-medium">47 minutes</p>
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground">Recovery Time Needed</p>
                <p className="font-medium">12 minutes</p>
              </div>
            </CardContent>
          </Card>

          <Button className="w-full">
            <Zap className="h-4 w-4 mr-2" />
            Initiate Cognitive Boost
          </Button>
        </div>
      </div>
    </div>
  )
}
