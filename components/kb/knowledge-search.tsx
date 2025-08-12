"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, Clock, MessageSquare, FileText, Brain } from "lucide-react"

interface SearchResult {
  id: string
  title: string
  content: string
  type: "chat" | "document" | "agent-log" | "quantum-state"
  timestamp: Date
  relevance: number
  source: string
  tags: string[]
}

interface KnowledgeEntry {
  id: string
  title: string
  category: string
  content: string
  lastAccessed: Date
  accessCount: number
}

export function KnowledgeSearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([
    {
      id: "1",
      title: "Quantum Entanglement Protocol Discussion",
      content:
        "The quantum entanglement protocol shows promising results with 98.7% fidelity. Agent consensus achieved on implementation strategy...",
      type: "chat",
      timestamp: new Date("2024-01-15T14:30:00"),
      relevance: 0.95,
      source: "Multi-Agent Chat",
      tags: ["quantum", "protocol", "entanglement"],
    },
    {
      id: "2",
      title: "DNALang Organism Specification v2.1",
      content:
        "Updated organism specification includes enhanced quantum processing capabilities and improved swarm coordination...",
      type: "document",
      timestamp: new Date("2024-01-14T09:15:00"),
      relevance: 0.87,
      source: "Organism Manager",
      tags: ["dna-lang", "specification", "quantum"],
    },
    {
      id: "3",
      title: "Swarm Intelligence Convergence Analysis",
      content:
        "Analysis of swarm convergence patterns reveals optimal configuration for distributed decision making...",
      type: "agent-log",
      timestamp: new Date("2024-01-13T16:45:00"),
      relevance: 0.82,
      source: "Swarm Agent",
      tags: ["swarm", "intelligence", "analysis"],
    },
    {
      id: "4",
      title: "Cognitive Overlay Performance Metrics",
      content:
        "Performance metrics indicate 23% improvement in cognitive augmentation efficiency with new neural sync protocols...",
      type: "document",
      timestamp: new Date("2024-01-12T11:20:00"),
      relevance: 0.78,
      source: "Cognitive Overlay",
      tags: ["cognitive", "performance", "metrics"],
    },
  ])

  const [knowledgeBase] = useState<KnowledgeEntry[]>([
    {
      id: "1",
      title: "Quantum Computing Fundamentals",
      category: "Quantum Physics",
      content: "Comprehensive guide to quantum computing principles, superposition, and entanglement...",
      lastAccessed: new Date("2024-01-15"),
      accessCount: 47,
    },
    {
      id: "2",
      title: "Swarm Intelligence Algorithms",
      category: "AI/ML",
      content:
        "Collection of swarm intelligence algorithms including particle swarm optimization and ant colony optimization...",
      lastAccessed: new Date("2024-01-14"),
      accessCount: 32,
    },
    {
      id: "3",
      title: "Bio-Digital Interface Protocols",
      category: "Bio-Digital",
      content: "Protocols for interfacing biological and digital systems in cognitive augmentation applications...",
      lastAccessed: new Date("2024-01-13"),
      accessCount: 28,
    },
  ])

  const handleSearch = () => {
    // Simulate search functionality
    if (searchQuery.trim()) {
      const filtered = searchResults.filter(
        (result) =>
          result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
      )
      setSearchResults(filtered)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "chat":
        return MessageSquare
      case "document":
        return FileText
      case "agent-log":
        return Brain
      case "quantum-state":
        return Brain
      default:
        return FileText
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "chat":
        return "bg-blue-500"
      case "document":
        return "bg-green-500"
      case "agent-log":
        return "bg-purple-500"
      case "quantum-state":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="h-full p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Knowledge Search</h2>
          <p className="text-muted-foreground">Semantic search across chat history and agent knowledge</p>
        </div>
      </div>

      {/* Search Interface */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search knowledge base, chat history, agent logs..."
                className="pl-10"
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-16rem)]">
        {/* Search Results */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="results" className="h-full">
            <TabsList>
              <TabsTrigger value="results">Search Results</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="trending">Trending</TabsTrigger>
            </TabsList>

            <TabsContent value="results" className="h-[calc(100%-3rem)]">
              <ScrollArea className="h-full">
                <div className="space-y-4">
                  {searchResults.map((result) => {
                    const IconComponent = getTypeIcon(result.type)
                    return (
                      <Card key={result.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg ${getTypeColor(result.type)}`}>
                              <IconComponent className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold">{result.title}</h3>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline" className="text-xs">
                                    {(result.relevance * 100).toFixed(0)}% match
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {result.timestamp.toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{result.content}</p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-muted-foreground">Source:</span>
                                  <span className="text-xs font-medium">{result.source}</span>
                                </div>
                                <div className="flex space-x-1">
                                  {result.tags.map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="recent" className="h-[calc(100%-3rem)]">
              <ScrollArea className="h-full">
                <div className="space-y-3">
                  {searchResults.slice(0, 3).map((result) => (
                    <Card key={result.id} className="cursor-pointer hover:bg-muted/50">
                      <CardContent className="p-3">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{result.title}</span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {result.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="trending" className="h-[calc(100%-3rem)]">
              <ScrollArea className="h-full">
                <div className="space-y-3">
                  <Card className="cursor-pointer hover:bg-muted/50">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Quantum Entanglement</span>
                        <Badge className="bg-red-500 text-xs">Hot</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">47 searches today</p>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:bg-muted/50">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Swarm Intelligence</span>
                        <Badge variant="secondary" className="text-xs">
                          Trending
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">32 searches today</p>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Knowledge Base */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-sm">Knowledge Base</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-20rem)]">
                <div className="space-y-3 p-4">
                  {knowledgeBase.map((entry) => (
                    <Card key={entry.id} className="cursor-pointer hover:bg-muted/50">
                      <CardContent className="p-3">
                        <h4 className="font-medium text-sm mb-1">{entry.title}</h4>
                        <Badge variant="outline" className="text-xs mb-2">
                          {entry.category}
                        </Badge>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{entry.content}</p>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Accessed {entry.accessCount} times</span>
                          <span>{entry.lastAccessed.toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
