import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import FollowUp from '@/models/FollowUp'
import User from '@/models/User'
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
    
    // Ensure models are registered
    User
    
    const followUp = await FollowUp.findById(params.id)
      .populate('customerId', 'firstName lastName email phone customerType')
      .populate('assignedToId', 'name email')
      .populate('createdById', 'name email')
      .lean()
    
    if (!followUp) {
      return NextResponse.json(
        { message: 'Follow-up not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Follow-up retrieved successfully',
      data: followUp
    })
  } catch (error) {
    console.error('Error fetching follow-up:', error)
    return NextResponse.json(
      { message: 'Failed to fetch follow-up', error: error instanceof Error ? error.message : 'Unknown error' },
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
    
    // Ensure models are registered
    User
    
    const body = await request.json()
    
    // Check if follow-up exists
    const existingFollowUp = await FollowUp.findById(params.id)
    if (!existingFollowUp) {
      return NextResponse.json(
        { message: 'Follow-up not found' },
        { status: 404 }
      )
    }

    // Update allowed fields
    const allowedFields = [
      'title', 'description', 'priority', 'scheduledDate', 'scheduledTime',
      'status', 'communicationMethod', 'completedDate', 'actualDuration',
      'outcome', 'customerSatisfaction', 'customerFeedback',
      'recommendations', 'nextFollowUpDate', 'notes'
    ]

    // Define enum fields that shouldn't accept empty strings
    const enumFields = ['type', 'priority', 'status', 'communicationMethod', 'outcome']
    
    const updateData: any = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        // Handle enum fields - don't set empty strings for enum fields
        if (enumFields.includes(field) && body[field] === '') {
          // Skip empty enum values - let the model use defaults or keep existing values
          continue
        }
        updateData[field] = body[field]
      }
    }

    // Convert date strings to Date objects
    const dateFields = ['scheduledDate', 'completedDate', 'nextFollowUpDate', 'reminderDate']
    for (const field of dateFields) {
      if (updateData[field]) {
        updateData[field] = new Date(updateData[field])
      }
    }

    // If status is being changed to completed, set completedDate
    if (updateData.status === 'completed' && !updateData.completedDate) {
      updateData.completedDate = new Date()
    }

    updateData.updatedAt = new Date()

    const updatedFollowUp = await FollowUp.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('customerId', 'firstName lastName email phone customerType')
     .populate('assignedToId', 'name email')
     .populate('createdById', 'name email')
    
    return NextResponse.json({
      message: 'Follow-up updated successfully',
      data: updatedFollowUp
    })

  } catch (error) {
    console.error('Error updating follow-up:', error)
    return NextResponse.json(
      { message: 'Failed to update follow-up', error: error instanceof Error ? error.message : 'Unknown error' },
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
    
    // Ensure models are registered
    User
    
    const followUp = await FollowUp.findById(params.id)
    if (!followUp) {
      return NextResponse.json(
        { message: 'Follow-up not found' },
        { status: 404 }
      )
    }

    // Don't allow deletion of completed follow-ups without special permission
    if (followUp.status === 'completed' && !request.nextUrl.searchParams.get('force')) {
      return NextResponse.json(
        { message: 'Cannot delete completed follow-ups without force parameter' },
        { status: 400 }
      )
    }

    // Soft delete by setting isActive to false
    await FollowUp.findByIdAndUpdate(
      params.id,
      { 
        isActive: false,
        status: 'cancelled',
        updatedAt: new Date()
      }
    )

    return NextResponse.json({
      message: 'Follow-up deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting follow-up:', error)
    return NextResponse.json(
      { message: 'Failed to delete follow-up', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}