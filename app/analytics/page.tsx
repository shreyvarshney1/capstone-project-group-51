"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExportButton } from "@/components/export-button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  PieChart,
  Activity,
  RefreshCw,
  MapPin,
  Calendar
} from "lucide-react"

interface AnalyticsData {
  overview: {
    totalIssues: number
    resolvedIssues: number
    pendingIssues: number
    avgResolutionTime: number
    slaCompliance: number
    citizenSatisfaction: number
    trendsVsLastPeriod: {
      issues: number
      resolution: number
      satisfaction: number
    }
  }
  categoryDistribution: Array<{
    category: string
    count: number
    percentage: number
    color: string
  }>
  statusDistribution: Array<{
    status: string
    count: number
    percentage: number
  }>
  monthlyTrends: Array<{
    month: string
    created: number
    resolved: number
  }>
  topAreas: Array<{
    area: string
    count: number
    resolved: number
  }>
  officerPerformance: Array<{
    name: string
    assigned: number
    resolved: number
    avgTime: number
    slaCompliance: number
  }>
}

export default function AnalyticsPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState<"week" | "month" | "quarter" | "year">("month")

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const fetchAnalytics = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/analytics?type=dashboard&period=${period}`)
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
      // Mock data for demo
      setData({
        overview: {
          totalIssues: 1234,
          resolvedIssues: 856,
          pendingIssues: 378,
          avgResolutionTime: 72,
          slaCompliance: 87,
          citizenSatisfaction: 4.2,
          trendsVsLastPeriod: {
            issues: 12,
            resolution: 8,
            satisfaction: 3,
          },
        },
        categoryDistribution: [
          { category: "Roads & Potholes", count: 320, percentage: 26, color: "#3b82f6" },
          { category: "Water Supply", count: 256, percentage: 21, color: "#10b981" },
          { category: "Sanitation", count: 198, percentage: 16, color: "#f59e0b" },
          { category: "Street Lights", count: 167, percentage: 14, color: "#8b5cf6" },
          { category: "Drainage", count: 143, percentage: 12, color: "#ef4444" },
          { category: "Others", count: 150, percentage: 11, color: "#6b7280" },
        ],
        statusDistribution: [
          { status: "Pending", count: 234, percentage: 19 },
          { status: "In Progress", count: 289, percentage: 23 },
          { status: "Resolved", count: 612, percentage: 50 },
          { status: "Closed", count: 99, percentage: 8 },
        ],
        monthlyTrends: [
          { month: "Jan", created: 120, resolved: 95 },
          { month: "Feb", created: 145, resolved: 130 },
          { month: "Mar", created: 165, resolved: 150 },
          { month: "Apr", created: 180, resolved: 165 },
          { month: "May", created: 195, resolved: 180 },
          { month: "Jun", created: 210, resolved: 195 },
        ],
        topAreas: [
          { area: "Ward 1 - Central", count: 187, resolved: 145 },
          { area: "Ward 3 - North", count: 156, resolved: 120 },
          { area: "Ward 7 - East", count: 134, resolved: 98 },
          { area: "Ward 12 - South", count: 112, resolved: 89 },
          { area: "Ward 5 - West", count: 98, resolved: 76 },
        ],
        officerPerformance: [
          { name: "Rahul Kumar", assigned: 45, resolved: 38, avgTime: 48, slaCompliance: 92 },
          { name: "Priya Sharma", assigned: 42, resolved: 35, avgTime: 56, slaCompliance: 88 },
          { name: "Amit Singh", assigned: 38, resolved: 30, avgTime: 62, slaCompliance: 85 },
          { name: "Sneha Patel", assigned: 35, resolved: 28, avgTime: 70, slaCompliance: 80 },
        ],
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatDuration = (hours: number) => {
    if (hours < 24) return `${Math.round(hours)}h`
    const days = Math.round(hours / 24)
    return `${days}d`
  }

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-600" />
    return null
  }

  if (isLoading && !data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into civic issue management
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          
          <ExportButton 
            endpoint="/api/export" 
            filename="analytics-report"
            filters={{ period }}
          />
          
          <Button variant="outline" onClick={fetchAnalytics} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {data && (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  {getTrendIcon(data.overview.trendsVsLastPeriod.issues)}
                </div>
                <div className="text-2xl font-bold">{data.overview.totalIssues.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Total Issues</div>
                {data.overview.trendsVsLastPeriod.issues !== 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {data.overview.trendsVsLastPeriod.issues > 0 ? "+" : ""}
                    {data.overview.trendsVsLastPeriod.issues}% vs last period
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  {getTrendIcon(data.overview.trendsVsLastPeriod.resolution)}
                </div>
                <div className="text-2xl font-bold">{data.overview.resolvedIssues.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Resolved</div>
                <div className="text-xs text-green-600 mt-1">
                  {Math.round((data.overview.resolvedIssues / data.overview.totalIssues) * 100)}% resolution rate
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="text-2xl font-bold">{data.overview.pendingIssues.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Pending</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-2xl font-bold">{formatDuration(data.overview.avgResolutionTime)}</div>
                <div className="text-xs text-muted-foreground">Avg Resolution Time</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="text-2xl font-bold">{data.overview.slaCompliance}%</div>
                <div className="text-xs text-muted-foreground">SLA Compliance</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Users className="h-5 w-5 text-orange-600" />
                  {getTrendIcon(data.overview.trendsVsLastPeriod.satisfaction)}
                </div>
                <div className="text-2xl font-bold">{data.overview.citizenSatisfaction}/5</div>
                <div className="text-xs text-muted-foreground">Citizen Rating</div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid gap-6 lg:grid-cols-2 mb-8">
            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <PieChart className="h-4 w-4" />
                  Issues by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.categoryDistribution.map((cat, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>{cat.category}</span>
                        <span className="text-muted-foreground">
                          {cat.count} ({cat.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ 
                            width: `${cat.percentage}%`,
                            backgroundColor: cat.color 
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Issues by Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {data.statusDistribution.map((status, idx) => (
                    <div 
                      key={idx}
                      className="p-4 rounded-lg bg-muted/50 text-center"
                    >
                      <div className="text-2xl font-bold">{status.count}</div>
                      <div className="text-sm text-muted-foreground">{status.status}</div>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {status.percentage}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Monthly Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Monthly Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-end justify-between gap-2">
                  {data.monthlyTrends.map((month, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                      <div className="flex gap-1 h-[150px] items-end">
                        <div 
                          className="w-4 bg-blue-500 rounded-t"
                          style={{ height: `${(month.created / 220) * 100}%` }}
                          title={`Created: ${month.created}`}
                        />
                        <div 
                          className="w-4 bg-green-500 rounded-t"
                          style={{ height: `${(month.resolved / 220) * 100}%` }}
                          title={`Resolved: ${month.resolved}`}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{month.month}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-6 mt-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded" />
                    <span>Created</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded" />
                    <span>Resolved</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Areas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Top Areas by Issues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.topAreas.map((area, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                          {idx + 1}
                        </div>
                        <span className="font-medium">{area.area}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{area.count}</div>
                        <div className="text-xs text-green-600">
                          {area.resolved} resolved
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Officer Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Officer Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-muted-foreground border-b">
                      <th className="pb-3 font-medium">Officer</th>
                      <th className="pb-3 font-medium text-center">Assigned</th>
                      <th className="pb-3 font-medium text-center">Resolved</th>
                      <th className="pb-3 font-medium text-center">Avg Time</th>
                      <th className="pb-3 font-medium text-center">SLA %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.officerPerformance.map((officer, idx) => (
                      <tr key={idx} className="border-b last:border-0">
                        <td className="py-3 font-medium">{officer.name}</td>
                        <td className="py-3 text-center">{officer.assigned}</td>
                        <td className="py-3 text-center">
                          <span className="text-green-600">{officer.resolved}</span>
                          <span className="text-muted-foreground text-xs ml-1">
                            ({Math.round((officer.resolved / officer.assigned) * 100)}%)
                          </span>
                        </td>
                        <td className="py-3 text-center">{formatDuration(officer.avgTime)}</td>
                        <td className="py-3 text-center">
                          <Badge 
                            variant={officer.slaCompliance >= 90 ? "default" : officer.slaCompliance >= 75 ? "secondary" : "destructive"}
                          >
                            {officer.slaCompliance}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
