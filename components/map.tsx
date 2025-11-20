"use client"

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

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

interface Issue {
  id: string
  title: string
  description: string
  status: string
  latitude: number
  longitude: number
  category: {
    name: string
  }
}

export default function Map({ issues }: { issues: Issue[] }) {
  // Default center (can be adjusted or set to user's location)
  const defaultCenter: [number, number] = [51.505, -0.09] // London default, should be dynamic

  // Calculate center based on issues if available
  const center: [number, number] =
    issues.length > 0
      ? [issues[0].latitude, issues[0].longitude]
      : defaultCenter

  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden border shadow-sm">
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
        {issues.map((issue) => (
          <Marker
            key={issue.id}
            position={[issue.latitude, issue.longitude]}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-semibold text-lg mb-1">{issue.title}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{issue.category.name}</Badge>
                  <Badge
                    variant={
                      issue.status === "RESOLVED"
                        ? "default" // "success" if available
                        : issue.status === "IN_PROGRESS"
                        ? "secondary" // "warning" if available
                        : "destructive"
                    }
                  >
                    {issue.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {issue.description}
                </p>
                <Button size="sm" className="w-full" asChild>
                  <Link href={`/issues/${issue.id}`}>View Details</Link>
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
