import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

export interface JWTPayload {
  userId: string
  email: string
  role: string
  iat: number
  exp: number
}

export function verifyToken(request: NextRequest): JWTPayload | null {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(
      token, 
      process.env.NEXTAUTH_SECRET || 'health-crm-secret-key-2024'
    ) as JWTPayload

    return decoded
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

export function requireAuth(request: NextRequest) {
  const decoded = verifyToken(request)
  
  if (!decoded) {
    throw new Error('Unauthorized')
  }
  
  return decoded
}

export function requireRole(request: NextRequest, allowedRoles: string[]) {
  const decoded = requireAuth(request)
  
  if (!allowedRoles.includes(decoded.role)) {
    throw new Error('Forbidden')
  }
  
  return decoded
}
