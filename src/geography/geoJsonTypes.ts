export interface CountryGeometry {
  type: 'Polygon' | 'MultiPolygon'
  coordinates: number[][]
}

export interface Country {
  id: string
  name: string
  geometry: CountryGeometry
}

export interface ADM0Data {
  type: 'FeatureCollection'
  features: Array<{
    type: 'Feature'
    properties: {
      shapeGroup: string
      shapeType: string
      shapeName: string
    }
    geometry: {
      type: 'Polygon' | 'MultiPolygon'
      coordinates: number[][]
    }
  }>
}