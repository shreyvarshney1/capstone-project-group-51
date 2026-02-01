// =============================================
// GEO-TAGGING SERVICE
// Location detection, reverse geocoding, jurisdiction mapping
// =============================================

import { GeoLocation } from "@/types"

/**
 * Reverse geocodes coordinates to get address and jurisdiction details
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<GeoLocation> {
  try {
    // Using OpenStreetMap Nominatim API (free, no API key required)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
      {
        headers: {
          "User-Agent": "CivicConnect/1.0"
        }
      }
    )

    if (!response.ok) {
      throw new Error("Geocoding failed")
    }

    const data = await response.json()
    const address = data.address || {}

    return {
      latitude,
      longitude,
      address: data.display_name,
      ward: address.suburb || address.neighbourhood || address.village,
      block: address.city_district || address.county,
      district: address.state_district || address.county,
      state: address.state,
      pincode: address.postcode
    }
  } catch (error) {
    console.error("Reverse geocoding failed:", error)
    return {
      latitude,
      longitude
    }
  }
}

/**
 * Detects ward/district from coordinates (India-specific)
 */
export async function detectJurisdiction(
  latitude: number,
  longitude: number
): Promise<{
  ward: string | null
  block: string | null
  district: string | null
  state: string | null
}> {
  const geoData = await reverseGeocode(latitude, longitude)
  
  return {
    ward: geoData.ward || null,
    block: geoData.block || null,
    district: geoData.district || null,
    state: geoData.state || null
  }
}

/**
 * Calculates bounding box for heatmap queries
 */
export function getBoundingBox(
  centerLat: number,
  centerLng: number,
  radiusKm: number
): {
  minLat: number
  maxLat: number
  minLng: number
  maxLng: number
} {
  const latDelta = radiusKm / 111 // 1 degree = ~111km
  const lngDelta = radiusKm / (111 * Math.cos(centerLat * Math.PI / 180))

  return {
    minLat: centerLat - latDelta,
    maxLat: centerLat + latDelta,
    minLng: centerLng - lngDelta,
    maxLng: centerLng + lngDelta
  }
}

/**
 * Groups issues into clusters for map visualization
 */
export function clusterIssues(
  issues: Array<{ id: string; latitude: number; longitude: number; title: string; status: string; category: string }>,
  gridSize: number = 0.01 // ~1km grid
): Array<{
  id: string
  latitude: number
  longitude: number
  count: number
  issues: typeof issues
}> {
  const clusters: Map<string, {
    issues: typeof issues
    latSum: number
    lngSum: number
  }> = new Map()

  for (const issue of issues) {
    const gridLat = Math.floor(issue.latitude / gridSize)
    const gridLng = Math.floor(issue.longitude / gridSize)
    const key = `${gridLat},${gridLng}`

    if (!clusters.has(key)) {
      clusters.set(key, { issues: [], latSum: 0, lngSum: 0 })
    }

    const cluster = clusters.get(key)!
    cluster.issues.push(issue)
    cluster.latSum += issue.latitude
    cluster.lngSum += issue.longitude
  }

  return Array.from(clusters.entries()).map(([key, cluster]) => ({
    id: key,
    latitude: cluster.latSum / cluster.issues.length,
    longitude: cluster.lngSum / cluster.issues.length,
    count: cluster.issues.length,
    issues: cluster.issues
  }))
}

/**
 * Generates heatmap data from issues
 */
export function generateHeatmapData(
  issues: Array<{ latitude: number; longitude: number; priority?: string; voteCount?: number }>
): Array<{ lat: number; lng: number; intensity: number }> {
  return issues.map(issue => {
    let intensity = 0.5

    // Increase intensity based on priority
    if (issue.priority === "CRITICAL") intensity = 1.0
    else if (issue.priority === "URGENT") intensity = 0.9
    else if (issue.priority === "HIGH") intensity = 0.75
    else if (issue.priority === "MEDIUM") intensity = 0.5
    else intensity = 0.3

    // Boost intensity based on votes
    if (issue.voteCount) {
      intensity = Math.min(intensity + (issue.voteCount / 100) * 0.3, 1)
    }

    return {
      lat: issue.latitude,
      lng: issue.longitude,
      intensity
    }
  })
}

/**
 * Indian states list for validation
 */
export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  // Union Territories
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
]

/**
 * Validates if coordinates are within India's boundaries
 */
export function isWithinIndia(latitude: number, longitude: number): boolean {
  // Approximate bounding box for India
  const INDIA_BOUNDS = {
    minLat: 6.5,
    maxLat: 35.7,
    minLng: 68.1,
    maxLng: 97.4
  }

  return (
    latitude >= INDIA_BOUNDS.minLat &&
    latitude <= INDIA_BOUNDS.maxLat &&
    longitude >= INDIA_BOUNDS.minLng &&
    longitude <= INDIA_BOUNDS.maxLng
  )
}

/**
 * Gets nearby issues within a radius
 */
export function getNearbyIssues<T extends { latitude: number; longitude: number }>(
  issues: T[],
  centerLat: number,
  centerLng: number,
  radiusMeters: number
): T[] {
  return issues.filter(issue => {
    const distance = haversineDistance(
      centerLat, centerLng,
      issue.latitude, issue.longitude
    )
    return distance <= radiusMeters
  })
}

/**
 * Haversine formula for distance calculation
 */
function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lon2 - lon1) * Math.PI / 180

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

  return R * c
}
