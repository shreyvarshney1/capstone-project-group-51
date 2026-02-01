import * as z from "zod"

// Base issue schema for form submission
export const issueSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }).max(200, {
    message: "Title must be less than 200 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }).max(5000, {
    message: "Description must be less than 5000 characters.",
  }),
  categoryId: z.string().min(1, {
    message: "Please select a category.",
  }),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional(),
  ward: z.string().optional(),
  block: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  image: z.any().optional(),
  imageUrls: z.array(z.string()).optional(),
  voiceNoteUrl: z.string().optional(),
  transcribedText: z.string().optional(),
  isPublic: z.boolean(),
  language: z.string(),
})

export type IssueFormValues = z.infer<typeof issueSchema>

// Schema for updating issue status
export const issueStatusSchema = z.object({
  status: z.enum([
    "DRAFT",
    "SUBMITTED",
    "ACKNOWLEDGED",
    "ASSIGNED",
    "IN_PROGRESS",
    "ESCALATED",
    "RESOLVED",
    "CLOSED",
    "REJECTED"
  ]),
  note: z.string().optional(),
})

// Schema for updating issue priority
export const issuePrioritySchema = z.object({
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT", "CRITICAL"]),
})

// Schema for assigning issue
export const issueAssignSchema = z.object({
  assignedOfficerId: z.string().min(1),
})

// Schema for issue filters
export const issueFiltersSchema = z.object({
  status: z.array(z.string()).optional(),
  priority: z.array(z.string()).optional(),
  category: z.array(z.string()).optional(),
  ward: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  isUrgent: z.boolean().optional(),
  assignedToMe: z.boolean().optional(),
  escalationLevel: z.string().optional(),
  page: z.number().default(1),
  pageSize: z.number().default(20),
})

// Schema for comments
export const commentSchema = z.object({
  content: z.string().min(1, {
    message: "Comment cannot be empty.",
  }).max(2000, {
    message: "Comment must be less than 2000 characters.",
  }),
  parentId: z.string().optional(),
})

// Schema for voting
export const voteSchema = z.object({
  value: z.number().min(-1).max(1).default(1),
})

// Schema for offline draft
export const offlineDraftSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(10),
  categoryId: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
  address: z.string().optional(),
  imageBase64: z.string().optional(),
  voiceNoteBase64: z.string().optional(),
  createdAt: z.string(),
})

export type OfflineDraftValues = z.infer<typeof offlineDraftSchema>

