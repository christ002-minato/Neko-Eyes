import * as THREE from 'three'
import type { ADM0Data, Country } from './geoJsonTypes.ts'

const COUNTRIES_GLOBE_URL = '/data/processed/countries-adm0-globe.json'

let countriesCache: Country[] | null = null

export async function loadCountriesGlobe(): Promise<Country[]> {
  if (countriesCache) {
    return countriesCache
  }

  const response = await fetch(COUNTRIES_GLOBE_URL)
  if (!response.ok) {
    throw new Error(`Failed to load countries-adm0-globe.json: ${response.status}`)
  }

  const data = await response.json() as ADM0Data
  const countries: Country[] = data.features.map((feature: any) => {
    const { id, name } = feature.properties
    const geometry = feature.geometry

    return {
      id,
      name,
      geometry: {
        type: geometry.type,
        coordinates: geometry.coordinates,
      },
    }
  })

  countriesCache = countries
  return countries
}

export function getCountriesGlobe(): Country[] | null {
  return countriesCache
}