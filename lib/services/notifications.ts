// =============================================
// NOTIFICATION SERVICE
// Multi-channel notifications (SMS, Email, Push, WhatsApp)
// =============================================

import { prisma } from "@/lib/prisma"
import { NotificationChannel, NotificationType, Prisma } from "@prisma/client"

interface NotificationOptions {
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, unknown>
  channels?: NotificationChannel[]
}

/**
 * Creates and sends a notification through multiple channels
 */
export async function sendNotification(options: NotificationOptions): Promise<void> {
  const { userId, type, title, message, data, channels = ["IN_APP"] } = options

  // Get user preferences
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      phone: true,
      preferredLanguage: true
    }
  })

  if (!user) {
    console.error(`User ${userId} not found for notification`)
    return
  }

  // Create in-app notification
  await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      data: data ? (data as Prisma.InputJsonValue) : Prisma.JsonNull,
      channel: "IN_APP",
      sentAt: new Date()
    }
  })

  // Send through other channels
  for (const channel of channels) {
    switch (channel) {
      case "EMAIL":
        if (user.email) {
          await sendEmailNotification(user.email, title, message)
        }
        break
      case "SMS":
        if (user.phone) {
          await sendSMSNotification(user.phone, message)
        }
        break
      case "PUSH":
        await sendPushNotification(userId, title, message)
        break
      case "WHATSAPP":
        if (user.phone) {
          await sendWhatsAppNotification(user.phone, message)
        }
        break
    }
  }
}

/**
 * Send email notification (placeholder for SendGrid integration)
 */
async function sendEmailNotification(
  email: string,
  subject: string,
  body: string
): Promise<boolean> {
  // TODO: Integrate with SendGrid
  // const sgMail = require('@sendgrid/mail')
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  
  console.log(`[EMAIL] To: ${email}, Subject: ${subject}`)
  
  // Placeholder implementation
  try {
    // const msg = {
    //   to: email,
    //   from: 'noreply@civicconnect.gov.in',
    //   subject: subject,
    //   text: body,
    //   html: `<div>${body}</div>`,
    // }
    // await sgMail.send(msg)
    return true
  } catch (error) {
    console.error("Email notification failed:", error)
    return false
  }
}

/**
 * Send SMS notification (placeholder for Twilio integration)
 */
async function sendSMSNotification(
  phone: string,
  message: string
): Promise<boolean> {
  // TODO: Integrate with Twilio
  // const twilio = require('twilio')
  // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  
  console.log(`[SMS] To: ${phone}, Message: ${message}`)
  
  // Placeholder implementation
  try {
    // await client.messages.create({
    //   body: message,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: phone
    // })
    return true
  } catch (error) {
    console.error("SMS notification failed:", error)
    return false
  }
}

/**
 * Send push notification (placeholder for FCM integration)
 */
async function sendPushNotification(
  userId: string,
  title: string,
  body: string
): Promise<boolean> {
  // TODO: Integrate with Firebase Cloud Messaging
  // const admin = require('firebase-admin')
  
  console.log(`[PUSH] To: ${userId}, Title: ${title}`)
  
  // Placeholder implementation
  try {
    // const message = {
    //   notification: { title, body },
    //   token: userFCMToken
    // }
    // await admin.messaging().send(message)
    return true
  } catch (error) {
    console.error("Push notification failed:", error)
    return false
  }
}

/**
 * Send WhatsApp notification (placeholder for WhatsApp Business API)
 */
async function sendWhatsAppNotification(
  phone: string,
  message: string
): Promise<boolean> {
  // TODO: Integrate with WhatsApp Business API
  
  console.log(`[WHATSAPP] To: ${phone}, Message: ${message}`)
  
  // Placeholder implementation
  try {
    // Use Twilio WhatsApp or Meta WhatsApp Business API
    return true
  } catch (error) {
    console.error("WhatsApp notification failed:", error)
    return false
  }
}

/**
 * Send status update notification
 */
export async function notifyStatusUpdate(
  issueId: string,
  userId: string,
  oldStatus: string,
  newStatus: string
): Promise<void> {
  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
    select: { title: true }
  })

  await sendNotification({
    userId,
    type: "STATUS_UPDATE",
    title: "Issue Status Updated",
    message: `Your issue "${issue?.title}" status changed from ${oldStatus} to ${newStatus}`,
    data: { issueId, oldStatus, newStatus },
    channels: ["IN_APP", "EMAIL", "PUSH"]
  })
}

/**
 * Send SLA warning notification to officer
 */
export async function notifySLAWarning(
  issueId: string,
  officerId: string,
  hoursRemaining: number
): Promise<void> {
  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
    select: { title: true }
  })

  await sendNotification({
    userId: officerId,
    type: "SLA_WARNING",
    title: "SLA Deadline Approaching",
    message: `Issue "${issue?.title}" has ${Math.round(hoursRemaining)} hours until SLA deadline`,
    data: { issueId, hoursRemaining },
    channels: ["IN_APP", "EMAIL", "SMS"]
  })
}

/**
 * Send escalation notification
 */
export async function notifyEscalation(
  issueId: string,
  officerId: string,
  escalationLevel: string
): Promise<void> {
  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
    select: { title: true }
  })

  await sendNotification({
    userId: officerId,
    type: "ESCALATION",
    title: "Issue Escalated",
    message: `Issue "${issue?.title}" has been escalated to ${escalationLevel} level and assigned to you`,
    data: { issueId, escalationLevel },
    channels: ["IN_APP", "EMAIL", "SMS", "PUSH"]
  })
}

/**
 * Get unread notifications for a user
 */
export async function getUnreadNotifications(userId: string) {
  return prisma.notification.findMany({
    where: {
      userId,
      read: false
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 50
  })
}

/**
 * Mark notifications as read
 */
export async function markNotificationsAsRead(
  userId: string,
  notificationIds?: string[]
): Promise<number> {
  const result = await prisma.notification.updateMany({
    where: {
      userId,
      ...(notificationIds ? { id: { in: notificationIds } } : {}),
      read: false
    },
    data: {
      read: true
    }
  })

  return result.count
}
