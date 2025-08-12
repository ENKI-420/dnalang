export interface AgentCapability {
  type: "nlp" | "quantum" | "swarm" | "compliance" | "copilot" | "analytics" | "security"
  level: number // 1-10 proficiency
  specializations: string[]
  resourceCost: number
  maxConcurrentTasks: number
}

export interface Task {
  id: string
  type: string
  priority: "low" | "medium" | "high" | "critical"
  complexity: number // 1-10
  requiredCapabilities: AgentCapability["type"][]
  payload: any
  deadline?: Date
  dependencies: string[]
  status: "pending" | "assigned" | "processing" | "completed" | "failed"
  assignedAgents: string[]
  createdAt: Date
  estimatedDuration: number
  actualDuration?: number
}

export interface Agent {
  id: string
  name: string
  capabilities: AgentCapability[]
  status: "idle" | "busy" | "overloaded" | "offline" | "maintenance"
  currentTasks: string[]
  performance: {
    tasksCompleted: number
    averageCompletionTime: number
    successRate: number
    efficiency: number
    lastActive: Date
  }
  resources: {
    cpu: number
    memory: number
    network: number
  }
  location: { x: number; y: number }
  connections: string[]
  learningData: {
    taskHistory: { taskType: string; duration: number; success: boolean }[]
    adaptations: { capability: string; improvement: number; timestamp: Date }[]
  }
}

export interface OrchestrationMetrics {
  totalTasks: number
  completedTasks: number
  failedTasks: number
  averageTaskTime: number
  systemLoad: number
  agentUtilization: number
  networkEfficiency: number
  queueLength: number
}

class AgentOrchestrator {
  private agents: Map<string, Agent> = new Map()
  private tasks: Map<string, Task> = new Map()
  private taskQueue: Task[] = []
  private completedTasks: Task[] = []
  private metrics: OrchestrationMetrics = {
    totalTasks: 0,
    completedTasks: 0,
    failedTasks: 0,
    averageTaskTime: 0,
    systemLoad: 0,
    agentUtilization: 0,
    networkEfficiency: 0,
    queueLength: 0,
  }
  private listeners: Map<string, ((data: any) => void)[]> = new Map()

  constructor() {
    this.initializeDefaultAgents()
    this.startOrchestrationLoop()
  }

  private initializeDefaultAgents() {
    const defaultAgents: Agent[] = [
      {
        id: "nlp-001",
        name: "NLP Master",
        capabilities: [
          {
            type: "nlp",
            level: 9,
            specializations: ["sentiment", "entity-extraction", "summarization"],
            resourceCost: 3,
            maxConcurrentTasks: 5,
          },
        ],
        status: "idle",
        currentTasks: [],
        performance: {
          tasksCompleted: 0,
          averageCompletionTime: 0,
          successRate: 1.0,
          efficiency: 0.85,
          lastActive: new Date(),
        },
        resources: { cpu: 0.2, memory: 0.3, network: 0.1 },
        location: { x: 200, y: 150 },
        connections: ["quantum-001", "swarm-001"],
        learningData: { taskHistory: [], adaptations: [] },
      },
      {
        id: "quantum-001",
        name: "Quantum Processor",
        capabilities: [
          {
            type: "quantum",
            level: 8,
            specializations: ["optimization", "cryptography", "simulation"],
            resourceCost: 5,
            maxConcurrentTasks: 3,
          },
        ],
        status: "idle",
        currentTasks: [],
        performance: {
          tasksCompleted: 0,
          averageCompletionTime: 0,
          successRate: 0.95,
          efficiency: 0.92,
          lastActive: new Date(),
        },
        resources: { cpu: 0.4, memory: 0.6, network: 0.2 },
        location: { x: 400, y: 100 },
        connections: ["nlp-001", "compliance-001", "copilot-001"],
        learningData: { taskHistory: [], adaptations: [] },
      },
      {
        id: "swarm-001",
        name: "Swarm Coordinator",
        capabilities: [
          {
            type: "swarm",
            level: 10,
            specializations: ["coordination", "consensus", "distributed-processing"],
            resourceCost: 2,
            maxConcurrentTasks: 8,
          },
        ],
        status: "idle",
        currentTasks: [],
        performance: {
          tasksCompleted: 0,
          averageCompletionTime: 0,
          successRate: 0.98,
          efficiency: 0.88,
          lastActive: new Date(),
        },
        resources: { cpu: 0.3, memory: 0.4, network: 0.8 },
        location: { x: 300, y: 250 },
        connections: ["nlp-001", "compliance-001"],
        learningData: { taskHistory: [], adaptations: [] },
      },
      {
        id: "compliance-001",
        name: "Compliance Guardian",
        capabilities: [
          {
            type: "compliance",
            level: 9,
            specializations: ["security-audit", "policy-check", "risk-assessment"],
            resourceCost: 2,
            maxConcurrentTasks: 4,
          },
        ],
        status: "idle",
        currentTasks: [],
        performance: {
          tasksCompleted: 0,
          averageCompletionTime: 0,
          successRate: 0.99,
          efficiency: 0.75,
          lastActive: new Date(),
        },
        resources: { cpu: 0.2, memory: 0.3, network: 0.3 },
        location: { x: 500, y: 200 },
        connections: ["quantum-001", "swarm-001", "copilot-001"],
        learningData: { taskHistory: [], adaptations: [] },
      },
      {
        id: "copilot-001",
        name: "Copilot Hub",
        capabilities: [
          {
            type: "copilot",
            level: 8,
            specializations: ["code-generation", "debugging", "optimization"],
            resourceCost: 3,
            maxConcurrentTasks: 6,
          },
        ],
        status: "idle",
        currentTasks: [],
        performance: {
          tasksCompleted: 0,
          averageCompletionTime: 0,
          successRate: 0.93,
          efficiency: 0.82,
          lastActive: new Date(),
        },
        resources: { cpu: 0.3, memory: 0.4, network: 0.4 },
        location: { x: 350, y: 50 },
        connections: ["quantum-001", "compliance-001"],
        learningData: { taskHistory: [], adaptations: [] },
      },
    ]

    defaultAgents.forEach((agent) => this.agents.set(agent.id, agent))
  }

  // Task Management
  public submitTask(task: Omit<Task, "id" | "status" | "assignedAgents" | "createdAt">): string {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newTask: Task = {
      ...task,
      id: taskId,
      status: "pending",
      assignedAgents: [],
      createdAt: new Date(),
    }

    this.tasks.set(taskId, newTask)
    this.taskQueue.push(newTask)
    this.metrics.totalTasks++
    this.metrics.queueLength = this.taskQueue.length

    this.emit("task_submitted", newTask)
    this.scheduleTask(newTask)

    return taskId
  }

  private scheduleTask(task: Task) {
    // Find best agents for this task
    const suitableAgents = this.findSuitableAgents(task)

    if (suitableAgents.length === 0) {
      // No suitable agents available, consider spawning new ones
      this.considerAgentSpawning(task)
      return
    }

    // Assign task to best available agents
    const selectedAgents = this.selectOptimalAgents(suitableAgents, task)
    this.assignTaskToAgents(task, selectedAgents)
  }

  private findSuitableAgents(task: Task): Agent[] {
    return Array.from(this.agents.values()).filter((agent) => {
      // Check if agent has required capabilities
      const hasCapabilities = task.requiredCapabilities.every((reqCap) =>
        agent.capabilities.some((cap) => cap.type === reqCap && cap.level >= task.complexity),
      )

      // Check if agent is available
      const isAvailable =
        agent.status === "idle" ||
        (agent.status === "busy" && agent.currentTasks.length < this.getMaxConcurrentTasks(agent))

      // Check resource availability
      const hasResources = this.checkResourceAvailability(agent, task)

      return hasCapabilities && isAvailable && hasResources
    })
  }

  private selectOptimalAgents(candidates: Agent[], task: Task): Agent[] {
    // Score agents based on multiple factors
    const scoredAgents = candidates.map((agent) => ({
      agent,
      score: this.calculateAgentScore(agent, task),
    }))

    // Sort by score and select best agents
    scoredAgents.sort((a, b) => b.score - a.score)

    // For now, select single best agent, but could select multiple for complex tasks
    return [scoredAgents[0].agent]
  }

  private calculateAgentScore(agent: Agent, task: Task): number {
    let score = 0

    // Capability match score
    const capabilityScore =
      task.requiredCapabilities.reduce((acc, reqCap) => {
        const agentCap = agent.capabilities.find((cap) => cap.type === reqCap)
        return acc + (agentCap ? agentCap.level / 10 : 0)
      }, 0) / task.requiredCapabilities.length

    // Performance score
    const performanceScore = (agent.performance.successRate + agent.performance.efficiency) / 2

    // Load score (prefer less loaded agents)
    const loadScore = 1 - agent.currentTasks.length / this.getMaxConcurrentTasks(agent)

    // Resource availability score
    const resourceScore = 1 - Math.max(agent.resources.cpu, agent.resources.memory, agent.resources.network)

    score = capabilityScore * 0.4 + performanceScore * 0.3 + loadScore * 0.2 + resourceScore * 0.1

    return score
  }

  private assignTaskToAgents(task: Task, agents: Agent[]) {
    task.status = "assigned"
    task.assignedAgents = agents.map((a) => a.id)

    agents.forEach((agent) => {
      agent.currentTasks.push(task.id)
      agent.status = agent.currentTasks.length >= this.getMaxConcurrentTasks(agent) ? "overloaded" : "busy"
    })

    // Remove from queue
    this.taskQueue = this.taskQueue.filter((t) => t.id !== task.id)
    this.metrics.queueLength = this.taskQueue.length

    this.emit("task_assigned", { task, agents })

    // Start task execution
    setTimeout(() => this.executeTask(task), 100)
  }

  private async executeTask(task: Task) {
    task.status = "processing"
    this.emit("task_started", task)

    // Simulate task execution with realistic timing
    const executionTime = this.estimateExecutionTime(task)

    setTimeout(() => {
      // Simulate success/failure based on agent performance
      const assignedAgents = task.assignedAgents.map((id) => this.agents.get(id)!).filter(Boolean)
      const successProbability =
        assignedAgents.reduce((acc, agent) => acc + agent.performance.successRate, 0) / assignedAgents.length

      const success = Math.random() < successProbability

      if (success) {
        this.completeTask(task, executionTime)
      } else {
        this.failTask(task, executionTime)
      }
    }, executionTime)
  }

  private completeTask(task: Task, actualDuration: number) {
    task.status = "completed"
    task.actualDuration = actualDuration

    // Update agent performance
    task.assignedAgents.forEach((agentId) => {
      const agent = this.agents.get(agentId)
      if (agent) {
        agent.currentTasks = agent.currentTasks.filter((t) => t !== task.id)
        agent.status = agent.currentTasks.length === 0 ? "idle" : "busy"
        agent.performance.tasksCompleted++
        agent.performance.lastActive = new Date()

        // Update learning data
        agent.learningData.taskHistory.push({
          taskType: task.type,
          duration: actualDuration,
          success: true,
        })

        // Adaptive learning - improve capabilities based on successful tasks
        this.updateAgentLearning(agent, task, true)
      }
    })

    this.completedTasks.push(task)
    this.metrics.completedTasks++
    this.updateMetrics()

    this.emit("task_completed", task)
  }

  private failTask(task: Task, actualDuration: number) {
    task.status = "failed"
    task.actualDuration = actualDuration

    // Update agent performance (negative impact)
    task.assignedAgents.forEach((agentId) => {
      const agent = this.agents.get(agentId)
      if (agent) {
        agent.currentTasks = agent.currentTasks.filter((t) => t !== task.id)
        agent.status = agent.currentTasks.length === 0 ? "idle" : "busy"
        agent.performance.lastActive = new Date()

        // Update learning data
        agent.learningData.taskHistory.push({
          taskType: task.type,
          duration: actualDuration,
          success: false,
        })

        this.updateAgentLearning(agent, task, false)
      }
    })

    this.metrics.failedTasks++
    this.updateMetrics()

    // Consider reassigning failed task
    if (task.priority === "critical") {
      this.taskQueue.unshift(task) // Add back to front of queue
      task.status = "pending"
      task.assignedAgents = []
    }

    this.emit("task_failed", task)
  }

  private updateAgentLearning(agent: Agent, task: Task, success: boolean) {
    // Simple learning algorithm - improve capabilities based on task outcomes
    task.requiredCapabilities.forEach((capType) => {
      const capability = agent.capabilities.find((cap) => cap.type === capType)
      if (capability) {
        const improvement = success ? 0.01 : -0.005 // Small incremental learning
        const newLevel = Math.max(1, Math.min(10, capability.level + improvement))

        if (newLevel !== capability.level) {
          capability.level = newLevel
          agent.learningData.adaptations.push({
            capability: capType,
            improvement,
            timestamp: new Date(),
          })
        }
      }
    })

    // Update performance metrics
    const recentTasks = agent.learningData.taskHistory.slice(-10)
    agent.performance.successRate = recentTasks.filter((t) => t.success).length / recentTasks.length
    agent.performance.averageCompletionTime = recentTasks.reduce((acc, t) => acc + t.duration, 0) / recentTasks.length
    agent.performance.efficiency =
      agent.performance.successRate * (1 / Math.max(1, agent.performance.averageCompletionTime / 1000))
  }

  // Dynamic Agent Management
  private considerAgentSpawning(task: Task) {
    // Check if we need to spawn new agents for unmet demand
    const systemLoad = this.calculateSystemLoad()

    if (systemLoad > 0.8 && this.agents.size < 20) {
      // Max 20 agents
      this.spawnNewAgent(task.requiredCapabilities[0])
    }
  }

  private spawnNewAgent(primaryCapability: AgentCapability["type"]) {
    const agentId = `${primaryCapability}-${Date.now().toString().slice(-3)}`
    const newAgent: Agent = {
      id: agentId,
      name: `${primaryCapability.toUpperCase()} Agent ${agentId.slice(-3)}`,
      capabilities: [
        {
          type: primaryCapability,
          level: 5 + Math.random() * 3, // Random level 5-8
          specializations: this.getDefaultSpecializations(primaryCapability),
          resourceCost: 2 + Math.random() * 2,
          maxConcurrentTasks: 3 + Math.floor(Math.random() * 3),
        },
      ],
      status: "idle",
      currentTasks: [],
      performance: {
        tasksCompleted: 0,
        averageCompletionTime: 0,
        successRate: 0.8 + Math.random() * 0.15,
        efficiency: 0.7 + Math.random() * 0.2,
        lastActive: new Date(),
      },
      resources: { cpu: 0.1, memory: 0.2, network: 0.1 },
      location: {
        x: 100 + Math.random() * 500,
        y: 50 + Math.random() * 300,
      },
      connections: [],
      learningData: { taskHistory: [], adaptations: [] },
    }

    this.agents.set(agentId, newAgent)
    this.emit("agent_spawned", newAgent)
  }

  // Utility Methods
  private getMaxConcurrentTasks(agent: Agent): number {
    return agent.capabilities.reduce((max, cap) => Math.max(max, cap.maxConcurrentTasks), 1)
  }

  private checkResourceAvailability(agent: Agent, task: Task): boolean {
    const requiredResources = task.complexity * 0.1
    return agent.resources.cpu + requiredResources < 0.9 && agent.resources.memory + requiredResources < 0.9
  }

  private estimateExecutionTime(task: Task): number {
    return task.complexity * 1000 + Math.random() * 2000 // 1-3 seconds base + complexity
  }

  private calculateSystemLoad(): number {
    const totalAgents = this.agents.size
    const busyAgents = Array.from(this.agents.values()).filter(
      (a) => a.status === "busy" || a.status === "overloaded",
    ).length
    return totalAgents > 0 ? busyAgents / totalAgents : 0
  }

  private getDefaultSpecializations(type: AgentCapability["type"]): string[] {
    const specializations = {
      nlp: ["sentiment", "entity-extraction", "summarization"],
      quantum: ["optimization", "cryptography", "simulation"],
      swarm: ["coordination", "consensus", "distributed-processing"],
      compliance: ["security-audit", "policy-check", "risk-assessment"],
      copilot: ["code-generation", "debugging", "optimization"],
      analytics: ["data-mining", "pattern-recognition", "forecasting"],
      security: ["threat-detection", "vulnerability-scan", "incident-response"],
    }
    return specializations[type] || []
  }

  private updateMetrics() {
    this.metrics.averageTaskTime =
      this.completedTasks.length > 0
        ? this.completedTasks.reduce((acc, task) => acc + (task.actualDuration || 0), 0) / this.completedTasks.length
        : 0

    this.metrics.systemLoad = this.calculateSystemLoad()

    const totalCapacity = Array.from(this.agents.values()).reduce(
      (acc, agent) => acc + this.getMaxConcurrentTasks(agent),
      0,
    )
    const usedCapacity = Array.from(this.agents.values()).reduce((acc, agent) => acc + agent.currentTasks.length, 0)
    this.metrics.agentUtilization = totalCapacity > 0 ? usedCapacity / totalCapacity : 0

    this.metrics.networkEfficiency =
      this.completedTasks.length > 0 ? this.metrics.completedTasks / this.metrics.totalTasks : 0
  }

  private startOrchestrationLoop() {
    setInterval(() => {
      this.updateMetrics()
      this.optimizeNetwork()
      this.emit("metrics_updated", this.metrics)
    }, 1000)
  }

  private optimizeNetwork() {
    // Periodic optimization of agent network
    Array.from(this.agents.values()).forEach((agent) => {
      // Update resource usage simulation
      agent.resources.cpu = Math.max(0, agent.resources.cpu + (Math.random() - 0.5) * 0.1)
      agent.resources.memory = Math.max(0, agent.resources.memory + (Math.random() - 0.5) * 0.1)
      agent.resources.network = Math.max(0, agent.resources.network + (Math.random() - 0.5) * 0.1)
    })
  }

  // Event System
  private emit(event: string, data: any) {
    const listeners = this.listeners.get(event) || []
    listeners.forEach((listener) => listener(data))
  }

  public subscribe(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)

    return () => {
      const listeners = this.listeners.get(event) || []
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  // Public API
  public getAgents(): Agent[] {
    return Array.from(this.agents.values())
  }

  public getTasks(): Task[] {
    return Array.from(this.tasks.values())
  }

  public getMetrics(): OrchestrationMetrics {
    return { ...this.metrics }
  }

  public getTaskQueue(): Task[] {
    return [...this.taskQueue]
  }
}

export const agentOrchestrator = new AgentOrchestrator()
