// =============================================
// AUDIT & SECURITY SERVICE
// Handles audit trails and PII anonymization
// =============================================

import { prisma } from "@/lib/prisma"
import { AuditAction, Prisma } from "@prisma/client"
import crypto from "crypto"

interface AuditLogParams {
  action: AuditAction
  entityType: string
  entityId: string
  userId?: string
  issueId?: string
  oldValue?: Record<string, unknown>
  newValue?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

/**
 * Creates an immutable audit log entry
 */
export async function createAuditLog(params: AuditLogParams): Promise<void> {
  await prisma.auditLog.create({
    data: {
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      userId: params.userId,
      issueId: params.issueId,
      oldValue: params.oldValue ? (params.oldValue as Prisma.InputJsonValue) : Prisma.JsonNull,
      newValue: params.newValue ? (params.newValue as Prisma.InputJsonValue) : Prisma.JsonNull,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent
    }
  })
}

/**
 * Get audit logs for an entity
 */
export async function getAuditLogs(
  entityType: string,
  entityId: string,
  limit: number = 100
) {
  return prisma.auditLog.findMany({
    where: {
      entityType,
      entityId
    },
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    },
    take: limit
  })
}

/**
 * Hash Aadhaar number for secure storage
 */
export function hashAadhaar(aadhaarNumber: string): string {
  // Remove spaces and validate format
  const cleanAadhaar = aadhaarNumber.replace(/\s/g, "")
  
  if (!/^\d{12}$/.test(cleanAadhaar)) {
    throw new Error("Invalid Aadhaar format")
  }
  
  // Use SHA-256 with a salt for secure hashing
  const salt = process.env.AADHAAR_HASH_SALT || "civicconnect_salt"
  const hash = crypto.createHash("sha256")
  hash.update(cleanAadhaar + salt)
  
  return hash.digest("hex")
}

/**
 * Verify Aadhaar hash
 */
export function verifyAadhaar(aadhaarNumber: string, storedHash: string): boolean {
  try {
    const computedHash = hashAadhaar(aadhaarNumber)
    return computedHash === storedHash
  } catch {
    return false
  }
}

/**
 * Anonymize PII for public display
 */
export function anonymizeUser(user: {
  name: string | null
  email: string | null
  phone?: string | null
}): {
  name: string
  email: string
  phone: string
} {
  return {
    name: user.name ? anonymizeName(user.name) : "Anonymous",
    email: user.email ? anonymizeEmail(user.email) : "***@***.***",
    phone: user.phone ? anonymizePhone(user.phone) : "**********"
  }
}

/**
 * Anonymize name (show only initials)
 */
function anonymizeName(name: string): string {
  const parts = name.split(" ")
  if (parts.length === 1) {
    return name.charAt(0) + "***"
  }
  return parts.map(p => p.charAt(0)).join("") + "***"
}

/**
 * Anonymize email
 */
function anonymizeEmail(email: string): string {
  const [local, domain] = email.split("@")
  if (!domain) return "***@***.***"
  
  const anonymizedLocal = local.charAt(0) + "***" + local.charAt(local.length - 1)
  const domainParts = domain.split(".")
  const anonymizedDomain = domainParts[0].charAt(0) + "***" + "." + domainParts.slice(1).join(".")
  
  return anonymizedLocal + "@" + anonymizedDomain
}

/**
 * Anonymize phone number
 */
function anonymizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  if (digits.length < 4) return "******"
  return "******" + digits.slice(-4)
}

/**
 * Mask sensitive data in issue for public feed
 */
export function maskIssueForPublic<T extends {
  user?: { name: string | null; email?: string | null }
  address?: string | null
}>(issue: T): T {
  return {
    ...issue,
    user: issue.user ? { name: anonymizeName(issue.user.name || "Anonymous") } : undefined,
    address: issue.address ? maskAddress(issue.address) : null
  }
}

/**
 * Mask specific address details
 */
function maskAddress(address: string): string {
  // Remove specific house/flat numbers but keep locality
  return address
    .replace(/\b\d{1,5}[A-Za-z]?\b/g, "***")
    .replace(/flat\s*\d+/gi, "Flat ***")
    .replace(/house\s*no\.?\s*\d+/gi, "House ***")
}

/**
 * Check if user has permission for an action
 */
export function hasPermission(
  userRole: string,
  action: string,
  resourceOwnerId?: string,
  userId?: string
): boolean {
  const permissions: Record<string, string[]> = {
    CITIZEN: [
      "create:issue",
      "read:own_issue",
      "update:own_issue",
      "vote:issue",
      "comment:issue",
      "read:public_feed"
    ],
    WARD_OFFICER: [
      "read:ward_issues",
      "update:ward_issues",
      "comment:issue",
      "assign:issue"
    ],
    BLOCK_OFFICER: [
      "read:block_issues",
      "update:block_issues",
      "comment:issue",
      "assign:issue",
      "escalate:issue"
    ],
    DISTRICT_OFFICER: [
      "read:district_issues",
      "update:district_issues",
      "comment:issue",
      "assign:issue",
      "escalate:issue"
    ],
    STATE_OFFICER: [
      "read:state_issues",
      "update:state_issues",
      "comment:issue",
      "assign:issue",
      "escalate:issue"
    ],
    ADMIN: ["*"],
    SUPER_ADMIN: ["*"]
  }

  // Super admin and admin have all permissions
  if (userRole === "ADMIN" || userRole === "SUPER_ADMIN") {
    return true
  }

  const userPermissions = permissions[userRole] || []
  
  // Check for wildcard permission
  if (userPermissions.includes("*")) {
    return true
  }

  // Check if action is allowed
  if (userPermissions.includes(action)) {
    return true
  }

  // Check ownership for own_* actions
  if (action.startsWith("own_") && resourceOwnerId && userId) {
    return resourceOwnerId === userId
  }

  return false
}

/**
 * Rate limiting check (simple in-memory implementation)
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)

  if (!record || record.resetTime < now) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs }
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetIn: record.resetTime - now }
  }

  record.count++
  return { allowed: true, remaining: maxRequests - record.count, resetIn: record.resetTime - now }
}
