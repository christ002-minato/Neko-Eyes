import type { EphemerisState, SceneEphemerisState } from "./types.ts"

const JPL_BASE_URL = 'https://ssd-api.jpl.nasa.gov/api/horizons.api'

/**
 * Mapping des identifiants de corps vers les IDs JPL Horizons.
 * La Terre utilise l'ID 399 (héliocentrique).
 */
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

/**
 * Convertit le temps simulé (unités heures) en date JPL.
 * L'époque (simTime = 0) correspond au 19 août 2025,
 * tel que affiché dans l'interface TimeControlBar.
 */
function simulationTimeToDate(simulationTime: number): string {
  // Époque de référence : 19 août 2025 00:00:00 UTC
  const epoch = new Date(Date.UTC(2025, 7, 19, 0, 0, 0))
  const date = new Date(epoch.getTime() + simulationTime * 3600000)
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Parse la réponse de l'API JPL Horizons et extrait l'état épimérique.
 */
function parseJPLResponse(data: any, bodyId: string): EphemerisState | null {
  try {
    const result = data?.result?.[0]
    if (!result || !result.data?.[0]) return null

    const row = result.data[0]
    // JPL renvoie les positions en unités astronomiques (AU)
    // Vecteur de position : x, y, z
    const positionX = parseFloat(row.x)
    const positionY = parseFloat(row.y)
    const positionZ = parseFloat(row.z)

    if (isNaN(positionX) || isNaN(positionY) || isNaN(positionZ)) return null

    // Unité par défaut : UA (astronomiques)
    // Vitesse optionnelle
    const vx = row.vx ? parseFloat(row.vx) : NaN
    const vy = row.vy ? parseFloat(row.vy) : NaN
    const vz = row.vz ? parseFloat(row.vz) : NaN

    const hasVelocity = !isNaN(vx) || !isNaN(vy) || !isNaN(vz)

    const unit: string = 'AU'
    const referenceFrame: string = 'J2000'

    return {
      position: [positionX, positionY, positionZ] as [number, number, number],
      velocity: hasVelocity ? [vx, vy, vz] as [number, number, number] : undefined,
      unit,
      referenceFrame,
      epoch: result?.datetime?.[0] ?? undefined,
      bodyId,
    }
  } catch (e) {
    console.error('Erreur parsing réponse JPL:', e)
    return null
  }
}

export class JPLProvider {
  /** Cache mémoire : bodyId -> EphemerisState */
  private cache: Map<string, EphemerisState> = new Map()
  /** Timeout par défaut en ms pour les requêtes JPL */
  private defaultTimeout: number = 10000
  /** Indique si le provider est en mode dégradé (cache uniquement) */
  private degradedMode: boolean = false
  /** Contrôle d'annulation pour les requêtes timeout */
  private abortController: AbortController | undefined

  /**
   * Crée une nouvelle instance de JPLProvider.
   *
   * @param options Options de configuration
   */
  constructor(options?: {
    defaultTimeout?: number
    degradedMode?: boolean
    /** Cache prérempli pour le prototype Earth */
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
    this.abortController = undefined
  }

  /**
   * Récupère l'état épimérique d'un corps à un instant donné.
   * Utilise un cache mémoire pour éviter les requêtes réseau répétées.
   *
   * @param bodyId Identifiant du corps (ex. : "earth", "moon")
   * @param simulationTime Temps simulé actuel (unités de l'application Neko Eyes)
   * @returns État épimérique du corps, ou null si inconnu
   */
  async getState(
    bodyId: string,
    simulationTime: number,
  ): Promise<EphemerisState | null> {
    // Vérifier d'abord le cache
    const cached = this.cache.get(bodyId)
    if (cached !== undefined) {
      return cached
    }

    if (this.degradedMode) {
      return null
    }

    const jplBodyId = jplIdForBody(bodyId)
    if (!jplBodyId) {
      // BodyId inconnu → retour null (non critique, le modèle orbital continue)
      return null
    }

try {
      const date = simulationTimeToDate(simulationTime)

      const params = new URLSearchParams({
        id: jplBodyId,
        format: 'json',
        epoch_type: 'date',
        date: date,
      })

      // Reset abort controller for this request
      this.abortController = new AbortController()
      const timeoutId = setTimeout(
        () => this.abortController!.abort(),
        this.defaultTimeout
      )

      const response = await fetch(`${JPL_BASE_URL}?${params}`, {
        signal: this.abortController.signal,
        headers: {
          'Accept': 'application/json',
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        // En cas d'erreur réseau ou API, passer en mode dégradé
        this.degradedMode = true
        return null
      }

      const data = await response.json()
      const state = parseJPLResponse(data, bodyId)

      if (state) {
        // Mettre en cache le résultat
        this.cache.set(bodyId, state)
      }
      return state
    } catch (error) {
      // Erreur réseau ou inattendue → mode dégradé
      if (!this.degradedMode) {
        this.degradedMode = true
      }
      return null
    }
  }

  /**
   * Convertit un état épimérique brut en état compatible avec la scène Three.js.
   *
   * @param state État épimérique brut depuis le provider
   * @returns État simplifié consommable par le modèle orbital Three.js
   */
  toSceneState(state: EphemerisState): SceneEphemerisState {
    if (!state) {
      return { position: [0, 0, 0], bodyId: '' }
    }

    const position: [number, number, number] = [
      state.position[0],
      state.position[1],
      state.position[2],
    ]

    return {
      position,
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
