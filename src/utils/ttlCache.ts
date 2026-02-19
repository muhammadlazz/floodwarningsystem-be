type CacheEntry<T> = {
  value: T
  expiresAt: number
}

export class TtlCache {
  private store = new Map<string, CacheEntry<any>>()

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key)
    if (!entry) return undefined
    if (Date.now() >= entry.expiresAt) {
      this.store.delete(key)
      return undefined
    }
    return entry.value as T
  }

  set<T>(key: string, value: T, ttlMs: number) {
    const ttl = Number.isFinite(ttlMs) && ttlMs > 0 ? ttlMs : 0
    this.store.set(key, { value, expiresAt: Date.now() + ttl })
  }

  delete(key: string) {
    this.store.delete(key)
  }

  deleteByPrefix(prefix: string) {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key)
    }
  }

  async getOrSet<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
    const cached = this.get<T>(key)
    if (cached !== undefined) return cached
    const value = await loader()
    this.set(key, value, ttlMs)
    return value
  }
}

export const appCache = new TtlCache()

