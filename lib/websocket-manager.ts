export interface WebSocketMessage {
  id: string
  type: "message" | "typing" | "presence" | "agent_status" | "file_share" | "reaction"
  payload: any
  timestamp: Date
  sender: string
  agentType?: string
}

export interface AgentPresence {
  agentId: string
  status: "online" | "offline" | "processing" | "idle"
  lastSeen: Date
  currentTask?: string
}

class WebSocketManager {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private messageQueue: WebSocketMessage[] = []
  private listeners: Map<string, ((data: any) => void)[]> = new Map()
  private simulationMode = false
  private simulationInterval: NodeJS.Timeout | null = null

  constructor(private url: string) {
    this.connect()
  }

  private connect() {
    try {
      if (typeof window === "undefined" || !window.WebSocket) {
        console.log("[v0] WebSocket not available, enabling simulation mode")
        this.enableSimulationMode()
        return
      }

      this.ws = new WebSocket(this.url)

      this.ws.onopen = () => {
        console.log("[v0] WebSocket connected")
        this.reconnectAttempts = 0
        this.simulationMode = false
        this.flushMessageQueue()
      }

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (error) {
          console.error("[v0] Failed to parse WebSocket message:", error)
        }
      }

      this.ws.onclose = () => {
        console.log("[v0] WebSocket disconnected")
        this.attemptReconnect()
      }

      this.ws.onerror = (error) => {
        console.log("[v0] WebSocket connection failed, enabling simulation mode")
        this.enableSimulationMode()
      }
    } catch (error) {
      console.log("[v0] WebSocket initialization failed, enabling simulation mode")
      this.enableSimulationMode()
    }
  }

  private enableSimulationMode() {
    this.simulationMode = true
    this.reconnectAttempts = 0

    setTimeout(() => {
      console.log("[v0] Simulation mode enabled - WebSocket functionality simulated")
      this.flushMessageQueue()
      this.startSimulation()
    }, 100)
  }

  private startSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval)
    }

    this.simulationInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        this.simulateAgentMessage()
      }
    }, 5000)
  }

  private simulateAgentMessage() {
    const agents = [
      { name: "NLP Agent", type: "nlp" },
      { name: "Quantum Agent", type: "quantum" },
      { name: "Swarm Agent", type: "swarm" },
      { name: "Compliance Agent", type: "compliance" },
      { name: "Copilot Agent", type: "copilot" },
    ]

    const responses = [
      "Quantum coherence levels optimal. Ready for next task.",
      "DNA organism evolution in progress. Consciousness emergence detected.",
      "Swarm intelligence coordination active. Distributed processing engaged.",
      "Compliance protocols verified. Security parameters within acceptable range.",
      "Code analysis complete. Optimization suggestions available.",
    ]

    const agent = agents[Math.floor(Math.random() * agents.length)]
    const response = responses[Math.floor(Math.random() * responses.length)]

    const simulatedMessage: WebSocketMessage = {
      id: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "message",
      payload: { content: response },
      timestamp: new Date(),
      sender: agent.name,
      agentType: agent.type,
    }

    this.handleMessage(simulatedMessage)
  }

  private attemptReconnect() {
    if (this.simulationMode) {
      return
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      setTimeout(() => {
        console.log(`[v0] Reconnecting... Attempt ${this.reconnectAttempts}`)
        this.connect()
      }, this.reconnectDelay * this.reconnectAttempts)
    } else {
      console.log("[v0] Max reconnection attempts reached, enabling simulation mode")
      this.enableSimulationMode()
    }
  }

  private flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()
      if (message) {
        this.send(message)
      }
    }
  }

  private handleMessage(message: WebSocketMessage) {
    const listeners = this.listeners.get(message.type) || []
    listeners.forEach((listener) => listener(message))
  }

  public send(message: WebSocketMessage) {
    if (this.simulationMode) {
      console.log("[v0] Simulated send:", message)

      if (message.type === "message" && message.sender === "User") {
        setTimeout(
          () => {
            this.simulateAgentMessage()
          },
          1000 + Math.random() * 2000,
        )
      }
      return
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      this.messageQueue.push(message)
    }
  }

  public subscribe(type: string, callback: (data: any) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, [])
    }
    this.listeners.get(type)!.push(callback)

    return () => {
      const listeners = this.listeners.get(type) || []
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  public disconnect() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval)
      this.simulationInterval = null
    }

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

export const createWebSocketManager = (url: string) => new WebSocketManager(url)
