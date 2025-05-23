import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    const testPassword = '123456'
    const testHash = '$2a$10$N9qo8uLOickgx2ZMRZoMye.IY2QZz1W3jjCjVyOUIAJAPJXgggH3m'
    
    console.log('Testing bcrypt...')
    console.log('Password:', testPassword)
    console.log('Hash:', testHash)
    
    // Test the hash we're using
    const result1 = await bcrypt.compare(testPassword, testHash)
    console.log('Direct test result:', result1)
    
    // Generate a new hash and test it
    const newHash = await bcrypt.hash(testPassword, 10)
    console.log('Generated new hash:', newHash)
    
    const result2 = await bcrypt.compare(testPassword, newHash)
    console.log('New hash test result:', result2)
    
    // Test with different bcrypt versions
    const saltRounds = 12
    const anotherHash = await bcrypt.hash(testPassword, saltRounds)
    console.log('Another hash (12 rounds):', anotherHash)
    
    const result3 = await bcrypt.compare(testPassword, anotherHash)
    console.log('Another hash test result:', result3)
    
    return NextResponse.json({
      testPassword,
      originalHash: testHash,
      originalResult: result1,
      newHash,
      newResult: result2,
      anotherHash,
      anotherResult: result3,
      bcryptVersion: require('bcryptjs/package.json').version
    })
    
  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
