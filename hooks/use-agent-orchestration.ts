"use client"

import { useState, useEffect, useCallback } from "react"
import { agentOrchestrator, type Agent, type Task, type OrchestrationMetrics } from "@/lib/agent-orchestrator"

export function useAgentOrchestration() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [metrics, setMetrics] = useState<OrchestrationMetrics>({
    totalTasks: 0,
    completedTasks: 0,
    failedTasks: 0,
    averageTaskTime: 0,
    systemLoad: 0,
    agentUtilization: 0,
    networkEfficiency: 0,
    queueLength: 0,
  })
  const [taskQueue, setTaskQueue] = useState<Task[]>([])

  useEffect(() => {
    // Initial data load
    setAgents(agentOrchestrator.getAgents())
    setTasks(agentOrchestrator.getTasks())
    setMetrics(agentOrchestrator.getMetrics())
    setTaskQueue(agentOrchestrator.getTaskQueue())

    // Subscribe to orchestrator events
    const unsubscribeMetrics = agentOrchestrator.subscribe("metrics_updated", (newMetrics) => {
      setMetrics(newMetrics)
    })

    const unsubscribeTaskSubmitted = agentOrchestrator.subscribe("task_submitted", () => {
      setTasks(agentOrchestrator.getTasks())
      setTaskQueue(agentOrchestrator.getTaskQueue())
    })

    const unsubscribeTaskCompleted = agentOrchestrator.subscribe("task_completed", () => {
      setTasks(agentOrchestrator.getTasks())
      setTaskQueue(agentOrchestrator.getTaskQueue())
    })

    const unsubscribeTaskFailed = agentOrchestrator.subscribe("task_failed", () => {
      setTasks(agentOrchestrator.getTasks())
      setTaskQueue(agentOrchestrator.getTaskQueue())
    })

    const unsubscribeAgentSpawned = agentOrchestrator.subscribe("agent_spawned", () => {
      setAgents(agentOrchestrator.getAgents())
    })

    const unsubscribeTaskAssigned = agentOrchestrator.subscribe("task_assigned", () => {
      setAgents(agentOrchestrator.getAgents())
      setTaskQueue(agentOrchestrator.getTaskQueue())
    })

    // Periodic updates
    const interval = setInterval(() => {
      setAgents(agentOrchestrator.getAgents())
      setTasks(agentOrchestrator.getTasks())
      setTaskQueue(agentOrchestrator.getTaskQueue())
    }, 2000)

    return () => {
      unsubscribeMetrics()
      unsubscribeTaskSubmitted()
      unsubscribeTaskCompleted()
      unsubscribeTaskFailed()
      unsubscribeAgentSpawned()
      unsubscribeTaskAssigned()
      clearInterval(interval)
    }
  }, [])

  const submitTask = useCallback((task: Omit<Task, "id" | "status" | "assignedAgents" | "createdAt">) => {
    return agentOrchestrator.submitTask(task)
  }, [])

  const submitNLPTask = useCallback(
    (content: string, priority: Task["priority"] = "medium") => {
      return submitTask({
        type: "nlp_analysis",
        priority,
        complexity: 5,
        requiredCapabilities: ["nlp"],
        payload: { content },
        dependencies: [],
        estimatedDuration: 2000,
      })
    },
    [submitTask],
  )

  const submitQuantumTask = useCallback(
    (problem: string, priority: Task["priority"] = "high") => {
      return submitTask({
        type: "quantum_optimization",
        priority,
        complexity: 8,
        requiredCapabilities: ["quantum"],
        payload: { problem },
        dependencies: [],
        estimatedDuration: 5000,
      })
    },
    [submitTask],
  )

  const submitSwarmTask = useCallback(
    (coordination: string, priority: Task["priority"] = "medium") => {
      return submitTask({
        type: "swarm_coordination",
        priority,
        complexity: 6,
        requiredCapabilities: ["swarm"],
        payload: { coordination },
        dependencies: [],
        estimatedDuration: 3000,
      })
    },
    [submitTask],
  )

  const submitComplianceTask = useCallback(
    (audit: string, priority: Task["priority"] = "high") => {
      return submitTask({
        type: "compliance_check",
        priority,
        complexity: 4,
        requiredCapabilities: ["compliance"],
        payload: { audit },
        dependencies: [],
        estimatedDuration: 1500,
      })
    },
    [submitTask],
  )

  const getAgentsByStatus = useCallback(
    (status: Agent["status"]) => {
      return agents.filter((agent) => agent.status === status)
    },
    [agents],
  )

  const getTasksByStatus = useCallback(
    (status: Task["status"]) => {
      return tasks.filter((task) => task.status === status)
    },
    [tasks],
  )

  const getAgentPerformance = useCallback(
    (agentId: string) => {
      const agent = agents.find((a) => a.id === agentId)
      return agent?.performance
    },
    [agents],
  )

  return {
    agents,
    tasks,
    metrics,
    taskQueue,
    submitTask,
    submitNLPTask,
    submitQuantumTask,
    submitSwarmTask,
    submitComplianceTask,
    getAgentsByStatus,
    getTasksByStatus,
    getAgentPerformance,
  }
}
