"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StatusBadge } from "@/components/status-timeline"
import { 
  GripVertical, 
  Clock, 
  AlertTriangle, 
  MapPin, 
  User,
  Calendar,
  ChevronDown,
  ChevronUp,
  Filter,
  RefreshCw
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

interface Issue {
  id: string
  title: string
  description: string
  status: string
  priority: string
  isUrgent: boolean
  createdAt: string
  slaDueDate?: string
  category: {
    name: string
  }
  reporter: {
    name: string
    image?: string
  }
  ward?: {
    name: string
  }
  _count?: {
    votes: number
    comments: number
  }
}

interface KanbanColumn {
  id: string
  title: string
  status: string
  issues: Issue[]
  color: string
}

const DEFAULT_COLUMNS: KanbanColumn[] = [
  { id: "pending", title: "Pending", status: "PENDING", issues: [], color: "bg-yellow-500" },
  { id: "assigned", title: "Assigned", status: "ASSIGNED", issues: [], color: "bg-purple-500" },
  { id: "in_progress", title: "In Progress", status: "IN_PROGRESS", issues: [], color: "bg-blue-500" },
  { id: "resolved", title: "Resolved", status: "RESOLVED", issues: [], color: "bg-green-500" },
]

const PRIORITY_ORDER: Record<string, number> = {
  CRITICAL: 1,
  HIGH: 2,
  MEDIUM: 3,
  LOW: 4,
  VERY_LOW: 5,
}

const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: "text-red-600 bg-red-100",
  HIGH: "text-orange-600 bg-orange-100",
  MEDIUM: "text-yellow-600 bg-yellow-100",
  LOW: "text-green-600 bg-green-100",
  VERY_LOW: "text-gray-600 bg-gray-100",
}

interface KanbanBoardProps {
  wardId?: string
  blockId?: string
  districtId?: string
}

export function KanbanBoard({ wardId, blockId, districtId }: KanbanBoardProps) {
  const { data: session } = useSession()
  const [columns, setColumns] = useState<KanbanColumn[]>(DEFAULT_COLUMNS)
  const [isLoading, setIsLoading] = useState(true)
  const [draggedIssue, setDraggedIssue] = useState<Issue | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
  const [collapsedColumns, setCollapsedColumns] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchIssues()
  }, [wardId, blockId, districtId])

  const fetchIssues = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (wardId) params.set("wardId", wardId)
      if (blockId) params.set("blockId", blockId)
      if (districtId) params.set("districtId", districtId)
      params.set("pageSize", "100")

      const response = await fetch(`/api/issues?${params}`)
      if (response.ok) {
        const data = await response.json()
        organizeIssues(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch issues:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const organizeIssues = (issues: Issue[]) => {
    const newColumns = DEFAULT_COLUMNS.map(col => ({
      ...col,
      issues: issues
        .filter(issue => issue.status === col.status)
        .sort((a, b) => {
          // Sort by priority first, then by urgency, then by SLA
          if (a.isUrgent !== b.isUrgent) return a.isUrgent ? -1 : 1
          const priorityDiff = (PRIORITY_ORDER[a.priority] || 5) - (PRIORITY_ORDER[b.priority] || 5)
          if (priorityDiff !== 0) return priorityDiff
          if (a.slaDueDate && b.slaDueDate) {
            return new Date(a.slaDueDate).getTime() - new Date(b.slaDueDate).getTime()
          }
          return 0
        }),
    }))
    setColumns(newColumns)
  }

  const handleDragStart = (issue: Issue) => {
    setDraggedIssue(issue)
  }

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    setDragOverColumn(columnId)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = async (e: React.DragEvent, targetColumn: KanbanColumn) => {
    e.preventDefault()
    setDragOverColumn(null)

    if (!draggedIssue || draggedIssue.status === targetColumn.status) {
      setDraggedIssue(null)
      return
    }

    // Optimistic update
    const newColumns = columns.map(col => {
      if (col.status === draggedIssue.status) {
        return { ...col, issues: col.issues.filter(i => i.id !== draggedIssue.id) }
      }
      if (col.status === targetColumn.status) {
        return { 
          ...col, 
          issues: [...col.issues, { ...draggedIssue, status: targetColumn.status }] 
        }
      }
      return col
    })
    setColumns(newColumns)

    // Update on server
    try {
      const response = await fetch(`/api/issues/${draggedIssue.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateStatus",
          status: targetColumn.status,
        }),
      })

      if (!response.ok) {
        // Revert on failure
        fetchIssues()
      }
    } catch (error) {
      console.error("Failed to update issue status:", error)
      fetchIssues()
    }

    setDraggedIssue(null)
  }

  const toggleColumn = (columnId: string) => {
    const newCollapsed = new Set(collapsedColumns)
    if (newCollapsed.has(columnId)) {
      newCollapsed.delete(columnId)
    } else {
      newCollapsed.add(columnId)
    }
    setCollapsedColumns(newCollapsed)
  }

  if (!session) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Please sign in to view the Kanban board</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Issue Kanban Board</h2>
        <Button variant="outline" size="sm" onClick={fetchIssues} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map(column => (
          <div
            key={column.id}
            className={`flex flex-col rounded-lg border bg-muted/30 ${
              dragOverColumn === column.id ? "ring-2 ring-primary" : ""
            }`}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column)}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between p-3 border-b">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${column.color}`} />
                <h3 className="font-medium">{column.title}</h3>
                <Badge variant="secondary" className="rounded-full">
                  {column.issues.length}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => toggleColumn(column.id)}
              >
                {collapsedColumns.has(column.id) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Column Content */}
            {!collapsedColumns.has(column.id) && (
              <div className="flex-1 p-2 space-y-2 min-h-[200px] max-h-[600px] overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : column.issues.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
                    No issues
                  </div>
                ) : (
                  column.issues.map(issue => (
                    <KanbanCard
                      key={issue.id}
                      issue={issue}
                      onDragStart={() => handleDragStart(issue)}
                      isDragging={draggedIssue?.id === issue.id}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

interface KanbanCardProps {
  issue: Issue
  onDragStart: () => void
  isDragging: boolean
}

function KanbanCard({ issue, onDragStart, isDragging }: KanbanCardProps) {
  const getSlaStatus = () => {
    if (!issue.slaDueDate) return null

    const now = new Date()
    const due = new Date(issue.slaDueDate)
    const hoursRemaining = (due.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursRemaining < 0) return "breached"
    if (hoursRemaining < 24) return "warning"
    return "ok"
  }

  const slaStatus = getSlaStatus()

  return (
    <Card
      draggable
      onDragStart={onDragStart}
      className={`cursor-grab active:cursor-grabbing transition-all ${
        isDragging ? "opacity-50 scale-95" : ""
      } ${slaStatus === "breached" ? "border-red-300 bg-red-50 dark:bg-red-950/20" : ""}
        ${slaStatus === "warning" ? "border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20" : ""}`}
    >
      <CardContent className="p-3 space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <Link 
            href={`/issues/${issue.id}`}
            className="text-sm font-medium hover:underline line-clamp-2 flex-1"
          >
            {issue.title}
          </Link>
          <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline" className="text-xs">
            {issue.category.name}
          </Badge>
          <Badge 
            variant="outline" 
            className={`text-xs ${PRIORITY_COLORS[issue.priority] || ""}`}
          >
            {issue.priority}
          </Badge>
          {issue.isUrgent && (
            <Badge variant="destructive" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Urgent
            </Badge>
          )}
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {issue.ward && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {issue.ward.name}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
          </span>
        </div>

        {/* Reporter */}
        <div className="flex items-center justify-between pt-1 border-t">
          <div className="flex items-center gap-1.5">
            <Avatar className="h-5 w-5">
              <AvatarImage src={issue.reporter.image} />
              <AvatarFallback className="text-xs">
                {issue.reporter.name?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate max-w-[80px]">
              {issue.reporter.name}
            </span>
          </div>
          {slaStatus && (
            <Badge 
              variant={slaStatus === "breached" ? "destructive" : slaStatus === "warning" ? "secondary" : "outline"}
              className="text-xs"
            >
              <Clock className="h-3 w-3 mr-1" />
              {slaStatus === "breached" ? "Overdue" : slaStatus === "warning" ? "Due soon" : "On track"}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
