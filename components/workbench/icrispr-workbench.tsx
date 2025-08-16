"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dna,
  Play,
  Square,
  Save,
  FileCode,
  Brain,
  Activity,
  GitBranch,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  RotateCcw,
  Plus,
  Search,
  Replace,
  Terminal,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Cpu,
} from "lucide-react"
import { useDNARuntime } from "@/hooks/use-dna-runtime"
import { useDNACompiler } from "@/hooks/use-dna-compiler"

interface DNAFile {
  id: string
  name: string
  content: string
  type: "organism" | "gene" | "workflow" | "config"
  lastModified: Date
  isActive: boolean
  hasErrors: boolean
  consciousness?: number
  fitness?: number
  generation?: number
}

interface ExecutionResult {
  success: boolean
  output: string
  errors: string[]
  metrics: {
    consciousness: number
    fitness: number
    execution_time: number
    memory_usage: number
  }
}

export function ICRISPRWorkbench() {
  const { organisms, systemMetrics, createOrganism, executeOrganism } = useDNARuntime()
  const { compile, validateSyntax, isCompiling, lastResult, compilationHistory, getCompilationStats } = useDNACompiler()

  const [files, setFiles] = useState<DNAFile[]>([
    {
      id: "1",
      name: "SelfHealingAgent.dna",
      type: "organism",
      isActive: true,
      hasErrors: false,
      lastModified: new Date(),
      consciousness: 0.75,
      fitness: 0.82,
      generation: 3,
      content: `organism SelfHealingAgent {
  state {
    consciousness: float = 0.65;
    quantum_coherence: float = 0.78;
    fitness: float = 0.82;
    healing_factor: float = 0.91;
  }

  gene TelemetryConsumer {
    sense system_events {
      from environment.monitor();
      returns EventStream;
    }
    
    process threat_detection {
      input: event_stream;
      output: threat_level;
      sensitivity: 0.85;
    }
  }

  gene AutoRemediation {
    process self_heal {
      input: threat_data;
      output: healing_action;
      effectiveness: 0.92;
    }
    
    mutate adaptation {
      trigger: repeated_threats;
      evolution: strengthen_resistance;
    }
  }

  workflow {
    while True {
      events = TelemetryConsumer.consume_events();
      
      if (events.threat_level > 0.3) {
        healing = AutoRemediation.self_heal(events);
        apply_healing(healing);
        
        if (healing.success) {
          update_consciousness(0.01);
          strengthen_immunity(events.threat_type);
        }
      }
      
      evolve_if_ready();
      maintain_quantum_coherence();
    }
  }

  evolution {
    fitness_goal {
      maximize(consciousness + healing_factor * quantum_coherence);
    }
    mutation_rate: 0.05;
    selection_pressure: 0.88;
  }
}`,
    },
  ])

  const [activeFileId, setActiveFileId] = useState<string>("1")
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null)
  const [showConsole, setShowConsole] = useState(true)
  const [showVisualization, setShowVisualization] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [replaceQuery, setReplaceQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [syntaxTheme, setSyntaxTheme] = useState("dark")

  const editorRef = useRef<HTMLTextAreaElement>(null)
  const consoleRef = useRef<HTMLDivElement>(null)

  const activeFile = files.find((f) => f.id === activeFileId)

  // Syntax highlighting for DNA-Lang
  const highlightDNASyntax = (code: string) => {
    return code
      .replace(
        /(organism|gene|workflow|evolution|state|process|sense|mutate)\b/g,
        '<span class="text-purple-400 font-semibold">$1</span>',
      )
      .replace(/(float|int|string|boolean|while|if|else|True|False)\b/g, '<span class="text-blue-400">$1</span>')
      .replace(/(consciousness|quantum_coherence|fitness|mutation_rate)\b/g, '<span class="text-green-400">$1</span>')
      .replace(/([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g, '<span class="text-yellow-400">$1</span>(')
      .replace(/(\/\/.*$)/gm, '<span class="text-gray-500 italic">$1</span>')
      .replace(/(".*?")/g, '<span class="text-orange-400">$1</span>')
      .replace(/(\d+\.?\d*)/g, '<span class="text-cyan-400">$1</span>')
  }

  const handleExecute = async () => {
    if (!activeFile) return

    setIsExecuting(true)
    try {
      // Compile DNA code using the new compiler
      const compilationResult = await compile(activeFile.content, {
        generateBytecode: true,
        optimizationLevel: "standard",
        debugMode: true,
      })

      if (!compilationResult.success) {
        // Show compilation errors
        const result: ExecutionResult = {
          success: false,
          output: "",
          errors: compilationResult.errors.map((err) => `Line ${err.line}: ${err.message}`),
          metrics: {
            consciousness: 0,
            fitness: 0,
            execution_time: compilationResult.metadata.compile_time / 1000,
            memory_usage: 0,
          },
        }
        setExecutionResult(result)

        // Mark file as having errors
        setFiles((prev) => prev.map((f) => (f.id === activeFileId ? { ...f, hasErrors: true } : f)))
        return
      }

      // Execute compiled organism
      if (compilationResult.organism) {
        const organism = await createOrganism(compilationResult.organism)
        await executeOrganism(organism.id)

        // Enhanced execution result with compilation metadata
        const result: ExecutionResult = {
          success: true,
          output: `✓ Compilation successful (${compilationResult.metadata.compile_time}ms)
✓ Organism ${compilationResult.organism.name} executed successfully

Compilation Metrics:
- Complexity: ${(compilationResult.metadata.organism_complexity * 100).toFixed(1)}%
- Gene Count: ${compilationResult.metadata.gene_count}
- Workflow Complexity: ${(compilationResult.metadata.workflow_complexity * 100).toFixed(1)}%
- Estimated Performance: ${(compilationResult.metadata.estimated_performance * 100).toFixed(1)}%

Runtime State:
- Consciousness: ${organism.state.consciousness.toFixed(3)}
- Fitness: ${organism.state.fitness.toFixed(3)}
- Generation: ${organism.state.generation}
- Quantum Coherence: ${organism.state.quantum_coherence.toFixed(3)}

${compilationResult.warnings.length > 0 ? `\nWarnings:\n${compilationResult.warnings.map((w) => `⚠ ${w}`).join("\n")}` : ""}`,
          errors: [],
          metrics: {
            consciousness: organism.state.consciousness,
            fitness: organism.state.fitness,
            execution_time: compilationResult.metadata.compile_time / 1000,
            memory_usage: compilationResult.metadata.organism_complexity,
          },
        }

        setExecutionResult(result)

        // Update file with execution results
        setFiles((prev) =>
          prev.map((f) =>
            f.id === activeFileId
              ? {
                  ...f,
                  consciousness: result.metrics.consciousness,
                  fitness: result.metrics.fitness,
                  hasErrors: false,
                }
              : f,
          ),
        )
      }
    } catch (error) {
      const result: ExecutionResult = {
        success: false,
        output: "",
        errors: [error instanceof Error ? error.message : "Unknown execution error"],
        metrics: {
          consciousness: 0,
          fitness: 0,
          execution_time: 0,
          memory_usage: 0,
        },
      }
      setExecutionResult(result)

      // Mark file as having errors
      setFiles((prev) => prev.map((f) => (f.id === activeFileId ? { ...f, hasErrors: true } : f)))
    } finally {
      setIsExecuting(false)
    }
  }

  const handleContentChange = async (content: string) => {
    if (!activeFile) return

    setFiles((prev) => prev.map((f) => (f.id === activeFileId ? { ...f, content } : f)))

    // Real-time syntax validation
    try {
      const syntaxErrors = await validateSyntax(content)
      setFiles((prev) => prev.map((f) => (f.id === activeFileId ? { ...f, hasErrors: syntaxErrors.length > 0 } : f)))
    } catch (error) {
      // Handle validation errors silently
    }
  }

  // Save file
  const handleSave = () => {
    if (!activeFile || !editorRef.current) return

    setFiles((prev) =>
      prev.map((f) =>
        f.id === activeFileId ? { ...f, content: editorRef.current!.value, lastModified: new Date() } : f,
      ),
    )
  }

  // Create new file
  const handleNewFile = () => {
    const newFile: DNAFile = {
      id: Date.now().toString(),
      name: "NewOrganism.dna",
      type: "organism",
      content: `organism NewOrganism {
  state {
    consciousness: float = 0.5;
    quantum_coherence: float = 0.5;
    fitness: float = 0.5;
  }

  workflow {
    while True {
      // Your organism logic here
      evolve_if_ready();
    }
  }

  evolution {
    fitness_goal {
      maximize(consciousness + quantum_coherence);
    }
  }
}`,
      isActive: false,
      hasErrors: false,
      lastModified: new Date(),
    }

    setFiles((prev) => [...prev, newFile])
    setActiveFileId(newFile.id)
  }

  // Search and replace
  const handleSearch = () => {
    if (!editorRef.current || !searchQuery) return

    const content = editorRef.current.value
    const index = content.indexOf(searchQuery)

    if (index !== -1) {
      editorRef.current.focus()
      editorRef.current.setSelectionRange(index, index + searchQuery.length)
    }
  }

  const handleReplace = () => {
    if (!editorRef.current || !searchQuery) return

    const content = editorRef.current.value
    const newContent = content.replace(new RegExp(searchQuery, "g"), replaceQuery)

    editorRef.current.value = newContent
    handleContentChange(newContent)
  }

  // Auto-scroll console
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight
    }
  }, [executionResult])

  return (
    <div className={`h-full flex flex-col ${isFullscreen ? "fixed inset-0 z-50 bg-background" : ""}`}>
      {/* Workbench Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/40 bg-muted/20">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Dna className="h-6 w-6 text-purple-500" />
            <h1 className="text-xl font-bold">iCRISPR Workbench</h1>
          </div>
          <Badge variant="outline" className="bg-purple-500/10">
            DNA-Lang IDE
          </Badge>
          {isCompiling && (
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600">
              <Zap className="h-3 w-3 mr-1" />
              Compiling...
            </Badge>
          )}
          {lastResult && (
            <Badge
              variant="outline"
              className={lastResult.success ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}
            >
              {lastResult.success ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <AlertTriangle className="h-3 w-3 mr-1" />
              )}
              {lastResult.success ? "Compiled" : "Error"}
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => setShowSearch(!showSearch)}>
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleSave}>
            <Save className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleNewFile}>
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="p-3 border-b border-border/40 bg-muted/10">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="Replace..."
              value={replaceQuery}
              onChange={(e) => setReplaceQuery(e.target.value)}
              className="flex-1"
            />
            <Button size="sm" onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={handleReplace}>
              <Replace className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* File Explorer */}
        <div className="w-64 border-r border-border/40 bg-muted/10">
          <div className="p-3 border-b border-border/40">
            <h3 className="font-semibold text-sm">DNA Files</h3>
            {getCompilationStats() && (
              <div className="mt-2 text-xs text-muted-foreground">
                <div>Success Rate: {(getCompilationStats()!.successRate * 100).toFixed(0)}%</div>
                <div>Avg Time: {getCompilationStats()!.averageCompileTime.toFixed(0)}ms</div>
              </div>
            )}
          </div>
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="p-2 space-y-1">
              {files.map((file) => (
                <div
                  key={file.id}
                  className={`p-2 rounded cursor-pointer transition-colors ${
                    file.id === activeFileId ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50"
                  }`}
                  onClick={() => setActiveFileId(file.id)}
                >
                  <div className="flex items-center space-x-2">
                    <FileCode className="h-4 w-4" />
                    <span className="text-sm font-medium truncate">{file.name}</span>
                    {file.hasErrors && <div className="h-2 w-2 rounded-full bg-red-500" />}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {file.type}
                    </Badge>
                    {file.consciousness && (
                      <span className="text-xs text-muted-foreground">C: {(file.consciousness * 100).toFixed(0)}%</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Editor Toolbar */}
          <div className="flex items-center justify-between p-2 border-b border-border/40 bg-muted/5">
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                onClick={handleExecute}
                disabled={isExecuting || isCompiling}
                className="bg-green-600 hover:bg-green-700"
              >
                {isExecuting || isCompiling ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isExecuting ? "Executing" : isCompiling ? "Compiling" : "Compile & Execute"}
              </Button>
              {lastResult && (
                <>
                  <Separator orientation="vertical" className="h-6" />
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{lastResult.metadata.compile_time}ms</span>
                    <Cpu className="h-3 w-3" />
                    <span>{(lastResult.metadata.organism_complexity * 100).toFixed(0)}%</span>
                  </div>
                </>
              )}
              <Separator orientation="vertical" className="h-6" />
              <Select value={syntaxTheme} onValueChange={setSyntaxTheme}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="purple">Purple</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={() => setShowVisualization(!showVisualization)}>
                {showVisualization ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowConsole(!showConsole)}>
                <Terminal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 flex">
            {/* Code Editor */}
            <div className="flex-1 flex flex-col">
              {activeFile && (
                <Tabs defaultValue="editor" className="flex-1 flex flex-col">
                  <TabsList className="w-fit mx-4 mt-2">
                    <TabsTrigger value="editor">Editor</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    <TabsTrigger value="debug">Debug</TabsTrigger>
                    <TabsTrigger value="compilation">Compilation</TabsTrigger>
                  </TabsList>

                  <TabsContent value="editor" className="flex-1 p-4">
                    <Textarea
                      ref={editorRef}
                      value={activeFile.content}
                      onChange={(e) => handleContentChange(e.target.value)}
                      className="h-full font-mono text-sm resize-none bg-slate-950 text-green-400 border-slate-800"
                      placeholder="Write your DNA-Lang code here..."
                    />
                  </TabsContent>

                  <TabsContent value="preview" className="flex-1 p-4">
                    <ScrollArea className="h-full">
                      <pre
                        className="text-sm font-mono p-4 bg-slate-950 rounded-lg text-green-400"
                        dangerouslySetInnerHTML={{
                          __html: highlightDNASyntax(activeFile.content),
                        }}
                      />
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="debug" className="flex-1 p-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Organism State</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Consciousness:</span>
                              <span>{((activeFile.consciousness || 0) * 100).toFixed(1)}%</span>
                            </div>
                            <Progress value={(activeFile.consciousness || 0) * 100} className="h-2" />

                            <div className="flex justify-between text-sm">
                              <span>Fitness:</span>
                              <span>{((activeFile.fitness || 0) * 100).toFixed(1)}%</span>
                            </div>
                            <Progress value={(activeFile.fitness || 0) * 100} className="h-2" />
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Evolution</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Generation:</span>
                              <span>{activeFile.generation || 1}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Mutations:</span>
                              <span>0</span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="compilation" className="flex-1 p-4">
                    <div className="space-y-4">
                      {lastResult ? (
                        <div className="space-y-4">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm flex items-center space-x-2">
                                {lastResult.success ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <AlertTriangle className="h-4 w-4 text-red-500" />
                                )}
                                <span>Compilation Result</span>
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Status:</span>
                                  <span className={`ml-2 ${lastResult.success ? "text-green-600" : "text-red-600"}`}>
                                    {lastResult.success ? "Success" : "Failed"}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Time:</span>
                                  <span className="ml-2">{lastResult.metadata.compile_time}ms</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Complexity:</span>
                                  <span className="ml-2">
                                    {(lastResult.metadata.organism_complexity * 100).toFixed(1)}%
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Performance:</span>
                                  <span className="ml-2">
                                    {(lastResult.metadata.estimated_performance * 100).toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {lastResult.errors.length > 0 && (
                            <Card>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-red-600">Compilation Errors</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <ScrollArea className="h-32">
                                  <div className="space-y-1">
                                    {lastResult.errors.map((error, idx) => (
                                      <div key={idx} className="text-sm text-red-600 font-mono">
                                        Line {error.line}: {error.message}
                                      </div>
                                    ))}
                                  </div>
                                </ScrollArea>
                              </CardContent>
                            </Card>
                          )}

                          {lastResult.warnings.length > 0 && (
                            <Card>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-yellow-600">Warnings</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <ScrollArea className="h-24">
                                  <div className="space-y-1">
                                    {lastResult.warnings.map((warning, idx) => (
                                      <div key={idx} className="text-sm text-yellow-600">
                                        {warning}
                                      </div>
                                    ))}
                                  </div>
                                </ScrollArea>
                              </CardContent>
                            </Card>
                          )}

                          {lastResult.bytecode && (
                            <Card>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Generated Bytecode</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <ScrollArea className="h-32">
                                  <pre className="text-xs font-mono bg-slate-950 text-green-400 p-2 rounded">
                                    {lastResult.bytecode}
                                  </pre>
                                </ScrollArea>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      ) : (
                        <div className="text-center text-muted-foreground py-8">
                          <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No compilation results yet</p>
                          <p className="text-sm">Click "Compile & Execute" to see results</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </div>

            {/* Organism Visualization */}
            {showVisualization && (
              <div className="w-80 border-l border-border/40 bg-muted/5">
                <div className="p-3 border-b border-border/40">
                  <h3 className="font-semibold text-sm">Organism Visualization</h3>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    {/* Consciousness Meter */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center space-x-2">
                          <Brain className="h-4 w-4" />
                          <span>Consciousness</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <Progress value={(activeFile?.consciousness || 0) * 100} className="h-3" />
                          <div className="text-xs text-muted-foreground text-center">
                            {((activeFile?.consciousness || 0) * 100).toFixed(1)}% Aware
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Fitness Meter */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center space-x-2">
                          <Activity className="h-4 w-4" />
                          <span>Fitness</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <Progress value={(activeFile?.fitness || 0) * 100} className="h-3" />
                          <div className="text-xs text-muted-foreground text-center">
                            {((activeFile?.fitness || 0) * 100).toFixed(1)}% Optimal
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Evolution Tree */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center space-x-2">
                          <GitBranch className="h-4 w-4" />
                          <span>Evolution</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-500">Gen {activeFile?.generation || 1}</div>
                          <div className="text-xs text-muted-foreground">Current Generation</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Console Output */}
          {showConsole && (
            <div className="h-48 border-t border-border/40 bg-slate-950">
              <div className="flex items-center justify-between p-2 border-b border-border/40">
                <h3 className="text-sm font-semibold text-green-400">Console Output</h3>
                <Button variant="ghost" size="sm" onClick={() => setExecutionResult(null)}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
              <ScrollArea className="h-40" ref={consoleRef}>
                <div className="p-3 font-mono text-sm text-green-400">
                  {executionResult ? (
                    <div>
                      {executionResult.success ? (
                        <div className="text-green-400">
                          <div>✓ Execution successful</div>
                          <div className="mt-2 whitespace-pre-wrap">{executionResult.output}</div>
                          <div className="mt-2 text-cyan-400">
                            Execution time: {executionResult.metrics.execution_time}s
                          </div>
                          <div className="text-cyan-400">
                            Memory usage: {(executionResult.metrics.memory_usage * 100).toFixed(1)}%
                          </div>
                        </div>
                      ) : (
                        <div className="text-red-400">
                          <div>✗ Execution failed</div>
                          {executionResult.errors.map((error, idx) => (
                            <div key={idx} className="mt-1">
                              Error: {error}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Ready to execute DNA organisms...</p>
                      <p className="text-sm">Press Execute to run your code.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
