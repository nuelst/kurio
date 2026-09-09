export interface RealtimeEvent<T> {
  id: string
  resource: string
  version: number
  data: T
}

export function createEventVersionTracker() {
  const versions = new Map<string, number>()

  return {
    accept<T>(event: RealtimeEvent<T>): boolean {
      const lastVersion = versions.get(event.id) ?? -1
      if (event.version <= lastVersion) return false
      versions.set(event.id, event.version)
      return true
    },
    reset(): void {
      versions.clear()
    },
  }
}
