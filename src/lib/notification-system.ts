import { getSocketServer } from './socket-server'
import { db } from './db'
import { EmailService } from './email-service'

export interface NotificationData {
  id: string
  type: 'BOOKING_CREATED' | 'BOOKING_CONFIRMED' | 'BOOKING_CANCELLED' | 'BOOKING_COMPLETED' | 'MEET_LINK_GENERATED' | 'PAYMENT_APPROVED' | 'PAYMENT_REJECTED'
  title: string
  message: string
  userId: string
  userType: 'STUDENT' | 'TEACHER' | 'ADMIN'
  relatedId?: string // booking ID, payment ID, etc.
  createdAt: Date
  isRead: boolean
}

export class NotificationSystem {
  private emailService: EmailService

  constructor() {
    this.emailService = new EmailService()
  }

  // Send real-time notification via Socket.IO
  private sendRealTimeNotification(userId: string, notification: Omit<NotificationData, 'id' | 'createdAt' | 'isRead'>) {
    const io = getSocketServer()
    if (io) {
      io.to(`user-${userId}`).emit('notification', {
        ...notification,
        id: this.generateId(),
        createdAt: new Date(),
        isRead: false
      })
    }
  }

  // Store notification in database
  private async storeNotification(notification: Omit<NotificationData, 'id' | 'createdAt' | 'isRead'>) {
    try {
      const storedNotification = await db.notification.create({
        data: {
          type: notification.type,
          title: notification.title,
          message: notification.message,
          userId: notification.userId,
          userType: notification.userType,
          relatedId: notification.relatedId,
          isRead: false
        }
      })
      return storedNotification
    } catch (error) {
      console.error('Error storing notification:', error)
      return null
    }
  }

  // Main notification dispatcher
  async sendNotification(notification: Omit<NotificationData, 'id' | 'createdAt' | 'isRead'>) {
    // Store in database
    const stored = await this.storeNotification(notification)
    
    // Send real-time notification
    this.sendRealTimeNotification(notification.userId, notification)
    
    // Send email notification
    await this.sendEmailNotification(notification)
    
    return stored
  }

  // Send email notification based on type
  private async sendEmailNotification(notification: Omit<NotificationData, 'id' | 'createdAt' | 'isRead'>) {
    try {
      // Get user email
      const user = await db.user.findUnique({
        where: { id: notification.userId },
        select: { email: true, name: true }
      })

      if (!user?.email) return

      let emailSent = false

      switch (notification.type) {
        case 'BOOKING_CREATED':
          emailSent = await this.sendBookingCreatedEmail(user.email, user.name, notification)
          break
        case 'BOOKING_CONFIRMED':
          emailSent = await this.sendBookingConfirmedEmail(user.email, user.name, notification)
          break
        case 'BOOKING_CANCELLED':
          emailSent = await this.sendBookingCancelledEmail(user.email, user.name, notification)
          break
        case 'BOOKING_COMPLETED':
          emailSent = await this.sendBookingCompletedEmail(user.email, user.name, notification)
          break
        case 'MEET_LINK_GENERATED':
          emailSent = await this.sendMeetLinkGeneratedEmail(user.email, user.name, notification)
          break
        case 'PAYMENT_APPROVED':
          emailSent = await this.sendPaymentApprovedEmail(user.email, user.name, notification)
          break
        case 'PAYMENT_REJECTED':
          emailSent = await this.sendPaymentRejectedEmail(user.email, user.name, notification)
          break
      }

      if (emailSent) {
        console.log(`Email notification sent to ${user.email} for ${notification.type}`)
      }
    } catch (error) {
      console.error('Error sending email notification:', error)
    }
  }

  // Email notification methods
  private async sendBookingCreatedEmail(email: string, userName: string, notification: Omit<NotificationData, 'id' | 'createdAt' | 'isRead'>): Promise<boolean> {
    const subject = 'New Booking Created - English Learning Platform'
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>New Booking Created</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none; }
          .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .button:hover { background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%); }
          .info-box { background: #e3f2fd; border: 1px solid #bbdefb; border-radius: 5px; padding: 15px; margin: 15px 0; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; background: #f0f0f0; border-radius: 10px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📅 New Booking Created</h1>
        </div>
        <div class="content">
          <h2>Hello ${userName},</h2>
          <p>${notification.message}</p>
          
          <div class="info-box">
            <strong>📋 Booking Details:</strong><br>
            ${notification.title}
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard" class="button">View Booking</a>
          </div>
          
          <p><strong>Next Steps:</strong></p>
          <ul>
            <li>Wait for the teacher to confirm your booking</li>
            <li>Complete the payment process</li>
            <li>Get ready for your English lesson!</li>
          </ul>
          
          <p>You'll receive another email once your booking is confirmed and payment is approved.</p>
          
          <p>Best regards,<br>The English Learning Platform Team</p>
        </div>
        <div class="footer">
          <p>© 2024 English Learning Platform. All rights reserved.</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </body>
      </html>
    `

    return this.emailService.sendEmail({
      to: email,
      subject,
      html
    })
  }

  private async sendBookingConfirmedEmail(email: string, userName: string, notification: Omit<NotificationData, 'id' | 'createdAt' | 'isRead'>): Promise<boolean> {
    const subject = 'Booking Confirmed - English Learning Platform'
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Booking Confirmed</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px 0; background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); color: white; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none; }
          .button { display: inline-block; background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .button:hover { background: linear-gradient(135deg, #45a049 0%, #3d8b40 100%); }
          .info-box { background: #e8f5e8; border: 1px solid #c8e6c9; border-radius: 5px; padding: 15px; margin: 15px 0; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; background: #f0f0f0; border-radius: 10px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>✅ Booking Confirmed</h1>
        </div>
        <div class="content">
          <h2>Hello ${userName},</h2>
          <p>Great news! Your booking has been confirmed by the teacher.</p>
          
          <div class="info-box">
            <strong>📋 Confirmed Booking:</strong><br>
            ${notification.title}
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard" class="button">View Booking</a>
          </div>
          
          <p><strong>Next Steps:</strong></p>
          <ul>
            <li>Complete your payment to secure the booking</li>
            <li>Wait for payment approval by admin</li>
            <li>You'll receive the Google Meet link once payment is approved</li>
          </ul>
          
          <p>Please make sure to complete the payment process to secure your time slot.</p>
          
          <p>Best regards,<br>The English Learning Platform Team</p>
        </div>
        <div class="footer">
          <p>© 2024 English Learning Platform. All rights reserved.</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </body>
      </html>
    `

    return this.emailService.sendEmail({
      to: email,
      subject,
      html
    })
  }

  private async sendMeetLinkGeneratedEmail(email: string, userName: string, notification: Omit<NotificationData, 'id' | 'createdAt' | 'isRead'>): Promise<boolean> {
    const subject = 'Google Meet Link Generated - English Learning Platform'
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Google Meet Link Generated</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px 0; background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%); color: white; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none; }
          .button { display: inline-block; background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .button:hover { background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); }
          .info-box { background: #e3f2fd; border: 1px solid #bbdefb; border-radius: 5px; padding: 15px; margin: 15px 0; }
          .meet-link { background: #f5f5f5; border: 1px solid #ddd; border-radius: 5px; padding: 10px; word-break: break-all; font-family: monospace; margin: 10px 0; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; background: #f0f0f0; border-radius: 10px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎥 Google Meet Link Generated</h1>
        </div>
        <div class="content">
          <h2>Hello ${userName},</h2>
          <p>Exciting! Your Google Meet link has been generated for your upcoming English class.</p>
          
          <div class="info-box">
            <strong>📋 Class Details:</strong><br>
            ${notification.title}
          </div>
          
          <p><strong>🔗 Your Google Meet Link:</strong></p>
          <div class="meet-link">${notification.message}</div>
          
          <div style="text-align: center;">
            <a href="${notification.message}" class="button" target="_blank">Join Class</a>
          </div>
          
          <p><strong>📝 Important Notes:</strong></p>
          <ul>
            <li>Click the link above to join your class at the scheduled time</li>
            <li>Make sure you have a stable internet connection</li>
            <li>Test your microphone and camera before the class</li>
            <li>Join 5 minutes early to avoid any technical issues</li>
          </ul>
          
          <p><strong>🔔 Reminder:</strong> You'll also receive a reminder email 1 hour before your class.</p>
          
          <p>We're excited for your English learning journey!</p>
          
          <p>Best regards,<br>The English Learning Platform Team</p>
        </div>
        <div class="footer">
          <p>© 2024 English Learning Platform. All rights reserved.</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </body>
      </html>
    `

    return this.emailService.sendEmail({
      to: email,
      subject,
      html
    })
  }

  private async sendBookingCancelledEmail(email: string, userName: string, notification: Omit<NotificationData, 'id' | 'createdAt' | 'isRead'>): Promise<boolean> {
    const subject = 'Booking Cancelled - English Learning Platform'
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Booking Cancelled</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px 0; background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%); color: white; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none; }
          .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .button:hover { background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%); }
          .info-box { background: #ffebee; border: 1px solid #ffcdd2; border-radius: 5px; padding: 15px; margin: 15px 0; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; background: #f0f0f0; border-radius: 10px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>❌ Booking Cancelled</h1>
        </div>
        <div class="content">
          <h2>Hello ${userName},</h2>
          <p>We're writing to inform you that your booking has been cancelled.</p>
          
          <div class="info-box">
            <strong>📋 Cancelled Booking:</strong><br>
            ${notification.title}
          </div>
          
          <p><strong>Reason:</strong></p>
          <p>${notification.message}</p>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard" class="button">Book Another Class</a>
          </div>
          
          <p><strong>What happens next?</strong></p>
          <ul>
            <li>If you made a payment, it will be refunded according to our cancellation policy</li>
            <li>You can book another class with any available teacher</li>
            <li>We apologize for any inconvenience caused</li>
          </ul>
          
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          
          <p>Best regards,<br>The English Learning Platform Team</p>
        </div>
        <div class="footer">
          <p>© 2024 English Learning Platform. All rights reserved.</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </body>
      </html>
    `

    return this.emailService.sendEmail({
      to: email,
      subject,
      html
    })
  }

  private async sendBookingCompletedEmail(email: string, userName: string, notification: Omit<NotificationData, 'id' | 'createdAt' | 'isRead'>): Promise<boolean> {
    const subject = 'Class Completed - Leave a Review - English Learning Platform'
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Class Completed</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px 0; background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); color: white; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none; }
          .button { display: inline-block; background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .button:hover { background: linear-gradient(135deg, #f57c00 0%, #ef6c00 100%); }
          .info-box { background: #fff3e0; border: 1px solid #ffcc02; border-radius: 5px; padding: 15px; margin: 15px 0; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; background: #f0f0f0; border-radius: 10px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎉 Class Completed!</h1>
        </div>
        <div class="content">
          <h2>Hello ${userName},</h2>
          <p>Congratulations! You have successfully completed your English class.</p>
          
          <div class="info-box">
            <strong>📋 Completed Class:</strong><br>
            ${notification.title}
          </div>
          
          <p><strong>🌟 Help Others Learn:</strong></p>
          <p>Your feedback helps other students choose the right teacher and helps teachers improve their lessons.</p>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard" class="button">Leave a Review</a>
          </div>
          
          <p><strong>What's Next?</strong></p>
          <ul>
            <li>Share your experience by leaving a review</li>
            <li>Book your next class to continue learning</li>
            <li>Track your progress in your dashboard</li>
          </ul>
          
          <p>Thank you for choosing the English Learning Platform. We're excited to be part of your learning journey!</p>
          
          <p>Best regards,<br>The English Learning Platform Team</p>
        </div>
        <div class="footer">
          <p>© 2024 English Learning Platform. All rights reserved.</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </body>
      </html>
    `

    return this.emailService.sendEmail({
      to: email,
      subject,
      html
    })
  }

  private async sendPaymentApprovedEmail(email: string, userName: string, notification: Omit<NotificationData, 'id' | 'createdAt' | 'isRead'>): Promise<boolean> {
    const subject = 'Payment Approved - English Learning Platform'
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Payment Approved</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px 0; background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); color: white; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none; }
          .button { display: inline-block; background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .button:hover { background: linear-gradient(135deg, #45a049 0%, #3d8b40 100%); }
          .info-box { background: #e8f5e8; border: 1px solid #c8e6c9; border-radius: 5px; padding: 15px; margin: 15px 0; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; background: #f0f0f0; border-radius: 10px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>💳 Payment Approved</h1>
        </div>
        <div class="content">
          <h2>Hello ${userName},</h2>
          <p>Great news! Your payment has been approved and your booking is now secured.</p>
          
          <div class="info-box">
            <strong>💰 Payment Details:</strong><br>
            ${notification.title}
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard" class="button">View Booking</a>
          </div>
          
          <p><strong>What's Next?</strong></p>
          <ul>
            <li>Your teacher will generate the Google Meet link soon</li>
            <li>You'll receive an email with the meeting link</li>
            <li>Get ready for your English class!</li>
          </ul>
          
          <p>Thank you for your payment. We're excited for your upcoming class!</p>
          
          <p>Best regards,<br>The English Learning Platform Team</p>
        </div>
        <div class="footer">
          <p>© 2024 English Learning Platform. All rights reserved.</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </body>
      </html>
    `

    return this.emailService.sendEmail({
      to: email,
      subject,
      html
    })
  }

  private async sendPaymentRejectedEmail(email: string, userName: string, notification: Omit<NotificationData, 'id' | 'createdAt' | 'isRead'>): Promise<boolean> {
    const subject = 'Payment Rejected - Action Required - English Learning Platform'
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Payment Rejected</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px 0; background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%); color: white; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none; }
          .button { display: inline-block; background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .button:hover { background: linear-gradient(135deg, #d32f2f 0%, #c62828 100%); }
          .info-box { background: #ffebee; border: 1px solid #ffcdd2; border-radius: 5px; padding: 15px; margin: 15px 0; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; background: #f0f0f0; border-radius: 10px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>❌ Payment Rejected</h1>
        </div>
        <div class="content">
          <h2>Hello ${userName},</h2>
          <p>We're sorry to inform you that your payment has been rejected.</p>
          
          <div class="info-box">
            <strong>💰 Payment Details:</strong><br>
            ${notification.title}
          </div>
          
          <p><strong>Reason for Rejection:</strong></p>
          <p>${notification.message}</p>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard" class="button">Update Payment</a>
          </div>
          
          <p><strong>What You Need to Do:</strong></p>
          <ul>
            <li>Review the rejection reason above</li>
            <li>Upload a new receipt with clear information</li>
            <li>Ensure all payment details are correct</li>
            <li>Submit for approval again</li>
          </ul>
          
          <p><strong>Important:</strong> Your booking may be cancelled if payment is not approved within 24 hours.</p>
          
          <p>If you believe this is an error or need assistance, please contact our support team.</p>
          
          <p>Best regards,<br>The English Learning Platform Team</p>
        </div>
        <div class="footer">
          <p>© 2024 English Learning Platform. All rights reserved.</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </body>
      </html>
    `

    return this.emailService.sendEmail({
      to: email,
      subject,
      html
    })
  }

  // Convenience methods for different notification types
  async notifyBookingCreated(bookingId: string, studentId: string, teacherId: string) {
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        student: { include: { user: true } },
        teacher: { include: { user: true } }
      }
    })

    if (!booking) return

    const startTime = new Date(booking.startTime).toLocaleString()
    const endTime = new Date(booking.endTime).toLocaleString()

    // Notify student
    await this.sendNotification({
      type: 'BOOKING_CREATED',
      title: `New booking with ${booking.teacher.user.name}`,
      message: `Your English class has been scheduled for ${startTime} to ${endTime}.`,
      userId: booking.student.userId,
      userType: 'STUDENT',
      relatedId: bookingId
    })

    // Notify teacher
    await this.sendNotification({
      type: 'BOOKING_CREATED',
      title: `New booking from ${booking.student.user.name}`,
      message: `You have a new booking request for ${startTime} to ${endTime}.`,
      userId: booking.teacher.userId,
      userType: 'TEACHER',
      relatedId: bookingId
    })

    // Notify admin
    const admins = await db.user.findMany({
      where: { role: 'ADMIN' }
    })

    for (const admin of admins) {
      await this.sendNotification({
        type: 'BOOKING_CREATED',
        title: `New booking created`,
        message: `New booking between ${booking.student.user.name} and ${booking.teacher.user.name} for ${startTime}.`,
        userId: admin.id,
        userType: 'ADMIN',
        relatedId: bookingId
      })
    }
  }

  async notifyBookingConfirmed(bookingId: string, studentId: string, teacherId: string) {
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        student: { include: { user: true } },
        teacher: { include: { user: true } }
      }
    })

    if (!booking) return

    const startTime = new Date(booking.startTime).toLocaleString()

    // Notify student
    await this.sendNotification({
      type: 'BOOKING_CONFIRMED',
      title: `Booking confirmed with ${booking.teacher.user.name}`,
      message: `Your English class on ${startTime} has been confirmed by the teacher.`,
      userId: booking.student.userId,
      userType: 'STUDENT',
      relatedId: bookingId
    })

    // Notify admin
    const admins = await db.user.findMany({
      where: { role: 'ADMIN' }
    })

    for (const admin of admins) {
      await this.sendNotification({
        type: 'BOOKING_CONFIRMED',
        title: `Booking confirmed`,
        message: `Booking between ${booking.student.user.name} and ${booking.teacher.user.name} has been confirmed.`,
        userId: admin.id,
        userType: 'ADMIN',
        relatedId: bookingId
      })
    }
  }

  async notifyMeetLinkGenerated(bookingId: string, studentId: string, teacherId: string, meetLink: string) {
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        student: { include: { user: true } },
        teacher: { include: { user: true } }
      }
    })

    if (!booking) return

    const startTime = new Date(booking.startTime).toLocaleString()

    // Notify student with meet link
    await this.sendNotification({
      type: 'MEET_LINK_GENERATED',
      title: `Google Meet link generated for class with ${booking.teacher.user.name}`,
      message: meetLink,
      userId: booking.student.userId,
      userType: 'STUDENT',
      relatedId: bookingId
    })

    // Notify admin
    const admins = await db.user.findMany({
      where: { role: 'ADMIN' }
    })

    for (const admin of admins) {
      await this.sendNotification({
        type: 'MEET_LINK_GENERATED',
        title: `Meet link generated`,
        message: `Google Meet link generated for booking between ${booking.student.user.name} and ${booking.teacher.user.name} on ${startTime}.`,
        userId: admin.id,
        userType: 'ADMIN',
        relatedId: bookingId
      })
    }
  }

  async notifyBookingCancelled(bookingId: string, studentId: string, teacherId: string, reason: string) {
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        student: { include: { user: true } },
        teacher: { include: { user: true } }
      }
    })

    if (!booking) return

    const startTime = new Date(booking.startTime).toLocaleString()

    // Notify student
    await this.sendNotification({
      type: 'BOOKING_CANCELLED',
      title: `Booking cancelled with ${booking.teacher.user.name}`,
      message: `Your English class scheduled for ${startTime} has been cancelled. Reason: ${reason}`,
      userId: booking.student.userId,
      userType: 'STUDENT',
      relatedId: bookingId
    })

    // Notify teacher
    await this.sendNotification({
      type: 'BOOKING_CANCELLED',
      title: `Booking cancelled with ${booking.student.user.name}`,
      message: `Booking for ${startTime} has been cancelled. Reason: ${reason}`,
      userId: booking.teacher.userId,
      userType: 'TEACHER',
      relatedId: bookingId
    })

    // Notify admin
    const admins = await db.user.findMany({
      where: { role: 'ADMIN' }
    })

    for (const admin of admins) {
      await this.sendNotification({
        type: 'BOOKING_CANCELLED',
        title: `Booking cancelled`,
        message: `Booking between ${booking.student.user.name} and ${booking.teacher.user.name} for ${startTime} has been cancelled. Reason: ${reason}`,
        userId: admin.id,
        userType: 'ADMIN',
        relatedId: bookingId
      })
    }
  }

  async notifyPaymentApproved(bookingId: string, studentId: string, amount: number) {
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        student: { include: { user: true } },
        teacher: { include: { user: true } }
      }
    })

    if (!booking) return

    const startTime = new Date(booking.startTime).toLocaleString()

    // Notify student
    await this.sendNotification({
      type: 'PAYMENT_APPROVED',
      title: `Payment approved for class with ${booking.teacher.user.name}`,
      message: `Your payment of $${amount} for the class on ${startTime} has been approved.`,
      userId: booking.student.userId,
      userType: 'STUDENT',
      relatedId: bookingId
    })

    // Notify teacher
    await this.sendNotification({
      type: 'PAYMENT_APPROVED',
      title: `Payment approved for class with ${booking.student.user.name}`,
      message: `Payment of $${amount} for the class on ${startTime} has been approved.`,
      userId: booking.teacher.userId,
      userType: 'TEACHER',
      relatedId: bookingId
    })

    // Notify admin
    const admins = await db.user.findMany({
      where: { role: 'ADMIN' }
    })

    for (const admin of admins) {
      await this.sendNotification({
        type: 'PAYMENT_APPROVED',
        title: `Payment approved`,
        message: `Payment of $${amount} for booking between ${booking.student.user.name} and ${booking.teacher.user.name} has been approved.`,
        userId: admin.id,
        userType: 'ADMIN',
        relatedId: bookingId
      })
    }
  }

  async notifyPaymentRejected(bookingId: string, studentId: string, amount: number, reason: string) {
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        student: { include: { user: true } },
        teacher: { include: { user: true } }
      }
    })

    if (!booking) return

    const startTime = new Date(booking.startTime).toLocaleString()

    // Notify student
    await this.sendNotification({
      type: 'PAYMENT_REJECTED',
      title: `Payment rejected for class with ${booking.teacher.user.name}`,
      message: `Your payment of $${amount} for the class on ${startTime} has been rejected. Reason: ${reason}`,
      userId: booking.student.userId,
      userType: 'STUDENT',
      relatedId: bookingId
    })

    // Notify teacher
    await this.sendNotification({
      type: 'PAYMENT_REJECTED',
      title: `Payment rejected for class with ${booking.student.user.name}`,
      message: `Payment of $${amount} for the class on ${startTime} has been rejected. Reason: ${reason}`,
      userId: booking.teacher.userId,
      userType: 'TEACHER',
      relatedId: bookingId
    })

    // Notify admin
    const admins = await db.user.findMany({
      where: { role: 'ADMIN' }
    })

    for (const admin of admins) {
      await this.sendNotification({
        type: 'PAYMENT_REJECTED',
        title: `Payment rejected`,
        message: `Payment of $${amount} for booking between ${booking.student.user.name} and ${booking.teacher.user.name} has been rejected. Reason: ${reason}`,
        userId: admin.id,
        userType: 'ADMIN',
        relatedId: bookingId
      })
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }
}

// Export singleton instance
export const notificationSystem = new NotificationSystem()