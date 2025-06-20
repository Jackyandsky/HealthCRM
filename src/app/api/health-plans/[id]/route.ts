import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import HealthPlan from '@/models/HealthPlan'
import { verifyToken } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const decoded = verifyToken(request)
    
    if (!decoded || !['system_admin', 'admin'].includes(decoded.role)) {
      return NextResponse.json(
        { message: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    await connectDB()
    
    const healthPlan = await HealthPlan.findById(params.id)
      .populate('customerId', 'name email phone category address healthProfile')
      .populate('assignedToId', 'name email department employeeId')
      .populate('createdById', 'name email department')
      .populate('productRecommendations.productId', 'productCode productName category benefits healthConcerns retailPrice wholesalePrice preferredCustomerPrice')
      .populate('templateId', 'name category description')
      .populate('feedback.providedBy', 'name email')
      .populate('adjustments.changedBy', 'name email')
      .populate('adjustments.approvedBy', 'name email')
      .lean()
    
    if (!healthPlan) {
      return NextResponse.json(
        { message: 'Health plan not found' },
        { status: 404 }
      )
    }

    // Calculate real-time progress
    const healthGoals = (healthPlan as any).healthGoals || []
    const activeGoals = healthGoals.filter((goal: any) => goal.status === 'active')
    const completedGoals = healthGoals.filter((goal: any) => goal.status === 'achieved')
    
    const progress = (healthPlan as any).progress || {}
    const calculatedProgress = {
      ...progress,
      overallProgress: activeGoals.length > 0 
        ? Math.round(activeGoals.reduce((sum: number, goal: any) => sum + (goal.progress?.percentage || 0), 0) / activeGoals.length)
        : progress.overallProgress || 0,
      goalsAchieved: completedGoals.length,
      totalGoals: healthGoals.length
    }

    return NextResponse.json({
      message: 'Health plan retrieved successfully',
      data: {
        ...healthPlan,
        progress: calculatedProgress
      }
    })
  } catch (error) {
    console.error('Error fetching health plan:', error)
    return NextResponse.json(
      { message: 'Failed to fetch health plan', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    // Check if health plan exists
    const existingHealthPlan = await HealthPlan.findById(params.id)
    if (!existingHealthPlan) {
      return NextResponse.json(
        { message: 'Health plan not found' },
        { status: 404 }
      )
    }

    // Update allowed fields
    const allowedFields = [
      'title', 'description', 'priority', 'status', 'planType',
      'healthAssessment', 'healthGoals', 'productRecommendations',
      'timeline', 'schedule', 'costAnalysis', 'progress',
      'notes', 'tags', 'assignedToId', 'assignedToName'
    ]

    const updateData: any = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    // Convert date strings to Date objects
    if (updateData.timeline) {
      if (updateData.timeline.startDate) {
        updateData.timeline.startDate = new Date(updateData.timeline.startDate)
      }
      if (updateData.timeline.endDate) {
        updateData.timeline.endDate = new Date(updateData.timeline.endDate)
      }
      if (updateData.timeline.reviewDates) {
        updateData.timeline.reviewDates = updateData.timeline.reviewDates.map((date: string) => new Date(date))
      }
    }

    if (updateData.schedule) {
      updateData.schedule = updateData.schedule.map((item: any) => ({
        ...item,
        scheduledDate: item.scheduledDate ? new Date(item.scheduledDate) : item.scheduledDate,
        completedDate: item.completedDate ? new Date(item.completedDate) : item.completedDate
      }))
    }

    if (updateData.progress?.nextReviewDate) {
      updateData.progress.nextReviewDate = new Date(updateData.progress.nextReviewDate)
    }

    // Recalculate cost analysis if product recommendations changed
    if (updateData.productRecommendations) {
      const monthlyCosts = {
        retail: 0,
        wholesale: 0,
        preferredCustomer: 0
      }

      updateData.productRecommendations.forEach((rec: any) => {
        monthlyCosts.retail += rec.estimatedCost?.retail || 0
        monthlyCosts.wholesale += rec.estimatedCost?.wholesale || 0
        monthlyCosts.preferredCustomer += rec.estimatedCost?.preferredCustomer || 0
      })

      const timeline = updateData.timeline || existingHealthPlan.timeline
      const duration = timeline?.endDate && timeline?.startDate 
        ? Math.ceil((new Date(timeline.endDate).getTime() - new Date(timeline.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30))
        : 3

      updateData.costAnalysis = {
        ...updateData.costAnalysis,
        estimatedMonthlyCost: monthlyCosts,
        totalEstimatedCost: {
          retail: monthlyCosts.retail * duration,
          wholesale: monthlyCosts.wholesale * duration,
          preferredCustomer: monthlyCosts.preferredCustomer * duration
        }
      }
    }

    // Recalculate progress if goals changed
    if (updateData.healthGoals) {
      const activeGoals = updateData.healthGoals.filter((goal: any) => goal.status === 'active')
      const completedGoals = updateData.healthGoals.filter((goal: any) => goal.status === 'achieved')
      
      updateData.progress = {
        ...updateData.progress,
        overallProgress: activeGoals.length > 0 
          ? Math.round(activeGoals.reduce((sum: number, goal: any) => sum + (goal.progress?.percentage || 0), 0) / activeGoals.length)
          : 0,
        goalsAchieved: completedGoals.length,
        totalGoals: updateData.healthGoals.length
      }
    }

    updateData.updatedAt = new Date()

    const updatedHealthPlan = await HealthPlan.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('customerId', 'name email phone category')
     .populate('assignedToId', 'name email department')
     .populate('createdById', 'name email')
     .populate('productRecommendations.productId', 'productCode productName category')

    return NextResponse.json({
      message: 'Health plan updated successfully',
      data: updatedHealthPlan
    })

  } catch (error) {
    console.error('Error updating health plan:', error)
    return NextResponse.json(
      { message: 'Failed to update health plan', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const decoded = verifyToken(request)
    
    if (!decoded || !['system_admin', 'admin'].includes(decoded.role)) {
      return NextResponse.json(
        { message: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    await connectDB()
    
    const healthPlan = await HealthPlan.findById(params.id)
    if (!healthPlan) {
      return NextResponse.json(
        { message: 'Health plan not found' },
        { status: 404 }
      )
    }

    // Don't allow deletion of active plans without special permission
    if (healthPlan.status === 'active' && !request.nextUrl.searchParams.get('force')) {
      return NextResponse.json(
        { message: 'Cannot delete active health plans without force parameter' },
        { status: 400 }
      )
    }

    // Soft delete by setting isActive to false
    await HealthPlan.findByIdAndUpdate(
      params.id,
      { 
        isActive: false,
        status: 'cancelled',
        updatedAt: new Date()
      }
    )

    return NextResponse.json({
      message: 'Health plan deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting health plan:', error)
    return NextResponse.json(
      { message: 'Failed to delete health plan', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}