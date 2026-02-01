"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { KanbanBoard } from "@/components/kanban-board"
import { PerformanceScorecard } from "@/components/performance-scorecard"
import { ExportButton } from "@/components/export-button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  LayoutGrid,
  List,
  BarChart3,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  RefreshCw,
  MapPin
} from "lucide-react"
import Link from "next/link"

interface DashboardStats {
  totalAssigned: number
  pending: number
  inProgress: number
  resolved: number
  escalated: number
  slaBreaching: number
}

export default function OfficerDashboardPage() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeView, setActiveView] = useState<"kanban" | "list">("kanban")
  const [selectedWard, setSelectedWard] = useState<string>("")
  const [wards, setWards] = useState<Array<{ id: string; name: string }>>([])

  const userRole = (session?.user as any)?.role

  // Check authorization
  useEffect(() => {
    if (status === "loading") return
    
    if (!session) {
      redirect("/login")
    }

    const allowedRoles = ["WARD_OFFICER", "BLOCK_OFFICER", "DISTRICT_OFFICER", "STATE_OFFICER", "ADMIN", "SUPER_ADMIN"]
    if (!allowedRoles.includes(userRole)) {
      redirect("/dashboard")
    }
  }, [session, status, userRole])

  useEffect(() => {
    fetchStats()
    fetchWards()
  }, [selectedWard])

  const fetchStats = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedWard) params.set("wardId", selectedWard)

      const response = await fetch(`/api/analytics?type=dashboard&${params}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
      // Mock data for demo
      setStats({
        totalAssigned: 156,
        pending: 42,
        inProgress: 38,
        resolved: 68,
        escalated: 8,
        slaBreaching: 5,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchWards = async () => {
    // This would fetch from actual API
    setWards([
      { id: "ward1", name: "Ward 1 - Central" },
      { id: "ward2", name: "Ward 2 - North" },
      { id: "ward3", name: "Ward 3 - South" },
    ])
  }

  if (status === "loading" || isLoading) {
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
          <h1 className="text-3xl font-bold">Officer Dashboard</h1>
          <p className="text-muted-foreground">
            Manage and track assigned issues
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Ward Filter (for higher level officers) */}
          {(userRole === "BLOCK_OFFICER" || userRole === "DISTRICT_OFFICER" || 
            userRole === "STATE_OFFICER" || userRole === "ADMIN") && (
            <Select value={selectedWard} onValueChange={setSelectedWard}>
              <SelectTrigger className="w-[200px]">
                <MapPin className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Wards" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Wards</SelectItem>
                {wards.map(ward => (
                  <SelectItem key={ward.id} value={ward.id}>
                    {ward.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          <ExportButton 
            endpoint="/api/export" 
            filename="officer-issues"
            filters={selectedWard ? { wardId: selectedWard } : {}}
          />
          
          <Button variant="outline" onClick={fetchStats}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalAssigned}</p>
                  <p className="text-xs text-muted-foreground">Total Assigned</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.resolved}</p>
                  <p className="text-xs text-muted-foreground">Resolved</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.escalated}</p>
                  <p className="text-xs text-muted-foreground">Escalated</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={stats.slaBreaching > 0 ? "border-red-300 bg-red-50 dark:bg-red-950/20" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                  stats.slaBreaching > 0 
                    ? "bg-red-100 dark:bg-red-900/30" 
                    : "bg-gray-100 dark:bg-gray-900/30"
                }`}>
                  <Clock className={`h-5 w-5 ${stats.slaBreaching > 0 ? "text-red-600" : "text-gray-600"}`} />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${stats.slaBreaching > 0 ? "text-red-600" : ""}`}>
                    {stats.slaBreaching}
                  </p>
                  <p className="text-xs text-muted-foreground">SLA Breaching</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="kanban" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="kanban" className="gap-2">
              <LayoutGrid className="h-4 w-4" />
              Kanban
            </TabsTrigger>
            <TabsTrigger value="performance" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Performance
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="kanban">
          <KanbanBoard wardId={selectedWard || undefined} />
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid gap-6 md:grid-cols-2">
            <PerformanceScorecard wardId={selectedWard || undefined} />
            
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/map">
                    <MapPin className="h-4 w-4 mr-2" />
                    View Issues on Map
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/analytics">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics Dashboard
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  View Escalated Issues ({stats?.escalated || 0})
                </Button>
                <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                  <Clock className="h-4 w-4 mr-2" />
                  View SLA Breaching Issues ({stats?.slaBreaching || 0})
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
