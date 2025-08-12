interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  hits: number
  size: number
}

interface CacheStats {
  totalEntries: number
  totalSize: number
  hitRate: number
  missRate: number
  evictions: number
}

export class CacheManager {
  private static instance: CacheManager
  private cache = new Map<string, CacheEntry<any>>()
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
  }
  private maxSize: number
  private maxEntries: number
  private cleanupInterval: NodeJS.Timeout

  static getInstance(maxSize = 50 * 1024 * 1024, maxEntries = 1000): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager(maxSize, maxEntries)
    }
    return CacheManager.instance
  }

  constructor(maxSize: number, maxEntries: number) {
    this.maxSize = maxSize
    this.maxEntries = maxEntries

    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(
      () => {
        this.cleanup()
      },
      5 * 60 * 1000,
    )
  }

  set<T>(key: string, data: T, ttl = 5 * 60 * 1000): void {
    const size = this.calculateSize(data)
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      hits: 0,
      size,
    }

    // Check if we need to evict entries
    this.evictIfNeeded(size)

    this.cache.set(key, entry)
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      this.stats.misses++
      return null
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      this.stats.misses++
      return null
    }

    // Update hit count and stats
    entry.hits++
    this.stats.hits++

    return entry.data
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
    this.stats = { hits: 0, misses: 0, evictions: 0 }
  }

  // Advanced caching with async data fetching
  async getOrSet<T>(key: string, fetcher: () => Promise<T>, ttl = 5 * 60 * 1000): Promise<T> {
    const cached = this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    const data = await fetcher()
    this.set(key, data, ttl)
    return data
  }

  // Memoization helper
  memoize<Args extends any[], Return>(
    fn: (...args: Args) => Return,
    keyGenerator?: (...args: Args) => string,
    ttl = 5 * 60 * 1000,
  ): (...args: Args) => Return {
    return (...args: Args): Return => {
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)
      const cached = this.get<Return>(key)

      if (cached !== null) {
        return cached
      }

      const result = fn(...args)
      this.set(key, result, ttl)
      return result
    }
  }

  // Async memoization helper
  memoizeAsync<Args extends any[], Return>(
    fn: (...args: Args) => Promise<Return>,
    keyGenerator?: (...args: Args) => string,
    ttl = 5 * 60 * 1000,
  ): (...args: Args) => Promise<Return> {
    const pendingPromises = new Map<string, Promise<Return>>()

    return async (...args: Args): Promise<Return> => {
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)
      const cached = this.get<Return>(key)

      if (cached !== null) {
        return cached
      }

      // Check if there's already a pending promise for this key
      if (pendingPromises.has(key)) {
        return pendingPromises.get(key)!
      }

      const promise = fn(...args)
        .then((result) => {
          this.set(key, result, ttl)
          pendingPromises.delete(key)
          return result
        })
        .catch((error) => {
          pendingPromises.delete(key)
          throw error
        })

      pendingPromises.set(key, promise)
      return promise
    }
  }

  private calculateSize(data: any): number {
    // Rough estimation of object size in bytes
    const jsonString = JSON.stringify(data)
    return new Blob([jsonString]).size
  }

  private evictIfNeeded(newEntrySize: number): void {
    const currentSize = this.getCurrentSize()
    const currentEntries = this.cache.size

    // Evict if we exceed size or entry limits
    while ((currentSize + newEntrySize > this.maxSize || currentEntries >= this.maxEntries) && this.cache.size > 0) {
      this.evictLeastUsed()
    }
  }

  private evictLeastUsed(): void {
    let leastUsedKey = ""
    let leastHits = Number.POSITIVE_INFINITY
    let oldestTime = Number.POSITIVE_INFINITY

    for (const [key, entry] of this.cache.entries()) {
      // Prioritize by hits, then by age
      if (entry.hits < leastHits || (entry.hits === leastHits && entry.timestamp < oldestTime)) {
        leastUsedKey = key
        leastHits = entry.hits
        oldestTime = entry.timestamp
      }
    }

    if (leastUsedKey) {
      this.cache.delete(leastUsedKey)
      this.stats.evictions++
    }
  }

  private cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach((key) => this.cache.delete(key))
  }

  private getCurrentSize(): number {
    let totalSize = 0
    for (const entry of this.cache.values()) {
      totalSize += entry.size
    }
    return totalSize
  }

  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses
    return {
      totalEntries: this.cache.size,
      totalSize: this.getCurrentSize(),
      hitRate: totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0,
      missRate: totalRequests > 0 ? (this.stats.misses / totalRequests) * 100 : 0,
      evictions: this.stats.evictions,
    }
  }

  // Cache warming - preload frequently accessed data
  async warmCache(entries: Array<{ key: string; fetcher: () => Promise<any>; ttl?: number }>): Promise<void> {
    const promises = entries.map(async ({ key, fetcher, ttl }) => {
      try {
        const data = await fetcher()
        this.set(key, data, ttl)
      } catch (error) {
        console.error(`Failed to warm cache for key ${key}:`, error)
      }
    })

    await Promise.allSettled(promises)
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.clear()
  }
}

// Singleton instance
export const cacheManager = CacheManager.getInstance()
