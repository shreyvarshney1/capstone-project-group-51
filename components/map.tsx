"use client"

import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef, useCallback } from "react"
import {
  HeatmapControls,
  HeatmapLegend,
  useHeatmapData
} from "@/components/heatmap-controls"

// Type for layer visibility state
interface LayerState {
  heatmap: boolean
  clusters: boolean
  pins: boolean
}

// MarkerClusterGroup - dynamically imported
import type { MarkerClusterGroup as MarkerClusterGroupType } from "leaflet"

// Fix for default marker icons in Next.js
const iconUrl = "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png"
const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png"
const shadowUrl = "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png"

const defaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

L.Marker.prototype.options.icon = defaultIcon

// Status color mapping for custom markers
const statusColors: Record<string, string> = {
  PENDING: "#f59e0b",
  ACKNOWLEDGED: "#3b82f6",
  ASSIGNED: "#8b5cf6",
  IN_PROGRESS: "#06b6d4",
  RESOLVED: "#22c55e",
  CLOSED: "#6b7280",
  REJECTED: "#ef4444",
  REOPENED: "#f97316",
  ESCALATED: "#dc2626",
}

interface Issue {
  id: string
  title: string
  description: string
  status: string
  priority?: string
  latitude: number
  longitude: number
  category: {
    id: string
    name: string
  }
  createdAt?: string
  voteCount?: number
}

interface Category {
  id: string
  name: string
}

interface MapProps {
  issues?: Issue[]
  showControls?: boolean
  height?: string
  categories?: Category[]
  customCenter?: { lat: number; lng: number }
  onLocationSelect?: (lat: number, lng: number) => void
}

// Component to handle heatmap layer
function HeatmapLayerComponent({
  issues,
  enabled
}: {
  issues: Issue[]
  enabled: boolean
}) {
  const map = useMap()
  const heatLayerRef = useRef<any>(null)

  useEffect(() => {
    if (!enabled) {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current)
        heatLayerRef.current = null
      }
      return
    }

    // Dynamically import leaflet.heat
    import("leaflet.heat").then(() => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current)
      }

      const heatData = issues.map(issue => {
        // Weight based on votes and priority
        let weight = 0.5
        if (issue.voteCount && issue.voteCount > 10) weight = 0.8
        if (issue.voteCount && issue.voteCount > 50) weight = 1.0
        if (issue.priority === "CRITICAL") weight = 1.0
        if (issue.priority === "HIGH") weight = 0.8
        return [issue.latitude, issue.longitude, weight] as [number, number, number]
      })

      // @ts-ignore - leaflet.heat extends L
      heatLayerRef.current = (L as any).heatLayer(heatData, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        gradient: {
          0.4: "blue",
          0.6: "cyan",
          0.7: "lime",
          0.8: "yellow",
          1.0: "red"
        }
      }).addTo(map)
    })

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current)
      }
    }
  }, [map, issues, enabled])

  return null
}

// Component to handle marker clustering
function MarkerClusterComponent({
  issues,
  enabled,
  showPins
}: {
  issues: Issue[]
  enabled: boolean
  showPins: boolean
}) {
  const map = useMap()
  const clusterGroupRef = useRef<MarkerClusterGroupType | null>(null)
  const markersRef = useRef<L.Marker[]>([])

  useEffect(() => {
    if (!enabled) {
      if (clusterGroupRef.current) {
        map.removeLayer(clusterGroupRef.current)
        clusterGroupRef.current = null
      }
      return
    }

    if (!showPins) {
      // Marker clustering
      import("leaflet.markercluster").then(() => {
        // Add MarkerCluster CSS
        if (typeof document !== "undefined") {
          const existingLink = document.querySelector('link[href*="MarkerCluster.css"]')
          if (!existingLink) {
            const link = document.createElement("link")
            link.rel = "stylesheet"
            link.href = "https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.css"
            document.head.appendChild(link)

            const linkDefault = document.createElement("link")
            linkDefault.rel = "stylesheet"
            linkDefault.href = "https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.Default.css"
            document.head.appendChild(linkDefault)
          }
        }

        // @ts-ignore
        const cluster = L.markerClusterGroup({
          chunkedLoading: true,
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: false,
          zoomToBoundsOnClick: true,
          maxClusterRadius: 50,
        })

        issues.forEach(issue => {
          const color = statusColors[issue.status] || "#3b82f6"
          const customIcon = L.divIcon({
            html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
            className: "custom-marker",
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          })

          const marker = L.marker([issue.latitude, issue.longitude], { icon: customIcon })
          marker.bindPopup(`
            <div class="min-w-[200px] p-2">
              <h3 class="font-semibold text-base mb-1">${issue.title}</h3>
              <div class="flex gap-1 mb-2 flex-wrap">
                <span class="text-xs px-2 py-0.5 rounded-full bg-gray-100">${issue.category.name}</span>
                <span class="text-xs px-2 py-0.5 rounded-full text-white" style="background-color: ${color}">${issue.status.replace("_", " ")}</span>
              </div>
              <p class="text-sm text-gray-600 line-clamp-2 mb-2">${issue.description.slice(0, 100)}...</p>
              <a href="/issues/${issue.id}" class="text-sm text-blue-600 hover:underline">View Details →</a>
            </div>
          `)
          cluster.addLayer(marker)
        })

        map.addLayer(cluster)
        clusterGroupRef.current = cluster
      })
    } else if (showPins) {
      // Show individual pins without clustering
      issues.forEach(issue => {
        const marker = L.marker([issue.latitude, issue.longitude], { icon: defaultIcon })
        marker.bindPopup(`
          <div class="min-w-[200px] p-2">
            <h3 class="font-semibold text-base mb-1">${issue.title}</h3>
            <div class="flex gap-1 mb-2 flex-wrap">
              <span class="text-xs px-2 py-0.5 rounded-full bg-gray-100">${issue.category.name}</span>
              <span class="text-xs px-2 py-0.5 rounded-full" style="background-color: ${statusColors[issue.status] || "#3b82f6"}; color: white">${issue.status.replace("_", " ")}</span>
            </div>
            <p class="text-sm text-gray-600 line-clamp-2 mb-2">${issue.description.slice(0, 100)}...</p>
            <a href="/issues/${issue.id}" class="text-sm text-blue-600 hover:underline">View Details →</a>
          </div>
        `)
        marker.addTo(map)
        markersRef.current.push(marker)
      })
    }

    return () => {
      markersRef.current.forEach(marker => {
        map.removeLayer(marker)
      })
      if (clusterGroupRef.current) {
        map.removeLayer(clusterGroupRef.current)
      }
    }
  }, [map, issues, enabled, showPins])

  return null
}

function LocationPicker({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  const [position, setPosition] = useState<L.LatLng | null>(null)
  
  useMapEvents({
    click(e) {
      setPosition(e.latlng)
      onSelect(e.latlng.lat, e.latlng.lng)
    },
  })

  return position === null ? null : (
    <Marker position={position} icon={defaultIcon} />
  )
}

export default function Map({
  issues = [],
  showControls = true,
  height = "600px",
  categories = [],
  customCenter,
  onLocationSelect
}: MapProps) {
  // Default center (Delhi, India)
  const defaultCenter: [number, number] = [28.6139, 77.2090]

  // Calculate center based on props, issues, or default
  const center: [number, number] = customCenter
    ? [customCenter.lat, customCenter.lng]
    : issues && issues.length > 0
      ? [issues[0].latitude, issues[0].longitude]
      : defaultCenter

  // Layer state
  const [layers, setLayers] = useState<LayerState>({
    heatmap: false,
    clusters: true,
    pins: false,
  })

  // Category filter
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Filtered issues
  const filteredIssues = selectedCategory
    ? issues.filter(issue => issue.category.id === selectedCategory)
    : issues

  // Get unique categories from issues if not provided
  const uniqueCategories: Array<{ id: string; name: string }> = categories.length > 0
    ? categories
    : issues.reduce((acc, issue) => {
      if (!acc.find(c => c.id === issue.category.id)) {
        acc.push(issue.category)
      }
      return acc
    }, [] as Array<{ id: string; name: string }>)

  // Stats for legend
  const stats = {
    total: filteredIssues.length,
    critical: filteredIssues.filter(i => i.priority === "CRITICAL").length,
    pending: filteredIssues.filter(i => i.status === "PENDING").length,
    resolved: filteredIssues.filter(i => i.status === "RESOLVED" || i.status === "CLOSED").length,
  }

  return (
    <div className="relative">
      <div className={`w-full rounded-lg overflow-hidden border shadow-sm`} style={{ height }}>
        <MapContainer
          center={center}
          zoom={13}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Heatmap Layer */}
          <HeatmapLayerComponent
            issues={filteredIssues}
            enabled={layers.heatmap}
          />

          {/* Marker Cluster or Pins */}
          <MarkerClusterComponent
            issues={filteredIssues}
            enabled={layers.clusters}
            showPins={layers.pins}
          />

          {/* Location Picker */}
          {onLocationSelect && (
            <LocationPicker onSelect={onLocationSelect} />
          )}
        </MapContainer>
      </div>

      {/* Controls Overlay */}
      {showControls && (
        <>
          <HeatmapControls
            layers={layers}
            onLayerChange={setLayers}
            categories={uniqueCategories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            stats={stats}
          />
          <HeatmapLegend isVisible={layers.heatmap} />
        </>
      )}
    </div>
  )
}

