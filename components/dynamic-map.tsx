"use client"

import dynamic from "next/dynamic"

const Map = dynamic(() => import("@/components/map"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full bg-muted flex items-center justify-center rounded-lg border">
      <p className="text-muted-foreground">Loading map...</p>
    </div>
  ),
})

export default Map
