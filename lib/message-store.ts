export interface StoredMessage {
  id: string
  content: string
  sender: string
  agentType: string
  timestamp: Date
  status: "sending" | "sent" | "delivered" | "read" | "failed"
  reactions: { emoji: string; users: string[] }[]
  threadId?: string
  parentId?: string
  attachments?: { type: string; url: string; name: string }[]
  metadata?: Record<string, any>
}

export interface MessageThread {
  id: string
  parentMessageId: string
  messages: StoredMessage[]
  participants: string[]
  lastActivity: Date
}

class MessageStore {
  private messages: Map<string, StoredMessage> = new Map()
  private threads: Map<string, MessageThread> = new Map()
  private messagesByAgent: Map<string, string[]> = new Map()
  private searchIndex: Map<string, Set<string>> = new Map()

  // Message operations
  addMessage(message: StoredMessage): void {
    this.messages.set(message.id, message)

    // Update agent index
    if (!this.messagesByAgent.has(message.agentType)) {
      this.messagesByAgent.set(message.agentType, [])
    }
    this.messagesByAgent.get(message.agentType)!.push(message.id)

    // Update search index
    this.updateSearchIndex(message)

    // Save to localStorage for persistence
    this.persistToStorage()
  }

  getMessage(id: string): StoredMessage | undefined {
    return this.messages.get(id)
  }

  getMessages(limit?: number, offset?: number): StoredMessage[] {
    const allMessages = Array.from(this.messages.values()).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    if (limit) {
      return allMessages.slice(offset || 0, (offset || 0) + limit)
    }
    return allMessages
  }

  getMessagesByAgent(agentType: string): StoredMessage[] {
    const messageIds = this.messagesByAgent.get(agentType) || []
    return messageIds.map((id) => this.messages.get(id)!).filter(Boolean)
  }

  updateMessageStatus(id: string, status: StoredMessage["status"]): void {
    const message = this.messages.get(id)
    if (message) {
      message.status = status
      this.persistToStorage()
    }
  }

  addReaction(messageId: string, emoji: string, userId: string): void {
    const message = this.messages.get(messageId)
    if (message) {
      const existingReaction = message.reactions.find((r) => r.emoji === emoji)
      if (existingReaction) {
        if (!existingReaction.users.includes(userId)) {
          existingReaction.users.push(userId)
        }
      } else {
        message.reactions.push({ emoji, users: [userId] })
      }
      this.persistToStorage()
    }
  }

  // Thread operations
  createThread(parentMessageId: string): string {
    const threadId = `thread_${Date.now()}`
    const thread: MessageThread = {
      id: threadId,
      parentMessageId,
      messages: [],
      participants: [],
      lastActivity: new Date(),
    }
    this.threads.set(threadId, thread)
    return threadId
  }

  addToThread(threadId: string, message: StoredMessage): void {
    const thread = this.threads.get(threadId)
    if (thread) {
      thread.messages.push(message)
      if (!thread.participants.includes(message.sender)) {
        thread.participants.push(message.sender)
      }
      thread.lastActivity = new Date()
    }
  }

  // Search functionality
  private updateSearchIndex(message: StoredMessage): void {
    const words = message.content.toLowerCase().split(/\s+/)
    words.forEach((word) => {
      if (word.length > 2) {
        if (!this.searchIndex.has(word)) {
          this.searchIndex.set(word, new Set())
        }
        this.searchIndex.get(word)!.add(message.id)
      }
    })
  }

  searchMessages(query: string): StoredMessage[] {
    const words = query.toLowerCase().split(/\s+/)
    const matchingIds = new Set<string>()

    words.forEach((word) => {
      const ids = this.searchIndex.get(word)
      if (ids) {
        ids.forEach((id) => matchingIds.add(id))
      }
    })

    return Array.from(matchingIds)
      .map((id) => this.messages.get(id)!)
      .filter(Boolean)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  // Persistence
  private persistToStorage(): void {
    try {
      const data = {
        messages: Array.from(this.messages.entries()),
        threads: Array.from(this.threads.entries()),
        messagesByAgent: Array.from(this.messagesByAgent.entries()),
      }
      localStorage.setItem("quantum-chat-messages", JSON.stringify(data))
    } catch (error) {
      console.error("Failed to persist messages:", error)
    }
  }

  loadFromStorage(): void {
    try {
      const data = localStorage.getItem("quantum-chat-messages")
      if (data) {
        const parsed = JSON.parse(data)
        this.messages = new Map(parsed.messages)
        this.threads = new Map(parsed.threads)
        this.messagesByAgent = new Map(parsed.messagesByAgent)

        // Rebuild search index
        this.messages.forEach((message) => this.updateSearchIndex(message))
      }
    } catch (error) {
      console.error("Failed to load messages from storage:", error)
    }
  }

  clearHistory(): void {
    this.messages.clear()
    this.threads.clear()
    this.messagesByAgent.clear()
    this.searchIndex.clear()
    localStorage.removeItem("quantum-chat-messages")
  }
}

export const messageStore = new MessageStore()
