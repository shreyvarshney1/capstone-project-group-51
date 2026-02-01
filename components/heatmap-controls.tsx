"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Layers, 
  Thermometer, 
  Filter,
  Eye,
  EyeOff,
  RefreshCw,
  TrendingUp
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface HeatmapPoint {
  latitude: number
  longitude: number
  intensity: number
  issueCount: number
  categoryBreakdown: Record<string, number>
}

interface ClusterData {
  centroid: { lat: number; lng: number }
  issueCount: number
  issues: Array<{
    id: string
    title: string
    category: string
    status: string
  }>
}

interface HeatmapControlsProps {
  onLayerToggle?: (layer: string, visible: boolean) => void
  onCategoryFilter?: (category: string | null) => void
  onRefresh?: () => void
  isLoading?: boolean
  categories: Array<{ id: string; name: string }>
  stats?: {
    totalIssues?: number
    total?: number
    hotspotCount?: number
    topCategory?: string
    critical?: number
    pending?: number
    resolved?: number
  }
  // Alternative props for controlled usage
  layers?: {
    heatmap: boolean
    clusters: boolean
    pins: boolean
  }
  onLayerChange?: (layers: { heatmap: boolean; clusters: boolean; pins: boolean }) => void
  selectedCategory?: string | null
  onCategoryChange?: (category: string | null) => void
}

export function HeatmapControls({
  onLayerToggle,
  onCategoryFilter,
  onRefresh,
  isLoading = false,
  categories,
  stats,
  layers: controlledLayers,
  onLayerChange,
  selectedCategory: controlledSelectedCategory,
  onCategoryChange,
}: HeatmapControlsProps) {
  const [internalLayers, setInternalLayers] = useState({
    heatmap: true,
    clusters: true,
    pins: false,
  })
  const [internalSelectedCategory, setInternalSelectedCategory] = useState<string | null>(null)

  // Use controlled or internal state
  const layers = controlledLayers || internalLayers
  const selectedCategory = controlledSelectedCategory !== undefined ? controlledSelectedCategory : internalSelectedCategory

  const toggleLayer = (layer: keyof typeof layers) => {
    const newState = !layers[layer]
    const newLayers = { ...layers, [layer]: newState }
    
    if (onLayerChange) {
      onLayerChange(newLayers)
    } else {
      setInternalLayers(newLayers)
    }
    
    if (onLayerToggle) {
      onLayerToggle(layer, newState)
    }
  }

  const handleCategoryChange = (value: string) => {
    const category = value === "all" ? null : value
    
    if (onCategoryChange) {
      onCategoryChange(category)
    } else {
      setInternalSelectedCategory(category)
    }
    
    if (onCategoryFilter) {
      onCategoryFilter(category)
    }
  }

  return (
    <Card className="absolute top-4 right-4 z-[1000] w-64 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Layers className="h-4 w-4" />
          Map Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Layer Toggles */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Layers</label>
          <div className="flex flex-wrap gap-1">
            <Button
              variant={layers.heatmap ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => toggleLayer("heatmap")}
            >
              <Thermometer className="h-3 w-3 mr-1" />
              Heatmap
            </Button>
            <Button
              variant={layers.clusters ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => toggleLayer("clusters")}
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              Clusters
            </Button>
            <Button
              variant={layers.pins ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => toggleLayer("pins")}
            >
              {layers.pins ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
              Pins
            </Button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Category Filter</label>
          <Select value={selectedCategory || "all"} onValueChange={handleCategoryChange}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        {stats && (
          <div className="space-y-2 pt-2 border-t">
            <label className="text-xs font-medium text-muted-foreground">Statistics</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-muted/50">
                <div className="font-semibold">{stats.totalIssues}</div>
                <div className="text-muted-foreground">Total Issues</div>
              </div>
              <div className="p-2 rounded bg-muted/50">
                <div className="font-semibold">{stats.hotspotCount}</div>
                <div className="text-muted-foreground">Hotspots</div>
              </div>
            </div>
            {stats.topCategory && (
              <div className="text-xs">
                <span className="text-muted-foreground">Top category: </span>
                <Badge variant="secondary" className="text-xs">
                  {stats.topCategory}
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Refresh Button */}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full h-8 text-xs"
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Loading..." : "Refresh Data"}
        </Button>
      </CardContent>
    </Card>
  )
}

// Legend component for heatmap
export function HeatmapLegend({ isVisible = true }: { isVisible?: boolean }) {
  if (!isVisible) return null
  
  return (
    <Card className="absolute bottom-8 left-4 z-[1000] shadow-lg">
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">Issue Density:</span>
          <div className="flex items-center gap-1">
            <div className="w-6 h-3 rounded bg-gradient-to-r from-green-500 via-yellow-500 to-red-500" />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Low</span>
            <span>→</span>
            <span>High</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Cluster popup content
interface ClusterPopupProps {
  cluster: ClusterData
  onIssueClick?: (issueId: string) => void
}

export function ClusterPopup({ cluster, onIssueClick }: ClusterPopupProps) {
  return (
    <div className="min-w-[200px] max-w-[300px]">
      <div className="font-semibold mb-2 flex items-center gap-2">
        <Badge variant="secondary">{cluster.issueCount} Issues</Badge>
      </div>
      <div className="space-y-1 max-h-[150px] overflow-y-auto">
        {cluster.issues.slice(0, 5).map(issue => (
          <div 
            key={issue.id}
            className="p-2 rounded bg-muted/50 hover:bg-muted cursor-pointer text-sm"
            onClick={() => onIssueClick?.(issue.id)}
          >
            <div className="font-medium line-clamp-1">{issue.title}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{issue.category}</span>
              <Badge variant="outline" className="text-xs px-1">
                {issue.status}
              </Badge>
            </div>
          </div>
        ))}
        {cluster.issueCount > 5 && (
          <div className="text-xs text-muted-foreground text-center py-1">
            +{cluster.issueCount - 5} more issues
          </div>
        )}
      </div>
    </div>
  )
}

// Hook for fetching heatmap data
export function useHeatmapData(categoryFilter?: string | null) {
  const [data, setData] = useState<{
    heatmap: HeatmapPoint[]
    clusters: ClusterData[]
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<{
    totalIssues: number
    hotspotCount: number
    topCategory: string
  } | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (categoryFilter) params.set("categoryId", categoryFilter)

      const response = await fetch(`/api/analytics?type=heatmap&${params}`)
      if (response.ok) {
        const result = await response.json()
        setData(result)

        // Calculate stats
        const totalIssues = result.clusters?.reduce(
          (sum: number, c: ClusterData) => sum + c.issueCount, 
          0
        ) || 0
        const hotspotCount = result.heatmap?.filter(
          (p: HeatmapPoint) => p.intensity > 0.7
        ).length || 0

        // Find top category
        const categoryCount: Record<string, number> = {}
        result.clusters?.forEach((cluster: ClusterData) => {
          cluster.issues.forEach(issue => {
            categoryCount[issue.category] = (categoryCount[issue.category] || 0) + 1
          })
        })
        const topCategory = Object.entries(categoryCount)
          .sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A"

        setStats({ totalIssues, hotspotCount, topCategory })
      }
    } catch (error) {
      console.error("Failed to fetch heatmap data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [categoryFilter])

  return { data, isLoading, stats, refresh: fetchData }
}
