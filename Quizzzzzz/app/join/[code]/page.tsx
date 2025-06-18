"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Users, QrCode } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CharacterCustomization, type CharacterCustomization as CharacterCustomizationType } from "@/components/CharacterCustomization"

interface Room {
  id: string
  code: string
  name: string
  isActive: boolean
  createdAt: string
}

export default function JoinRoomPage({ params }: { params: { code: string } }) {
  const router = useRouter()
  const [playerName, setPlayerName] = useState("")
  const [isJoining, setIsJoining] = useState(false)
  const [isValidating, setIsValidating] = useState(true)
  const [room, setRoom] = useState<Room | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [characterCustomization, setCharacterCustomization] = useState<CharacterCustomizationType>({
    color: "#FFD700",
    glasses: 0,
    smile: 0,
  })

  useEffect(() => {
    // Get existing user name if available
    const existingName = localStorage.getItem("userName")
    if (existingName && existingName !== "Guest Player") {
      setPlayerName(existingName)
    }

    // Get existing character customization if available
    const existingCustomization = localStorage.getItem("characterCustomization")
    if (existingCustomization) {
      try {
        setCharacterCustomization(JSON.parse(existingCustomization))
      } catch (err) {
        console.error("Failed to parse character customization:", err)
      }
    }

    // Validate room code
    const validateRoom = async () => {
      try {
        const response = await fetch(`/api/rooms/validate?code=${params.code}`)
        const data = await response.json()

        if (!response.ok) {
          setError(data.error || 'Failed to validate room')
          return
        }

        setRoom(data.room)
      } catch (err) {
        setError('Failed to connect to server')
      } finally {
        setIsValidating(false)
      }
    }

    validateRoom()
  }, [params.code])

  const joinRoom = async () => {
    if (!playerName.trim()) {
      toast.error('Please enter your name')
      return
    }

    if (!room) {
      toast.error('Room is not available')
      return
    }

    setIsJoining(true)

    try {
      // Save player name and customization
      localStorage.setItem("userName", playerName)
      localStorage.setItem("userMode", "user")
      localStorage.setItem("characterCustomization", JSON.stringify(characterCustomization))

      // Join the room
      const response = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId: room.id,
          playerName: playerName.trim(),
          characterCustomization,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to join room')
      }

      // Redirect to lobby
      router.push(`/lobby/${room.name}?joined=${room.code}`)
    } catch (err) {
      toast.error('Failed to join room. Please try again.')
      setIsJoining(false)
    }
  }

  if (isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2 border-yellow-300">
          <CardContent className="p-6 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-yellow-600" />
            <p className="text-gray-600">Validating room code...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2 border-red-200">
          <CardHeader className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <CardTitle className="text-red-700">Room Not Found</CardTitle>
            <CardDescription>{error || 'The room code is invalid or has expired.'}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push("/")} className="bg-yellow-500 hover:bg-yellow-600">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2 border-yellow-300">
          <CardHeader className="text-center bg-gradient-to-r from-yellow-500 to-amber-500 text-white">
            <div className="text-4xl mb-4">🎬</div>
            <CardTitle>KARAFATA Quiz Room</CardTitle>
            <CardDescription className="text-yellow-100">{room.name}</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <QrCode className="w-5 h-5 text-yellow-600" />
                <span className="text-sm text-gray-600">Room Code:</span>
              </div>
              <div className="text-2xl font-bold text-yellow-700 bg-yellow-50 px-4 py-2 rounded-lg border border-yellow-200 tracking-wider">
                {room.code}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="playerName">Your Name</Label>
                <Input
                  id="playerName"
                  placeholder="Enter your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="border-yellow-200 focus:border-yellow-400"
                  onKeyPress={(e) => e.key === "Enter" && joinRoom()}
                  maxLength={30}
                  disabled={isJoining}
                />
              </div>

              <Button
                onClick={joinRoom}
                disabled={!playerName.trim() || isJoining}
                className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600"
                size="lg"
              >
                {isJoining ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Joining Room...
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4 mr-2" />
                    Join Room
                  </>
                )}
              </Button>
            </div>

            <div className="text-center text-sm text-gray-500">
              <p>Make sure you have a stable internet connection</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-yellow-300">
          <CardHeader className="text-center bg-gradient-to-r from-yellow-500 to-amber-500 text-white">
            <CardTitle>Customize Your Character</CardTitle>
            <CardDescription className="text-yellow-100">Make your duck unique!</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <CharacterCustomization
              onSave={setCharacterCustomization}
              initialCustomization={characterCustomization}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 