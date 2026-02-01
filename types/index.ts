// =============================================
// TYPE DEFINITIONS FOR CIVICCONNECT
// =============================================

import {
  Issue,
  User,
  Category,
  Comment,
  Vote,
  Notification,
  AuditLog,
  Status,
  Priority,
  Role,
  EscalationLevel,
  SubmissionMode,
  NotificationType,
  NotificationChannel
} from "@prisma/client"

export type {
  Issue,
  User,
  Category,
  Vote,
  Notification,
  AuditLog
}

export interface UserWithStats extends User {
  _count?: {
    issues: number
    votes: number
    comments: number
    assignedIssues?: number
  }
}


// =============================================
// EXTENDED ISSUE TYPES
// =============================================

export interface IssueWithRelations extends Issue {
  category: Category
  user: {
    id: string
    name: string | null
    image: string | null
  }
  assignedOfficer?: {
    id: string
    name: string | null
    image: string | null
  } | null
  votes?: Vote[]
  comments?: CommentWithUser[]
  _count?: {
    votes: number
    comments: number
  }
}

export interface IssueListItem {
  id: string
  title: string
  description: string

  status: Status
  priority: Priority
  category: {
    name: string
    color?: string | null
    icon?: string | null
  }
  latitude: number
  longitude: number
  address?: string | null
  voteCount: number
  isUrgent: boolean
  createdAt: Date
  user: {
    name: string | null
  }
}

export interface IssueFilters {
  status?: Status[]
  priority?: Priority[]
  category?: string[]
  ward?: string
  district?: string
  state?: string
  dateFrom?: Date
  dateTo?: Date
  isUrgent?: boolean
  assignedToMe?: boolean
  escalationLevel?: EscalationLevel
}

// =============================================
// COMMUNITY ENGAGEMENT TYPES
// =============================================

export interface CommentWithUser extends Comment {
  user: {
    id: string
    name: string | null
    image: string | null
  }
  replies?: CommentWithUser[]
}

export interface PublicFeedItem {
  id: string
  title: string
  description: string
  status: Status
  category: {
    name: string
    color?: string | null
  }
  ward?: string | null
  district?: string | null
  voteCount: number
  commentCount: number
  createdAt: Date
  hasVoted?: boolean
}

// =============================================
// HEATMAP & GEOSPATIAL TYPES
// =============================================

export interface HeatmapPoint {
  lat: number
  lng: number
  intensity: number
}

export interface ClusterData {
  id: string
  latitude: number
  longitude: number
  count: number
  issues: {
    id: string
    title: string
    status: Status
    category: string
  }[]
}

export interface GeoLocation {
  latitude: number
  longitude: number
  accuracy?: number
  address?: string
  ward?: string
  block?: string
  district?: string
  state?: string
  pincode?: string
}

// =============================================
// OFFICER DASHBOARD TYPES
// =============================================

export interface KanbanColumn {
  id: Status
  title: string
  issues: IssueWithRelations[]
}

export interface OfficerStats {
  totalAssigned: number
  pendingCount: number
  inProgressCount: number
  resolvedToday: number
  averageResolutionTime: number
  slaBreachRisk: number
  slaBreached: number
}

export interface PerformanceMetrics {
  userId: string
  userName: string
  totalResolved: number
  averageResolutionTime: number
  satisfactionRating: number
  slaComplianceRate: number
  currentWorkload: number
}

// =============================================
// ANALYTICS TYPES
// =============================================

export interface DashboardAnalytics {
  totalIssues: number
  resolvedIssues: number
  pendingIssues: number
  averageResolutionTime: number
  categoryBreakdown: CategoryBreakdown[]
  trendData: TrendDataPoint[]
  heatmapData: HeatmapPoint[]
  slaCompliance: number
}

export interface CategoryBreakdown {
  category: string
  count: number
  percentage: number
  color?: string
}

export interface TrendDataPoint {
  date: string
  submitted: number
  resolved: number
}

export interface PredictiveData {
  date: string
  predictedVolume: number
  category?: string
  ward?: string
  confidence: number
}

// =============================================
// NOTIFICATION TYPES
// =============================================

export interface NotificationPreferences {
  email: boolean
  sms: boolean
  push: boolean
  whatsapp: boolean
  statusUpdates: boolean
  comments: boolean
  votes: boolean
  escalations: boolean
}

export interface NotificationPayload {
  type: NotificationType
  title: string
  message: string
  data?: Record<string, unknown>
  channels: NotificationChannel[]
}

// =============================================
// AI/ML TYPES
// =============================================

export interface ClassificationResult {
  category: string
  confidence: number
  suggestedCategories: {
    category: string
    confidence: number
  }[]
}

export interface DuplicateCheckResult {
  isDuplicate: boolean
  confidence: number
  matchingIssues: {
    id: string
    title: string
    similarity: number
    distance?: number
  }[]
}

export interface PriorityScoreResult {
  score: number
  factors: {
    sentiment: number
    communityVotes: number
    categoryWeight: number
    ageWeight: number
  }
}

// =============================================
// ACCESSIBILITY & LOCALIZATION
// =============================================

export type SupportedLanguage =
  | "en" // English
  | "hi" // Hindi
  | "ta" // Tamil
  | "te" // Telugu
  | "bn" // Bengali
  | "mr" // Marathi
  | "gu" // Gujarati
  | "kn" // Kannada
  | "ml" // Malayalam
  | "pa" // Punjabi
  | "or" // Odia

export interface AccessibilitySettings {
  highContrastMode: boolean
  fontSize: "SMALL" | "MEDIUM" | "LARGE" | "EXTRA_LARGE"
  screenReaderOptimized: boolean
  reduceMotion: boolean
}

export interface LocalizedString {
  en: string
  hi?: string
  ta?: string
  te?: string
  bn?: string
  mr?: string
  gu?: string
  kn?: string
  ml?: string
  pa?: string
  or?: string
}

// =============================================
// OFFLINE SYNC TYPES
// =============================================

export interface OfflineDraftData {
  title: string
  description: string
  categoryId: string
  latitude: number
  longitude: number
  address?: string
  imageBase64?: string
  voiceNoteBase64?: string
  createdAt: string
}

export interface SyncResult {
  success: boolean
  issueId?: string
  error?: string
}

// =============================================
// EXTERNAL INTEGRATION TYPES
// =============================================

export interface CPGRAMSData {
  registrationNumber: string
  status: string
  ministry: string
  department: string
  receivedDate: string
  lastActionDate: string
}

export interface StatePortalData {
  portalName: string
  referenceNumber: string
  status: string
  department: string
}

// =============================================
// EXPORT TYPES
// =============================================

export interface ExportOptions {
  format: "pdf" | "excel" | "csv"
  dateRange?: {
    from: Date
    to: Date
  }
  includeComments?: boolean
  includeStatusHistory?: boolean
  anonymize?: boolean
}

// =============================================
// API RESPONSE TYPES
// =============================================

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
  }
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Re-export Prisma enums for convenience
export {
  Status,
  Priority,
  Role,
  EscalationLevel,
  SubmissionMode,
  NotificationType,
  NotificationChannel
}

export interface WebSocketMessage {
  event: string;
  data: any;
}
