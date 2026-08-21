import type { OrbitalBody, OrbitalBodyDefinition, Vec3 } from "./types.ts"

/**
 * Wire a flat authoring definition into an hierarchical OrbitalBody graph.
 * Parents are resolved by id from the definitions map.
 * Bodies without a parentId (or whose parentId is not found) become roots.
 */
export function defineOrbitalSystem(
  definitions: OrbitalBodyDefinition[],
): OrbitalBody[] {
  const byId = new Map(definitions.map((d) => [d.id, d]))

  function resolve(bodyId: string, visited = new Set<string>()): OrbitalBody | null {
    if (visited.has(bodyId)) return null
    visited.add(bodyId)

    const def = byId.get(bodyId)
    if (!def) return null

    let parent: OrbitalBody | undefined
    if (def.parentId) {
      const resolvedParent = resolve(def.parentId, new Set([bodyId]))
      if (resolvedParent) {
        parent = resolvedParent
        // Ensure parent is the resolved version (with its own parent chain)
        ;(parent as any).parent = parent.parent
      }
    }

    return {
      id: def.id,
      orbitalRadius: def.orbitalRadius,
      orbitalPeriod: def.orbitalPeriod,
      phase: def.phase,
      rotationPeriod: def.rotationPeriod,
      parent,
    }
  }

  const result: OrbitalBody[] = []
  for (const def of definitions) {
    const resolved = resolve(def.id)
    if (resolved) result.push(resolved)
  }
  return result
}