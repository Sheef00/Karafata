import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const roomCode = searchParams.get('code')

    if (!roomCode) {
      return NextResponse.json(
        { error: 'Room code is required' },
        { status: 400 }
      )
    }

    const room = await prisma.room.findUnique({
      where: {
        code: roomCode.toUpperCase(),
        isActive: true,
      },
      select: {
        id: true,
        code: true,
        name: true,
        isActive: true,
        createdAt: true,
      },
    })

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found or has expired' },
        { status: 404 }
      )
    }

    return NextResponse.json({ room })
  } catch (error) {
    console.error('Error validating room:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 