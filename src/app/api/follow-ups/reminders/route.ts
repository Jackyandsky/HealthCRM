import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import FollowUp from '@/models/FollowUp'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const decoded = verifyToken(request)
    
    if (!decoded || !['system_admin', 'admin'].includes(decoded.role)) {
      return NextResponse.json(
        { message: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    await connectDB()
    
    const searchParams = request.nextUrl.searchParams
    const reminderType = searchParams.get('type') || 'upcoming' // upcoming, overdue, today
    const assignedToId = searchParams.get('assignedToId')
    
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    let filter: any = { 
      isActive: true,
      status: { $in: ['scheduled', 'in_progress'] }
    }
    
    if (assignedToId) {
      filter.assignedToId = assignedToId
    }
    
    // Build date filter based on reminder type
    switch (reminderType) {
      case 'overdue':
        filter.scheduledDate = { $lt: today }
        break
      case 'today':
        filter.scheduledDate = { $gte: today, $lt: tomorrow }
        break
      case 'upcoming':
        // Next 7 days
        const nextWeek = new Date(today)
        nextWeek.setDate(nextWeek.getDate() + 7)
        filter.scheduledDate = { $gte: today, $lte: nextWeek }
        break
      case 'next_week':
        // 7-14 days from now
        const nextWeekStart = new Date(today)
        nextWeekStart.setDate(nextWeekStart.getDate() + 7)
        const nextWeekEnd = new Date(today)
        nextWeekEnd.setDate(nextWeekEnd.getDate() + 14)
        filter.scheduledDate = { $gte: nextWeekStart, $lte: nextWeekEnd }
        break
    }

    const followUps = await FollowUp.find(filter)
      .sort({ scheduledDate: 1, priority: -1 })
      .populate('customerId', 'name email phone category')
      .populate('assignedToId', 'name email department')
      .lean()

    // Group by priority for better organization
    const groupedReminders = {
      urgent: followUps.filter(f => f.priority === 'urgent'),
      high: followUps.filter(f => f.priority === 'high'),
      medium: followUps.filter(f => f.priority === 'medium'),
      low: followUps.filter(f => f.priority === 'low'),
    }

    // Calculate summary counts
    const summary = {
      total: followUps.length,
      urgent: groupedReminders.urgent.length,
      high: groupedReminders.high.length,
      medium: groupedReminders.medium.length,
      low: groupedReminders.low.length,
    }

    return NextResponse.json({
      message: 'Reminders retrieved successfully',
      data: {
        followUps,
        grouped: groupedReminders,
        summary,
        type: reminderType
      }
    })
  } catch (error) {
    console.error('Error fetching reminders:', error)
    return NextResponse.json(
      { message: 'Failed to fetch reminders', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const decoded = verifyToken(request)
    
    if (!decoded || !['system_admin', 'admin'].includes(decoded.role)) {
      return NextResponse.json(
        { message: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    await connectDB()
    
    const body = await request.json()
    const { followUpIds, action, reminderDate } = body
    
    if (!Array.isArray(followUpIds) || followUpIds.length === 0) {
      return NextResponse.json(
        { message: 'Follow-up IDs array is required' },
        { status: 400 }
      )
    }

    let updateData: any = {}
    
    switch (action) {
      case 'mark_reminder_sent':
        updateData = {
          reminderSent: true,
          reminderDate: reminderDate ? new Date(reminderDate) : new Date(),
          updatedAt: new Date()
        }
        break
      case 'snooze_reminder':
        if (!reminderDate) {
          return NextResponse.json(
            { message: 'Reminder date is required for snooze action' },
            { status: 400 }
          )
        }
        updateData = {
          reminderDate: new Date(reminderDate),
          reminderSent: false,
          updatedAt: new Date()
        }
        break
      case 'reschedule':
        if (!body.newScheduledDate) {
          return NextResponse.json(
            { message: 'New scheduled date is required for reschedule action' },
            { status: 400 }
          )
        }
        updateData = {
          scheduledDate: new Date(body.newScheduledDate),
          scheduledTime: body.newScheduledTime,
          status: 'rescheduled',
          reminderSent: false,
          updatedAt: new Date()
        }
        break
      default:
        return NextResponse.json(
          { message: 'Invalid action. Use mark_reminder_sent, snooze_reminder, or reschedule' },
          { status: 400 }
        )
    }

    const result = await FollowUp.updateMany(
      { 
        _id: { $in: followUpIds },
        isActive: true
      },
      updateData
    )

    return NextResponse.json({
      message: `Reminder action completed for ${result.modifiedCount} follow-ups`,
      data: {
        modifiedCount: result.modifiedCount,
        action
      }
    })

  } catch (error) {
    console.error('Error processing reminders:', error)
    return NextResponse.json(
      { message: 'Failed to process reminders', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}