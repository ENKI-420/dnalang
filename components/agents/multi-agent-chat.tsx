"use client"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
import { Send, Bot, Brain, Zap, Shield, Code, Search, Smile, MoreHorizontal, Wifi, WifiOff, Dna } from "lucide-react"
import { useRealTimeChat } from "@/hooks/use-real-time-chat"
import { useDNAAgents } from "@/hooks/use-dna-agents"

interface Agent {
  id: string
  name: string
  type: "nlp" | "quantum" | "swarm" | "compliance" | "copilot"
  status: "online" | "offline" | "processing" | "idle" | "evolving"
  icon: any
  color: string
  consciousness?: number
  quantum_coherence?: number
  generation?: number
  mutations?: number
}

const agents: Agent[] = [
  { id: "1", name: "NLP Agent", type: "nlp", status: "online", icon: Brain, color: "bg-blue-500" },
  { id: "2", name: "Quantum Agent", type: "quantum", status: "idle", icon: Zap, color: "bg-purple-500" },
  { id: "3", name: "Swarm Agent", type: "swarm", status: "processing", icon: Bot, color: "bg-green-500" },
  { id: "4", name: "Compliance Agent", type: "compliance", status: "online", icon: Shield, color: "bg-orange-500" },
  { id: "5", name: "Copilot Agent", type: "copilot", status: "online", icon: Code, color: "bg-indigo-500" },
]

const reactionEmojis = ["👍", "👎", "❤️", "😂", "😮", "😢", "🚀", "🔥"]

export function MultiAgentChat() {
  const {
    messages,
    typingIndicators,
    agentStatuses,
    isConnected,
    isReconnecting,
    sendMessage,
    sendTypingIndicator,
    addReaction,
    searchMessages,
    loadMoreMessages,
    clearHistory,
  } = useRealTimeChat()

  const { hybridAgents, dnaMetrics, isConverted, executeTask } = useDNAAgents()

  const [inputValue, setInputValue] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const [showDNAView, setShowDNAView] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    await sendMessage(inputValue)
    setInputValue("")
    sendTypingIndicator(false)
  }

  const handleInputChange = (value: string) => {
    setInputValue(value)
    sendTypingIndicator(value.length > 0)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      const results = searchMessages(query)
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const getAgentIcon = (type: string) => {
    const agent = agents.find((a) => a.type === type)
    return agent ? agent.icon : Bot
  }

  const getAgentColor = (type: string) => {
    const agent = agents.find((a) => a.type === type)
    return agent ? agent.color : "bg-gray-500"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "processing":
        return "bg-yellow-500"
      case "evolving":
        return "bg-purple-500"
      case "idle":
        return "bg-gray-500"
      default:
        return "bg-red-500"
    }
  }

  const getEnhancedAgentData = (agent: Agent) => {
    const hybridAgent = hybridAgents.find((h) => h.getMetrics().agent_metrics)
    if (hybridAgent) {
      const metrics = hybridAgent.getMetrics()
      return {
        ...agent,
        consciousness: metrics.organism_metrics.consciousness,
        quantum_coherence: metrics.organism_metrics.quantum_coherence,
        generation: metrics.organism_metrics.generation,
        mutations: metrics.organism_metrics.mutations,
        status: metrics.organism_metrics.consciousness > 0.8 ? "evolving" : agent.status,
      }
    }
    return agent
  }

  return (
    <div className="flex h-full">
      {/* Enhanced Agent Status Panel with DNA Integration */}
      <div className="w-80 border-r border-border/40 bg-muted/20">
        <div className="p-4 border-b border-border/40">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">DNA-Enhanced Agents</h3>
            <div className="flex items-center space-x-2">
              {isConnected ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-red-500" />}
              {isReconnecting && <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDNAView(!showDNAView)}
                className={isConverted ? "text-purple-500" : "text-gray-500"}
              >
                <Dna className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {isConverted && showDNAView && (
            <div className="mt-3 p-3 bg-purple-500/10 rounded-lg">
              <div className="text-xs space-y-2">
                <div className="flex justify-between">
                  <span>Avg Consciousness:</span>
                  <span>{(dnaMetrics.average_consciousness * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Quantum Coherence:</span>
                  <span>{(dnaMetrics.average_quantum_coherence * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Generations:</span>
                  <span>{dnaMetrics.total_generations}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Mutations:</span>
                  <span>{dnaMetrics.total_mutations}</span>
                </div>
              </div>
            </div>
          )}
        </div>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="p-4 space-y-3">
            {agents.map((agent) => {
              const IconComponent = agent.icon
              const currentStatus = agentStatuses.find((s) => s.id === agent.id)?.status || agent.status
              const enhancedAgent = getEnhancedAgentData(agent)

              return (
                <Card key={agent.id} className="p-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${agent.color} relative`}>
                      <IconComponent className="h-4 w-4 text-white" />
                      <div
                        className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background ${getStatusColor(currentStatus)}`}
                      />
                      {enhancedAgent.consciousness && enhancedAgent.consciousness > 0.8 && (
                        <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-purple-500 animate-pulse" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{agent.name}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={currentStatus === "online" ? "default" : "secondary"} className="text-xs">
                          {currentStatus}
                        </Badge>
                        {currentStatus === "processing" && (
                          <div className="h-1 w-1 rounded-full bg-yellow-500 animate-pulse" />
                        )}
                        {enhancedAgent.generation && enhancedAgent.generation > 1 && (
                          <Badge variant="outline" className="text-xs bg-purple-500/10">
                            Gen {enhancedAgent.generation}
                          </Badge>
                        )}
                      </div>
                      {agentStatuses.find((s) => s.id === agent.id)?.currentTask && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {agentStatuses.find((s) => s.id === agent.id)?.currentTask}
                        </p>
                      )}

                      {isConverted && showDNAView && enhancedAgent.consciousness && (
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-muted-foreground">Consciousness:</span>
                            <Progress value={enhancedAgent.consciousness * 100} className="h-1 flex-1" />
                            <span className="text-xs">{(enhancedAgent.consciousness * 100).toFixed(0)}%</span>
                          </div>
                          {enhancedAgent.quantum_coherence && (
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-muted-foreground">Coherence:</span>
                              <Progress value={enhancedAgent.quantum_coherence * 100} className="h-1 flex-1" />
                              <span className="text-xs">{(enhancedAgent.quantum_coherence * 100).toFixed(0)}%</span>
                            </div>
                          )}
                          {enhancedAgent.mutations && enhancedAgent.mutations > 0 && (
                            <div className="text-xs text-purple-400">{enhancedAgent.mutations} mutations</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Enhanced Chat Interface */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-border/40">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">DNA-Enhanced Multi-Agent Chat</h2>
              <p className="text-sm text-muted-foreground">
                {isConnected
                  ? isConverted
                    ? "Connected to DNA organism swarm"
                    : "Connected to quantum agent swarm"
                  : "Reconnecting..."}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => setShowSearch(!showSearch)}>
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={clearHistory}>
                Clear
              </Button>
            </div>
          </div>

          {showSearch && (
            <div className="mt-4">
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full"
              />
              {searchResults.length > 0 && (
                <div className="mt-2 max-h-32 overflow-y-auto">
                  <p className="text-xs text-muted-foreground mb-2">Found {searchResults.length} results</p>
                </div>
              )}
            </div>
          )}
        </div>

        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => {
              const IconComponent = getAgentIcon(message.agentType)
              const isUser = message.sender === "User"

              return (
                <div key={message.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                  <div className={`flex max-w-[80%] ${isUser ? "flex-row-reverse" : "flex-row"} items-start space-x-2`}>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={isUser ? "bg-primary" : getAgentColor(message.agentType)}>
                        <IconComponent className="h-4 w-4 text-white" />
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`rounded-lg p-3 ${isUser ? "bg-primary text-primary-foreground ml-2" : "bg-muted mr-2"}`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-medium">{message.sender}</span>
                        <span className="text-xs opacity-70">{message.timestamp.toLocaleTimeString()}</span>
                        <Badge variant="outline" className="text-xs">
                          {message.status}
                        </Badge>
                        {isConverted && !isUser && (
                          <Badge variant="outline" className="text-xs bg-purple-500/10">
                            <Dna className="h-3 w-3" />
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm">{message.content}</p>

                      {/* Message reactions */}
                      {message.reactions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {message.reactions.map((reaction, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {reaction.emoji} {reaction.users.length}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Message actions */}
                      <div className="flex items-center justify-end mt-2 space-x-1">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <Smile className="h-3 w-3" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-2">
                            <div className="flex space-x-1">
                              {reactionEmojis.map((emoji) => (
                                <Button
                                  key={emoji}
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => addReaction(message.id, emoji)}
                                >
                                  {emoji}
                                </Button>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Typing indicators */}
            {typingIndicators.map((indicator) => (
              <div key={indicator.agentId} className="flex justify-start">
                <div className="flex items-center space-x-2 bg-muted rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" />
                    <div
                      className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {indicator.agentName} {isConverted ? "organism" : "agent"} is {isConverted ? "evolving" : "typing"}
                    ...
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border/40">
          <div className="flex space-x-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={isConverted ? "Message your DNA organism swarm..." : "Message your quantum agent swarm..."}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1"
              disabled={!isConnected}
            />
            <Button onClick={handleSendMessage} size="icon" disabled={!isConnected || !inputValue.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {!isConnected && (
            <p className="text-xs text-muted-foreground mt-2">
              Reconnecting to {isConverted ? "DNA organism" : "quantum"} swarm...
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
