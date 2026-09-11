import type { EphemerisState, SceneEphemerisState } from "./types.ts"
import { simulationTimeToDateStr } from "../../time.ts"

const JPL_BASE_URL = '/api/jpl'

const JPL_BODY_IDS: Record<string, string> = {
  earth: '399',
  moon: '301',
  mercury: '199',
  venus: '299',
  mars: '499',
  jupiter: '599',
  saturn: '699',
  uranus: '799',
  neptune: '899',
}

function jplIdForBody(bodyId: string): string | undefined {
  return JPL_BODY_IDS[bodyId]
}

function parseJPLResponse(data: any, bodyId: string): EphemerisState | null {
  try {
    if (data && Array.isArray(data.position) && data.position.length >= 3) {
      const [x, y, z] = data.position
      const arrX = Number(x)
      const arrY = Number(y)
      const arrZ = Number(z)
      if ([arrX, arrY, arrZ].some(Number.isNaN)) return null

      return {
        position: [arrX, arrY, arrZ] as [number, number, number],
        velocity: Array.isArray(data.velocity) && data.velocity.length >= 3
          ? [Number(data.velocity[0]), Number(data.velocity[1]), Number(data.velocity[2])] as [number, number, number]
          : undefined,
        unit: data.unit ?? 'AU',
        referenceFrame: data.referenceFrame ?? 'ICRF',
        epoch: data.epoch ?? undefined,
        bodyId,
      }
    }

    const result = data?.result?.[0] ?? data?.result
    const rows = Array.isArray(result?.data) ? result.data : []
    const row = rows.find((entry: any) => Array.isArray(entry) || (entry && typeof entry === 'object' && entry.x !== undefined))

    if (!row) return null

    const position = Array.isArray(row)
      ? [Number(row[1]), Number(row[2]), Number(row[3])]
      : [Number(row.x), Number(row.y), Number(row.z)]

    if (position.some(Number.isNaN)) return null

    const velocity = Array.isArray(row)
      ? [Number(row[4] ?? 0), Number(row[5] ?? 0), Number(row[6] ?? 0)]
      : [Number(row.vx ?? 0), Number(row.vy ?? 0), Number(row.vz ?? 0)]

    return {
      position: [position[0], position[1], position[2]] as [number, number, number],
      velocity: [velocity[0], velocity[1], velocity[2]] as [number, number, number],
      unit: 'AU',
      referenceFrame: 'ICRF',
      epoch: typeof row === 'object' ? (row.epoch ?? row.datetime ?? undefined) : undefined,
      bodyId,
    }
  } catch (error) {
    console.error('Erreur parsing réponse JPL proxy:', error)
    return null
  }
}

export class JPLProvider {
  private cache: Map<string, EphemerisState> = new Map()
  private defaultTimeout: number = 10000
  private degradedMode: boolean = false
  private abortController: AbortController | undefined
  private queue: Promise<unknown> = Promise.resolve()

  constructor(options?: {
    defaultTimeout?: number
    degradedMode?: boolean
    initialCache?: Map<string, EphemerisState>
  }) {
    if (options?.defaultTimeout !== undefined) {
      this.defaultTimeout = options.defaultTimeout
    }
    if (options?.degradedMode !== undefined) {
      this.degradedMode = options.degradedMode
    }
    if (options?.initialCache instanceof Map) {
      for (const [key, value] of options.initialCache.entries()) {
        this.cache.set(key, value)
      }
    }
  }

  async getState(bodyId: string, simulationTime: number): Promise<EphemerisState | null> {
    const cached = this.cache.get(bodyId)
    if (cached !== undefined) {
      return cached
    }

    if (this.degradedMode) {
      return null
    }

    const jplBodyId = jplIdForBody(bodyId)
    if (!jplBodyId) {
      return null
    }

    const task = async () => {
      try {
        const date = simulationTimeToDateStr(simulationTime)
        const params = new URLSearchParams({
          bodyId,
          date,
        })

        this.abortController = new AbortController()
        const timeoutId = setTimeout(() => this.abortController?.abort(), this.defaultTimeout)

        const response = await fetch(`${JPL_BASE_URL}?${params.toString()}`, {
          signal: this.abortController.signal,
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          this.degradedMode = true
          return null
        }

        const data = await response.json()
        const state = parseJPLResponse(data, bodyId)

        if (state) {
          this.cache.set(bodyId, state)
        }

        return state
      } catch (error) {
        if (!this.degradedMode) {
          this.degradedMode = true
        }
        return null
      }
    }

    const previous = this.queue
    this.queue = previous.then(task, task)
    return await this.queue.then(() => task())
  }

  toSceneState(state: EphemerisState): SceneEphemerisState {
    if (!state) {
      return { position: [0, 0, 0], bodyId: '' }
    }

    return {
      position: [state.position[0], state.position[1], state.position[2]],
      bodyId: state.bodyId,
    }
  }

  setCache(bodyId: string, state: EphemerisState): void {
    this.cache.set(bodyId, state)
  }

  clearCache(): void {
    this.cache.clear()
  }

  getCachedState(bodyId: string): EphemerisState | undefined {
    return this.cache.get(bodyId)
  }

  hasCache(bodyId: string): boolean {
    return this.cache.has(bodyId)
  }
}
