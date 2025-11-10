"use client"

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { Report } from '@prisma/client'
import L from 'leaflet'

const icon = L.icon({ iconUrl: "/marker-icon.png" });

type Props = {
  reports: Report[]
}

const MapView = ({ reports }: Props) => {
  return (
    <MapContainer
      center={[51.505, -0.09]}
      zoom={13}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {reports.map((report) => (
        <Marker
          key={report.id}
          position={[report.latitude, report.longitude]}
          icon={icon}
        >
          <Popup>
            <h3 className="font-bold">{report.title}</h3>
            <p>{report.description}</p>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

export default MapView