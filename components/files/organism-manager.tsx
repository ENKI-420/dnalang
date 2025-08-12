"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileCode, Upload, Play, Edit, Plus, Download } from "lucide-react"

interface Organism {
  id: string
  name: string
  type: "infra" | "agent" | "pipeline" | "compliance"
  status: "active" | "inactive" | "error"
  version: string
  description: string
  code: string
  lastModified: Date
  dependencies: string[]
}

export function OrganismManager() {
  const [organisms, setOrganisms] = useState<Organism[]>([
    {
      id: "1",
      name: "quantum-nlp-processor",
      type: "pipeline",
      status: "active",
      version: "2.1.0",
      description: "Quantum-enhanced natural language processing organism",
      code: `organism QuantumNLPProcessor {
  inputs: [text: String, context: Context]
  outputs: [vectors: QuantumVector[], confidence: Float]
  
  process() {
    let tokens = tokenize(inputs.text)
    let embeddings = quantumEmbed(tokens, inputs.context)
    return {
      vectors: embeddings,
      confidence: calculateConfidence(embeddings)
    }
  }
}`,
      lastModified: new Date("2024-01-15"),
      dependencies: ["quantum-core", "nlp-utils"],
    },
    {
      id: "2",
      name: "swarm-coordinator",
      type: "agent",
      status: "active",
      version: "1.8.3",
      description: "Distributed swarm intelligence coordination organism",
      code: `organism SwarmCoordinator {
  inputs: [agents: Agent[], task: Task]
  outputs: [assignments: Assignment[], consensus: Boolean]
  
  coordinate() {
    let assignments = distributeTask(inputs.task, inputs.agents)
    let consensus = achieveConsensus(assignments)
    return { assignments, consensus }
  }
}`,
      lastModified: new Date("2024-01-12"),
      dependencies: ["swarm-core", "consensus-protocol"],
    },
    {
      id: "3",
      name: "compliance-validator",
      type: "compliance",
      status: "inactive",
      version: "3.0.1",
      description: "DARPA OT compliance validation organism",
      code: `organism ComplianceValidator {
  inputs: [operation: Operation, policies: Policy[]]
  outputs: [valid: Boolean, violations: Violation[]]
  
  validate() {
    let violations = checkPolicies(inputs.operation, inputs.policies)
    return {
      valid: violations.length === 0,
      violations: violations
    }
  }
}`,
      lastModified: new Date("2024-01-10"),
      dependencies: ["compliance-core", "policy-engine"],
    },
  ])

  const [selectedOrganism, setSelectedOrganism] = useState<Organism | null>(organisms[0])
  const [isEditing, setIsEditing] = useState(false)
  const [editedCode, setEditedCode] = useState("")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "inactive":
        return "bg-gray-500"
      case "error":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "infra":
        return "bg-blue-500"
      case "agent":
        return "bg-purple-500"
      case "pipeline":
        return "bg-green-500"
      case "compliance":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleEdit = () => {
    if (selectedOrganism) {
      setEditedCode(selectedOrganism.code)
      setIsEditing(true)
    }
  }

  const handleSave = () => {
    if (selectedOrganism) {
      setOrganisms((prev) =>
        prev.map((org) =>
          org.id === selectedOrganism.id ? { ...org, code: editedCode, lastModified: new Date() } : org,
        ),
      )
      setSelectedOrganism({ ...selectedOrganism, code: editedCode, lastModified: new Date() })
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedCode("")
  }

  return (
    <div className="h-full p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Organism Manager</h2>
          <p className="text-muted-foreground">Upload, edit, and manage DNALang organisms</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Organism
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
        {/* Organism List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Organisms</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-16rem)]">
              <div className="space-y-2 p-4">
                {organisms.map((organism) => (
                  <div
                    key={organism.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedOrganism?.id === organism.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedOrganism(organism)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-sm">{organism.name}</h3>
                      <div className={`h-2 w-2 rounded-full ${getStatusColor(organism.status)}`} />
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={`text-xs ${getTypeColor(organism.type)}`}>{organism.type}</Badge>
                      <span className="text-xs text-muted-foreground">v{organism.version}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{organism.description}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Organism Details */}
        <div className="lg:col-span-2">
          {selectedOrganism ? (
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileCode className="h-5 w-5" />
                    <div>
                      <CardTitle>{selectedOrganism.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{selectedOrganism.description}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {!isEditing ? (
                      <>
                        <Button variant="outline" size="sm" onClick={handleEdit}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Play className="h-4 w-4 mr-2" />
                          Run
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" size="sm" onClick={handleCancel}>
                          Cancel
                        </Button>
                        <Button size="sm" onClick={handleSave}>
                          Save
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-[calc(100%-5rem)]">
                <Tabs defaultValue="code" className="h-full">
                  <TabsList>
                    <TabsTrigger value="code">Code</TabsTrigger>
                    <TabsTrigger value="metadata">Metadata</TabsTrigger>
                    <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
                  </TabsList>

                  <TabsContent value="code" className="h-[calc(100%-3rem)]">
                    {isEditing ? (
                      <Textarea
                        value={editedCode}
                        onChange={(e) => setEditedCode(e.target.value)}
                        className="h-full font-mono text-sm resize-none"
                        placeholder="Enter DNALang code..."
                      />
                    ) : (
                      <ScrollArea className="h-full">
                        <pre className="text-sm font-mono p-4 bg-muted/20 rounded-lg">
                          <code>{selectedOrganism.code}</code>
                        </pre>
                      </ScrollArea>
                    )}
                  </TabsContent>

                  <TabsContent value="metadata" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Name</label>
                        <Input value={selectedOrganism.name} readOnly />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Version</label>
                        <Input value={selectedOrganism.version} readOnly />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Type</label>
                        <Input value={selectedOrganism.type} readOnly />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Status</label>
                        <Input value={selectedOrganism.status} readOnly />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Textarea value={selectedOrganism.description} readOnly />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Last Modified</label>
                      <Input value={selectedOrganism.lastModified.toLocaleString()} readOnly />
                    </div>
                  </TabsContent>

                  <TabsContent value="dependencies" className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-3">Dependencies</h4>
                      <div className="space-y-2">
                        {selectedOrganism.dependencies.map((dep, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <span className="text-sm font-mono">{dep}</span>
                            <Badge variant="outline" className="text-xs">
                              Required
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent>
                <div className="text-center">
                  <FileCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Organism Selected</h3>
                  <p className="text-muted-foreground">Select an organism from the list to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
