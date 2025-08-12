"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createWebSocketManager, type WebSocketMessage } from "@/lib/websocket-manager"
import { messageStore, type StoredMessage } from "@/lib/message-store"

export interface TypingIndicator {
  agentId: string
  agentName: string
  isTyping: boolean
}

export interface AgentStatus {
  id: string
  name: string
  status: "online" | "offline" | "processing" | "idle"
  lastSeen: Date
  currentTask?: string
}

export function useRealTimeChat() {
  const [messages, setMessages] = useState<StoredMessage[]>([])
  const [typingIndicators, setTypingIndicators] = useState<TypingIndicator[]>([])
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isReconnecting, setIsReconnecting] = useState(false)

  const wsManager = useRef(createWebSocketManager("ws://localhost:8080/quantum-chat"))
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // Load persisted messages
    messageStore.loadFromStorage()
    setMessages(messageStore.getMessages(50))

    // Subscribe to WebSocket events
    const unsubscribeMessage = wsManager.current.subscribe("message", handleIncomingMessage)
    const unsubscribeTyping = wsManager.current.subscribe("typing", handleTypingIndicator)
    const unsubscribePresence = wsManager.current.subscribe("presence", handlePresenceUpdate)
    const unsubscribeStatus = wsManager.current.subscribe("agent_status", handleAgentStatus)

    return () => {
      unsubscribeMessage()
      unsubscribeTyping()
      unsubscribePresence()
      unsubscribeStatus()
      wsManager.current.disconnect()
    }
  }, [])

  const handleIncomingMessage = useCallback((wsMessage: WebSocketMessage) => {
    const message: StoredMessage = {
      id: wsMessage.id,
      content: wsMessage.payload.content,
      sender: wsMessage.sender,
      agentType: wsMessage.agentType || "system",
      timestamp: new Date(wsMessage.timestamp),
      status: "delivered",
      reactions: [],
      attachments: wsMessage.payload.attachments || [],
    }

    messageStore.addMessage(message)
    setMessages((prev) => [message, ...prev])
  }, [])

  const handleTypingIndicator = useCallback((wsMessage: WebSocketMessage) => {
    const { agentId, agentName, isTyping } = wsMessage.payload

    setTypingIndicators((prev) => {
      const filtered = prev.filter((t) => t.agentId !== agentId)
      if (isTyping) {
        return [...filtered, { agentId, agentName, isTyping }]
      }
      return filtered
    })
  }, [])

  const handlePresenceUpdate = useCallback((wsMessage: WebSocketMessage) => {
    setIsConnected(wsMessage.payload.connected)
    setIsReconnecting(wsMessage.payload.reconnecting)
  }, [])

  const handleAgentStatus = useCallback((wsMessage: WebSocketMessage) => {
    const agentStatus: AgentStatus = wsMessage.payload
    setAgentStatuses((prev) => {
      const filtered = prev.filter((a) => a.id !== agentStatus.id)
      return [...filtered, agentStatus]
    })
  }, [])

  const sendMessage = useCallback(async (content: string, agentType = "user") => {
    const message: StoredMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content,
      sender: "User",
      agentType,
      timestamp: new Date(),
      status: "sending",
      reactions: [],
    }

    // Add to local store immediately
    messageStore.addMessage(message)
    setMessages((prev) => [message, ...prev])

    // Send via WebSocket
    const wsMessage: WebSocketMessage = {
      id: message.id,
      type: "message",
      payload: { content, agentType },
      timestamp: new Date(),
      sender: "User",
      agentType,
    }

    wsManager.current.send(wsMessage)

    // Update status after sending
    setTimeout(() => {
      messageStore.updateMessageStatus(message.id, "sent")
      setMessages((prev) => prev.map((m) => (m.id === message.id ? { ...m, status: "sent" } : m)))
    }, 100)
  }, [])

  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    const wsMessage: WebSocketMessage = {
      id: `typing_${Date.now()}`,
      type: "typing",
      payload: { isTyping, agentId: "user", agentName: "User" },
      timestamp: new Date(),
      sender: "User",
    }

    wsManager.current.send(wsMessage)

    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingIndicator(false)
      }, 3000)
    }
  }, [])

  const addReaction = useCallback((messageId: string, emoji: string) => {
    messageStore.addReaction(messageId, emoji, "User")
    setMessages((prev) => prev.map((m) => (m.id === messageId ? messageStore.getMessage(messageId)! : m)))

    const wsMessage: WebSocketMessage = {
      id: `reaction_${Date.now()}`,
      type: "reaction",
      payload: { messageId, emoji, userId: "User" },
      timestamp: new Date(),
      sender: "User",
    }

    wsManager.current.send(wsMessage)
  }, [])

  const searchMessages = useCallback((query: string) => {
    return messageStore.searchMessages(query)
  }, [])

  const loadMoreMessages = useCallback(() => {
    const currentCount = messages.length
    const moreMessages = messageStore.getMessages(20, currentCount)
    setMessages((prev) => [...prev, ...moreMessages])
  }, [messages.length])

  return {
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
    clearHistory: () => {
      messageStore.clearHistory()
      setMessages([])
    },
  }
}
