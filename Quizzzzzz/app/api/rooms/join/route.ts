import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { roomId, playerName, characterCustomization } = body

    if (!roomId || !playerName) {
      return NextResponse.json(
        { error: 'Room ID and player name are required' },
        { status: 400 }
      )
    }

    // Check if room exists and is active
    const room = await prisma.room.findUnique({
      where: {
        id: roomId,
        isActive: true,
      },
    })

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found or has expired' },
        { status: 404 }
      )
    }

    // Create player in the room with character customization
    const player = await prisma.player.create({
      data: {
        name: playerName,
        roomId: room.id,
        score: 0,
        isActive: true,
        customization: characterCustomization ? {
          create: {
            color: characterCustomization.color,
            glasses: characterCustomization.glasses,
            smile: characterCustomization.smile,
          },
        } : undefined,
      },
      include: {
        customization: true,
      },
    })

    return NextResponse.json({ player })
  } catch (error) {
    console.error('Error joining room:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 