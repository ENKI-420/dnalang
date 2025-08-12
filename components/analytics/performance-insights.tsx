"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, Target, Lightbulb, AlertCircle, CheckCircle, Clock, Zap, Brain } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface PerformanceInsight {
  id: string
  type: "optimization" | "warning" | "recommendation"
  title: string
  description: string
  impact: "high" | "medium" | "low"
  effort: "high" | "medium" | "low"
  category: string
  metrics?: {
    before: number
    after: number
    improvement: number
  }
}

interface Benchmark {
  metric: string
  current: number
  target: number
  industry: number
  trend: "up" | "down" | "stable"
}

export function PerformanceInsights() {
  const [insights, setInsights] = useState<PerformanceInsight[]>([])
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  useEffect(() => {
    // Generate performance insights
    const generatedInsights: PerformanceInsight[] = [
      {
        id: "1",
        type: "optimization",
        title: "Optimize Agent Task Distribution",
        description:
          "Current load balancing algorithm shows 23% efficiency loss. Implementing weighted round-robin could improve throughput.",
        impact: "high",
        effort: "medium",
        category: "performance",
        metrics: {
          before: 67,
          after: 89,
          improvement: 22,
        },
      },
      {
        id: "2",
        type: "warning",
        title: "Memory Usage Trending Upward",
        description:
          "Agent memory consumption has increased 15% over the past week. Consider implementing memory cleanup routines.",
        impact: "medium",
        effort: "low",
        category: "resource",
      },
      {
        id: "3",
        type: "recommendation",
        title: "Enable Predictive Scaling",
        description:
          "Based on usage patterns, implementing predictive scaling could reduce response times by 30% during peak hours.",
        impact: "high",
        effort: "high",
        category: "scalability",
        metrics: {
          before: 250,
          after: 175,
          improvement: 30,
        },
      },
      {
        id: "4",
        type: "optimization",
        title: "Cache Hit Rate Improvement",
        description: "Current cache hit rate is 72%. Optimizing cache eviction policies could increase this to 85%+.",
        impact: "medium",
        effort: "low",
        category: "performance",
        metrics: {
          before: 72,
          after: 87,
          improvement: 15,
        },
      },
      {
        id: "5",
        type: "recommendation",
        title: "Implement Circuit Breaker Pattern",
        description:
          "Adding circuit breakers for external API calls would improve system resilience and reduce cascade failures.",
        impact: "high",
        effort: "medium",
        category: "reliability",
      },
    ]

    const generatedBenchmarks: Benchmark[] = [
      {
        metric: "Response Time",
        current: 145,
        target: 100,
        industry: 120,
        trend: "down",
      },
      {
        metric: "Throughput (req/s)",
        current: 850,
        target: 1000,
        industry: 750,
        trend: "up",
      },
      {
        metric: "Error Rate (%)",
        current: 0.8,
        target: 0.5,
        industry: 1.2,
        trend: "stable",
      },
      {
        metric: "CPU Utilization (%)",
        current: 68,
        target: 70,
        industry: 75,
        trend: "stable",
      },
      {
        metric: "Memory Usage (%)",
        current: 72,
        target: 65,
        industry: 70,
        trend: "up",
      },
    ]

    setInsights(generatedInsights)
    setBenchmarks(generatedBenchmarks)
  }, [])

  const getInsightIcon = (type: PerformanceInsight["type"]) => {
    switch (type) {
      case "optimization":
        return <Zap className="h-4 w-4" />
      case "warning":
        return <AlertCircle className="h-4 w-4" />
      case "recommendation":
        return <Lightbulb className="h-4 w-4" />
    }
  }

  const getInsightColor = (type: PerformanceInsight["type"]) => {
    switch (type) {
      case "optimization":
        return "border-blue-200 bg-blue-50 dark:bg-blue-900/20"
      case "warning":
        return "border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20"
      case "recommendation":
        return "border-green-200 bg-green-50 dark:bg-green-900/20"
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200"
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Target className="h-4 w-4 text-gray-500" />
    }
  }

  const filteredInsights =
    selectedCategory === "all" ? insights : insights.filter((insight) => insight.category === selectedCategory)

  const categories = ["all", ...Array.from(new Set(insights.map((i) => i.category)))]

  return (
    <div className="h-full p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Insights</h2>
          <p className="text-muted-foreground">AI-powered recommendations and optimization opportunities</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            <Brain className="h-3 w-3 mr-1" />
            AI Analysis
          </Badge>
          <Button variant="outline" size="sm">
            Generate Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          {/* Category Filter */}
          <div className="flex space-x-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Insights Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredInsights.map((insight) => (
              <Card key={insight.id} className={`border ${getInsightColor(insight.type)}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {getInsightIcon(insight.type)}
                      <CardTitle className="text-lg">{insight.title}</CardTitle>
                    </div>
                    <div className="flex space-x-1">
                      <Badge variant="outline" className={getEffortColor(insight.effort)}>
                        {insight.effort} effort
                      </Badge>
                      <div
                        className={`w-2 h-2 rounded-full ${getImpactColor(insight.impact)}`}
                        title={`${insight.impact} impact`}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{insight.description}</p>

                  {insight.metrics && (
                    <div className="bg-background/50 rounded-lg p-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Expected Improvement</span>
                        <Badge variant="default">+{insight.metrics.improvement}%</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Current</span>
                          <p className="font-medium">{insight.metrics.before}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Projected</span>
                          <p className="font-medium text-green-600">{insight.metrics.after}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2">
                    <Badge variant="secondary" className="capitalize">
                      {insight.category}
                    </Badge>
                    <Button size="sm" variant="outline">
                      Implement
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {benchmarks.map((benchmark) => (
              <Card key={benchmark.metric}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{benchmark.metric}</CardTitle>
                    {getTrendIcon(benchmark.trend)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Current</span>
                      <span className="font-medium">{benchmark.current}</span>
                    </div>
                    <Progress
                      value={
                        (benchmark.current / Math.max(benchmark.target, benchmark.industry, benchmark.current)) * 100
                      }
                      className="h-2"
                    />

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Target</span>
                        <span className={benchmark.current >= benchmark.target ? "text-green-600" : "text-red-600"}>
                          {benchmark.target}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Industry Avg</span>
                        <span
                          className={benchmark.current <= benchmark.industry ? "text-green-600" : "text-yellow-600"}
                        >
                          {benchmark.industry}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    {benchmark.current >= benchmark.target ? (
                      <div className="flex items-center text-green-600 text-sm">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Target achieved
                      </div>
                    ) : (
                      <div className="flex items-center text-yellow-600 text-sm">
                        <Clock className="h-4 w-4 mr-1" />
                        {(((benchmark.target - benchmark.current) / benchmark.target) * 100).toFixed(1)}% to target
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={benchmarks.map((b, i) => ({
                    name: b.metric,
                    current: b.current,
                    target: b.target,
                    industry: b.industry,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="current" stroke="#3b82f6" name="Current" />
                  <Line type="monotone" dataKey="target" stroke="#22c55e" name="Target" strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="industry" stroke="#f59e0b" name="Industry Avg" strokeDasharray="3 3" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
