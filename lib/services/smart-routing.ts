// =============================================
// SMART ROUTING & ESCALATION SERVICE
// Handles intelligent issue assignment and escalation
// =============================================

import { prisma } from "@/lib/prisma"
import { EscalationLevel, Status } from "@prisma/client"

interface AssignmentResult {
  officerId: string
  officerName: string
  escalationLevel: EscalationLevel
  reason: string
}

/**
 * SLA configuration in hours for each escalation level
 */
export const SLA_CONFIG = {
  WARD: 7 * 24,      // 7 days
  BLOCK: 14 * 24,    // 14 days
  DISTRICT: 21 * 24, // 21 days
  STATE: 28 * 24     // 28 days
}

/**
 * Finds the best officer to assign based on jurisdiction and workload
 */
export async function findBestOfficer(
  ward: string | null,
  block: string | null,
  district: string | null,
  state: string | null
): Promise<AssignmentResult | null> {
  // Try to find ward officer first
  if (ward) {
    const wardOfficer = await prisma.user.findFirst({
      where: {
        role: "WARD_OFFICER",
        ward: {
          name: ward
        }
      },
      include: {
        performanceMetrics: true
      },
      orderBy: {
        performanceMetrics: {
          currentWorkload: "asc"
        }
      }
    })

    if (wardOfficer) {
      return {
        officerId: wardOfficer.id,
        officerName: wardOfficer.name || "Ward Officer",
        escalationLevel: "WARD",
        reason: "Assigned to ward officer with lowest workload"
      }
    }
  }

  // Try block officer
  if (block) {
    const blockOfficer = await prisma.user.findFirst({
      where: {
        role: "BLOCK_OFFICER",
        block: {
          name: block
        }
      },
      include: {
        performanceMetrics: true
      },
      orderBy: {
        performanceMetrics: {
          currentWorkload: "asc"
        }
      }
    })

    if (blockOfficer) {
      return {
        officerId: blockOfficer.id,
        officerName: blockOfficer.name || "Block Officer",
        escalationLevel: "BLOCK",
        reason: "No ward officer available, assigned to block officer"
      }
    }
  }

  // Try district officer
  if (district) {
    const districtOfficer = await prisma.user.findFirst({
      where: {
        role: "DISTRICT_OFFICER",
        district: {
          name: district
        }
      },
      include: {
        performanceMetrics: true
      },
      orderBy: {
        performanceMetrics: {
          currentWorkload: "asc"
        }
      }
    })

    if (districtOfficer) {
      return {
        officerId: districtOfficer.id,
        officerName: districtOfficer.name || "District Officer",
        escalationLevel: "DISTRICT",
        reason: "No block officer available, assigned to district officer"
      }
    }
  }

  // Try state officer
  if (state) {
    const stateOfficer = await prisma.user.findFirst({
      where: {
        role: "STATE_OFFICER",
        state: {
          name: state
        }
      },
      include: {
        performanceMetrics: true
      },
      orderBy: {
        performanceMetrics: {
          currentWorkload: "asc"
        }
      }
    })

    if (stateOfficer) {
      return {
        officerId: stateOfficer.id,
        officerName: stateOfficer.name || "State Officer",
        escalationLevel: "STATE",
        reason: "No district officer available, assigned to state officer"
      }
    }
  }

  return null
}

/**
 * Checks and processes escalations for issues that have breached SLA
 */
export async function processEscalations(): Promise<{
  escalated: number
  breached: number
}> {
  const now = new Date()
  let escalatedCount = 0
  let breachedCount = 0

  // Find issues that need escalation
  const issues = await prisma.issue.findMany({
    where: {
      status: {
        in: ["SUBMITTED", "ACKNOWLEDGED", "ASSIGNED", "IN_PROGRESS"]
      },
      slaBreach: false
    },
    include: {
      category: true,
      assignedOfficer: true
    }
  })

  for (const issue of issues) {
    const ageInHours = (now.getTime() - issue.createdAt.getTime()) / (1000 * 60 * 60)
    const currentLevel = issue.escalationLevel
    const slaHours = issue.category.slaHours

    // Check if SLA deadline is approaching or breached
    let nextLevel: EscalationLevel | null = null
    let shouldEscalate = false
    let isBreach = false

    switch (currentLevel) {
      case "WARD":
        if (ageInHours > SLA_CONFIG.WARD) {
          nextLevel = "BLOCK"
          shouldEscalate = true
        }
        break
      case "BLOCK":
        if (ageInHours > SLA_CONFIG.BLOCK) {
          nextLevel = "DISTRICT"
          shouldEscalate = true
        }
        break
      case "DISTRICT":
        if (ageInHours > SLA_CONFIG.DISTRICT) {
          nextLevel = "STATE"
          shouldEscalate = true
        }
        break
      case "STATE":
        if (ageInHours > SLA_CONFIG.STATE) {
          isBreach = true
        }
        break
    }

    if (shouldEscalate && nextLevel) {
      // Find new officer at next level
      const newAssignment = await findOfficerAtLevel(nextLevel, issue.district, issue.state)

      await prisma.issue.update({
        where: { id: issue.id },
        data: {
          escalationLevel: nextLevel,
          status: "ESCALATED",
          escalatedAt: now,
          assignedOfficerId: newAssignment?.officerId || issue.assignedOfficerId
        }
      })

      // Create status history
      await prisma.statusHistory.create({
        data: {
          issueId: issue.id,
          fromStatus: issue.status,
          toStatus: "ESCALATED",
          note: `Auto-escalated from ${currentLevel} to ${nextLevel} due to SLA breach`
        }
      })

      // Create notification for the new officer
      if (newAssignment) {
        await prisma.notification.create({
          data: {
            userId: newAssignment.officerId,
            type: "ESCALATION",
            title: "Issue Escalated to You",
            message: `Issue "${issue.title}" has been escalated and assigned to you.`,
            data: { issueId: issue.id }
          }
        })
      }

      escalatedCount++
    }

    if (isBreach) {
      await prisma.issue.update({
        where: { id: issue.id },
        data: { slaBreach: true }
      })
      breachedCount++
    }
  }

  return { escalated: escalatedCount, breached: breachedCount }
}

/**
 * Finds an officer at a specific escalation level
 */
async function findOfficerAtLevel(
  level: EscalationLevel,
  district: string | null,
  state: string | null
): Promise<{ officerId: string; officerName: string } | null> {
  let roleFilter: string
  let locationFilter: Record<string, unknown> = {}

  switch (level) {
    case "BLOCK":
      roleFilter = "BLOCK_OFFICER"
      if (district) {
        locationFilter = { block: { district: { name: district } } }
      }
      break
    case "DISTRICT":
      roleFilter = "DISTRICT_OFFICER"
      if (district) {
        locationFilter = { district: { name: district } }
      }
      break
    case "STATE":
      roleFilter = "STATE_OFFICER"
      if (state) {
        locationFilter = { state: { name: state } }
      }
      break
    default:
      roleFilter = "WARD_OFFICER"
  }

  const officer = await prisma.user.findFirst({
    where: {
      role: roleFilter as any,
      ...locationFilter
    },
    include: {
      performanceMetrics: true
    },
    orderBy: {
      performanceMetrics: {
        currentWorkload: "asc"
      }
    }
  })

  if (officer) {
    return {
      officerId: officer.id,
      officerName: officer.name || "Officer"
    }
  }

  return null
}

/**
 * Updates officer workload after assignment
 */
export async function updateOfficerWorkload(officerId: string, increment: number): Promise<void> {
  await prisma.officerMetrics.upsert({
    where: { userId: officerId },
    update: {
      currentWorkload: {
        increment
      }
    },
    create: {
      userId: officerId,
      currentWorkload: Math.max(0, increment)
    }
  })
}

/**
 * Calculate SLA deadline based on category
 */
export function calculateSLADeadline(createdAt: Date, slaHours: number): Date {
  return new Date(createdAt.getTime() + slaHours * 60 * 60 * 1000)
}

/**
 * Check if an issue is at risk of SLA breach
 */
export function isSLAAtRisk(
  createdAt: Date,
  slaDeadline: Date | null,
  warningThresholdHours: number = 24
): boolean {
  if (!slaDeadline) return false
  const now = new Date()
  const hoursUntilDeadline = (slaDeadline.getTime() - now.getTime()) / (1000 * 60 * 60)
  return hoursUntilDeadline <= warningThresholdHours && hoursUntilDeadline > 0
}
