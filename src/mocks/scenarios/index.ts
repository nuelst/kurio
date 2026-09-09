export type ScenarioId = 'default' | 'empty' | 'latency' | 'error'

const STORAGE_KEY = 'nft-marketplace.scenario'

export function getScenario(): ScenarioId {
  if (typeof localStorage === 'undefined') return 'default'
  return (localStorage.getItem(STORAGE_KEY) as ScenarioId | null) ?? 'default'
}

export function setScenario(scenario: ScenarioId): void {
  localStorage.setItem(STORAGE_KEY, scenario)
}
