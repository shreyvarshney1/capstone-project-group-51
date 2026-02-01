"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Users,
  Target,
  Award,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react"

interface OfficerStats {
  totalAssigned: number
  resolved: number
  pending: number
  averageResolutionTime: number // in hours
  slaCompliance: number // percentage
  escalationRate: number // percentage
  citizenRating: number // 1-5
  trend: "up" | "down" | "stable"
}

interface PerformanceScorecardProps {
  officerId?: string
  wardId?: string
  blockId?: string
  districtId?: string
  period?: "week" | "month" | "quarter" | "year"
}

export function PerformanceScorecard({
  officerId,
  wardId,
  blockId,
  districtId,
  period = "month",
}: PerformanceScorecardProps) {
  const [stats, setStats] = useState<OfficerStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState(period)

  useEffect(() => {
    fetchStats()
  }, [officerId, wardId, blockId, districtId, selectedPeriod])

  const fetchStats = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ period: selectedPeriod })
      if (officerId) params.set("officerId", officerId)
      if (wardId) params.set("wardId", wardId)
      if (blockId) params.set("blockId", blockId)
      if (districtId) params.set("districtId", districtId)

      const response = await fetch(`/api/analytics?type=performance&${params}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
      // Set mock data for demo
      setStats({
        totalAssigned: 156,
        resolved: 128,
        pending: 28,
        averageResolutionTime: 72,
        slaCompliance: 85,
        escalationRate: 12,
        citizenRating: 4.2,
        trend: "up",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <ArrowUp className="h-4 w-4 text-green-600" />
      case "down":
        return <ArrowDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getScoreColor = (score: number, thresholds: [number, number]) => {
    if (score >= thresholds[0]) return "text-green-600"
    if (score >= thresholds[1]) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBg = (score: number, thresholds: [number, number]) => {
    if (score >= thresholds[0]) return "bg-green-100 dark:bg-green-900/30"
    if (score >= thresholds[1]) return "bg-yellow-100 dark:bg-yellow-900/30"
    return "bg-red-100 dark:bg-red-900/30"
  }

  const formatDuration = (hours: number) => {
    if (hours < 24) return `${Math.round(hours)}h`
    const days = Math.round(hours / 24)
    return `${days}d`
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3 mx-auto" />
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-muted rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          No performance data available
        </CardContent>
      </Card>
    )
  }

  const resolutionRate = stats.totalAssigned > 0 
    ? Math.round((stats.resolved / stats.totalAssigned) * 100) 
    : 0

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-5 w-5" />
            Performance Scorecard
          </CardTitle>
          <div className="flex gap-1">
            {(["week", "month", "quarter", "year"] as const).map(p => (
              <Button
                key={p}
                variant={selectedPeriod === p ? "default" : "ghost"}
                size="sm"
                className="h-7 text-xs capitalize"
                onClick={() => setSelectedPeriod(p)}
              >
                {p}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Assigned */}
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              {getTrendIcon(stats.trend)}
            </div>
            <div className="text-2xl font-bold">{stats.totalAssigned}</div>
            <div className="text-xs text-muted-foreground">Total Assigned</div>
          </div>

          {/* Resolution Rate */}
          <div className={`p-4 rounded-lg ${getScoreBg(resolutionRate, [80, 60])}`}>
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className={`h-5 w-5 ${getScoreColor(resolutionRate, [80, 60])}`} />
              <Badge variant="outline" className="text-xs">
                {stats.resolved}/{stats.totalAssigned}
              </Badge>
            </div>
            <div className={`text-2xl font-bold ${getScoreColor(resolutionRate, [80, 60])}`}>
              {resolutionRate}%
            </div>
            <div className="text-xs text-muted-foreground">Resolution Rate</div>
          </div>

          {/* Avg Resolution Time */}
          <div className={`p-4 rounded-lg ${getScoreBg(100 - (stats.averageResolutionTime / 168 * 100), [70, 40])}`}>
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <Target className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{formatDuration(stats.averageResolutionTime)}</div>
            <div className="text-xs text-muted-foreground">Avg Resolution Time</div>
          </div>

          {/* SLA Compliance */}
          <div className={`p-4 rounded-lg ${getScoreBg(stats.slaCompliance, [90, 70])}`}>
            <div className="flex items-center justify-between mb-2">
              <Target className={`h-5 w-5 ${getScoreColor(stats.slaCompliance, [90, 70])}`} />
              {stats.slaCompliance >= 90 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </div>
            <div className={`text-2xl font-bold ${getScoreColor(stats.slaCompliance, [90, 70])}`}>
              {stats.slaCompliance}%
            </div>
            <div className="text-xs text-muted-foreground">SLA Compliance</div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-3 gap-4">
          {/* Pending Issues */}
          <div className="flex items-center gap-3 p-3 rounded-lg border">
            <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-lg font-semibold">{stats.pending}</div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
          </div>

          {/* Escalation Rate */}
          <div className="flex items-center gap-3 p-3 rounded-lg border">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
              stats.escalationRate <= 10 
                ? "bg-green-100 dark:bg-green-900/30" 
                : stats.escalationRate <= 20 
                  ? "bg-yellow-100 dark:bg-yellow-900/30"
                  : "bg-red-100 dark:bg-red-900/30"
            }`}>
              <AlertTriangle className={`h-5 w-5 ${
                stats.escalationRate <= 10 
                  ? "text-green-600" 
                  : stats.escalationRate <= 20 
                    ? "text-yellow-600"
                    : "text-red-600"
              }`} />
            </div>
            <div>
              <div className="text-lg font-semibold">{stats.escalationRate}%</div>
              <div className="text-xs text-muted-foreground">Escalation Rate</div>
            </div>
          </div>

          {/* Citizen Rating */}
          <div className="flex items-center gap-3 p-3 rounded-lg border">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
              stats.citizenRating >= 4 
                ? "bg-green-100 dark:bg-green-900/30" 
                : stats.citizenRating >= 3 
                  ? "bg-yellow-100 dark:bg-yellow-900/30"
                  : "bg-red-100 dark:bg-red-900/30"
            }`}>
              <Award className={`h-5 w-5 ${
                stats.citizenRating >= 4 
                  ? "text-green-600" 
                  : stats.citizenRating >= 3 
                    ? "text-yellow-600"
                    : "text-red-600"
              }`} />
            </div>
            <div>
              <div className="text-lg font-semibold flex items-center gap-1">
                {stats.citizenRating.toFixed(1)}
                <span className="text-xs text-muted-foreground">/5</span>
              </div>
              <div className="text-xs text-muted-foreground">Citizen Rating</div>
            </div>
          </div>
        </div>

        {/* Progress Bar for SLA */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Overall SLA Performance</span>
            <span className={getScoreColor(stats.slaCompliance, [90, 70])}>
              {stats.slaCompliance}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${
                stats.slaCompliance >= 90 
                  ? "bg-green-500" 
                  : stats.slaCompliance >= 70 
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }`}
              style={{ width: `${stats.slaCompliance}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Target: 90%</span>
            <span>
              {stats.slaCompliance >= 90 ? "Excellent" : stats.slaCompliance >= 70 ? "Needs Improvement" : "Critical"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
