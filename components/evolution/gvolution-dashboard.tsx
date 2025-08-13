"use client"

// G'volution Evolution Dashboard - Comprehensive evolution monitoring and control
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Dna, Activity, GitBranch, Zap, Target, Play, Settings } from "lucide-react"
import { useGvolution } from "@/hooks/use-gvolution"

export function GvolutionDashboard() {
  const { metrics, evolutionHistory, strategies, populations, isEvolutionActive, initializeEvolution } = useGvolution()
  const [selectedStrategy, setSelectedStrategy] = useState<string>("Adaptive Genetic Algorithm")

  // Prepare chart data
  const fitnessData = evolutionHistory
    .filter((event) => event.type === "mutation" || event.type === "crossover")
    .slice(-20)
    .map((event, index) => ({
      generation: index + 1,
      fitness: event.impact_score,
      type: event.type,
    }))

  const eventTypeData = [
    { name: "Mutations", value: evolutionHistory.filter((e) => e.type === "mutation").length, color: "#8884d8" },
    { name: "Crossovers", value: evolutionHistory.filter((e) => e.type === "crossover").length, color: "#82ca9d" },
    { name: "Selections", value: evolutionHistory.filter((e) => e.type === "selection").length, color: "#ffc658" },
    { name: "Speciations", value: evolutionHistory.filter((e) => e.type === "speciation").length, color: "#ff7300" },
  ]

  const populationData = Array.from(populations.entries()).map(([name, organisms]) => ({
    name,
    size: organisms.length,
    avgFitness: organisms.reduce((sum, org) => sum + (org.state?.fitness || 0), 0) / organisms.length,
  }))

  return (
    <div className="h-full p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Dna className="h-8 w-8 text-purple-500" />
            <h1 className="text-2xl font-bold">G'volution Engine</h1>
          </div>
          <Badge variant="outline" className="bg-purple-500/10">
            Advanced Evolution System
          </Badge>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={initializeEvolution} disabled={isEvolutionActive}>
            <Play className="h-4 w-4 mr-2" />
            {isEvolutionActive ? "Running" : "Start Evolution"}
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Generation</CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.generation}</div>
            <p className="text-xs text-muted-foreground">Current evolution cycle</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Population</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.population_size}</div>
            <p className="text-xs text-muted-foreground">Active organisms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Fitness</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.best_fitness * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Peak performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Diversity</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.diversity_index * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Genetic variation</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="populations">Populations</TabsTrigger>
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
          <TabsTrigger value="history">Evolution History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fitness Evolution Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fitness Evolution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={fitnessData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="generation" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="fitness" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Evolution Events Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Evolution Events</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={eventTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {eventTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">System Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Average Fitness</span>
                  <span>{(metrics.average_fitness * 100).toFixed(1)}%</span>
                </div>
                <Progress value={metrics.average_fitness * 100} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Evolutionary Pressure</span>
                  <span>{(metrics.evolutionary_pressure * 100).toFixed(1)}%</span>
                </div>
                <Progress value={metrics.evolutionary_pressure * 100} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Convergence Rate</span>
                  <span>{(metrics.convergence_rate * 100).toFixed(1)}%</span>
                </div>
                <Progress value={metrics.convergence_rate * 100} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">{metrics.species_count}</div>
                  <div className="text-sm text-muted-foreground">Active Species</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500">{metrics.extinction_events}</div>
                  <div className="text-sm text-muted-foreground">Extinction Events</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="populations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Population Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={populationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="size" fill="#8884d8" />
                  <Bar dataKey="avgFitness" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from(populations.entries()).map(([name, organisms]) => (
              <Card key={name}>
                <CardHeader>
                  <CardTitle className="text-sm">{name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Size:</span>
                      <span>{organisms.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Avg Fitness:</span>
                      <span>
                        {(
                          (organisms.reduce((sum, org) => sum + (org.state?.fitness || 0), 0) / organisms.length) *
                          100
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Best Fitness:</span>
                      <span>{(Math.max(...organisms.map((org) => org.state?.fitness || 0)) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="strategies" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {strategies.map((strategy) => (
              <Card key={strategy.name}>
                <CardHeader>
                  <CardTitle className="text-sm">{strategy.name}</CardTitle>
                  <Badge variant="outline">{strategy.type}</Badge>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>Population Size:</span>
                      <span>{strategy.parameters.population_size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mutation Rate:</span>
                      <span>{(strategy.parameters.mutation_rate * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Crossover Rate:</span>
                      <span>{(strategy.parameters.crossover_rate * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Selection Pressure:</span>
                      <span>{(strategy.parameters.selection_pressure * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Elitism Rate:</span>
                      <span>{(strategy.parameters.elitism_rate * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Evolution Events</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {evolutionHistory
                    .slice(-50)
                    .reverse()
                    .map((event, index) => (
                      <div key={index} className="flex items-center space-x-3 p-2 border rounded">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            event.type === "mutation"
                              ? "bg-blue-500"
                              : event.type === "crossover"
                                ? "bg-green-500"
                                : event.type === "selection"
                                  ? "bg-yellow-500"
                                  : event.type === "speciation"
                                    ? "bg-purple-500"
                                    : event.type === "extinction"
                                      ? "bg-red-500"
                                      : "bg-gray-500"
                          }`}
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {event.type}
                            </Badge>
                            <span className="text-sm font-medium">{event.organism_id}</span>
                            <span className="text-xs text-muted-foreground">
                              {event.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          {event.details && (
                            <div className="text-xs text-muted-foreground mt-1">{JSON.stringify(event.details)}</div>
                          )}
                        </div>
                        <div className="text-sm font-medium">
                          {event.impact_score > 0 ? "+" : ""}
                          {(event.impact_score * 100).toFixed(1)}%
                        </div>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
