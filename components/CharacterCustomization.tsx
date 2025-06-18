"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

interface CharacterCustomizationProps {
  onSave: (customization: CharacterCustomization) => void
  initialCustomization?: CharacterCustomization
}

export interface CharacterCustomization {
  color: string
  glasses: number
  smile: number
}

const DUCK_COLORS = [
  "#FFD700", // Yellow
  "#FFA500", // Orange
  "#FF69B4", // Pink
  "#98FB98", // Light Green
  "#87CEEB", // Sky Blue
  "#DDA0DD", // Plum
]

const GLASSES_STYLES = [
  "none",
  "round",
  "square",
  "star",
]

const SMILE_STYLES = [
  "neutral",
  "happy",
  "excited",
]

export function CharacterCustomization({ onSave, initialCustomization }: CharacterCustomizationProps) {
  const [customization, setCustomization] = useState<CharacterCustomization>(
    initialCustomization || {
      color: DUCK_COLORS[0],
      glasses: 0,
      smile: 0,
    }
  )

  const handleColorChange = (color: string) => {
    setCustomization(prev => ({ ...prev, color }))
  }

  const handleGlassesChange = (value: number) => {
    setCustomization(prev => ({ ...prev, glasses: value }))
  }

  const handleSmileChange = (value: number) => {
    setCustomization(prev => ({ ...prev, smile: value }))
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6 space-y-6">
        <div className="flex justify-center">
          <div className="relative w-32 h-32">
            {/* Duck Body */}
            <div
              className="absolute w-full h-full rounded-full"
              style={{ backgroundColor: customization.color }}
            />
            
            {/* Duck Face */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16">
              {/* Eyes */}
              <div className="absolute top-4 left-4 w-4 h-4 bg-black rounded-full" />
              <div className="absolute top-4 right-4 w-4 h-4 bg-black rounded-full" />
              
              {/* Glasses */}
              {customization.glasses > 0 && (
                <div className={cn(
                  "absolute top-3 left-1/2 transform -translate-x-1/2",
                  "w-16 h-8 border-2 border-black rounded-full",
                  customization.glasses === 2 && "rounded-none",
                  customization.glasses === 3 && "w-20 h-10"
                )} />
              )}
              
              {/* Smile */}
              <div className={cn(
                "absolute bottom-4 left-1/2 transform -translate-x-1/2",
                "w-8 h-4 border-b-2 border-black",
                customization.smile === 1 && "w-10 h-6",
                customization.smile === 2 && "w-12 h-8"
              )} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Color Selection */}
          <div>
            <h3 className="text-sm font-medium mb-2">Duck Color</h3>
            <div className="flex gap-2">
              {DUCK_COLORS.map((color) => (
                <button
                  key={color}
                  className={cn(
                    "w-8 h-8 rounded-full border-2",
                    customization.color === color ? "border-black" : "border-transparent"
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorChange(color)}
                />
              ))}
            </div>
          </div>

          {/* Glasses Selection */}
          <div>
            <h3 className="text-sm font-medium mb-2">Glasses Style</h3>
            <div className="flex gap-2">
              {GLASSES_STYLES.map((style, index) => (
                <Button
                  key={style}
                  variant={customization.glasses === index ? "default" : "outline"}
                  onClick={() => handleGlassesChange(index)}
                  className="capitalize"
                >
                  {style}
                </Button>
              ))}
            </div>
          </div>

          {/* Smile Selection */}
          <div>
            <h3 className="text-sm font-medium mb-2">Smile Style</h3>
            <div className="flex gap-2">
              {SMILE_STYLES.map((style, index) => (
                <Button
                  key={style}
                  variant={customization.smile === index ? "default" : "outline"}
                  onClick={() => handleSmileChange(index)}
                  className="capitalize"
                >
                  {style}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <Button
          className="w-full"
          onClick={() => onSave(customization)}
        >
          Save Character
        </Button>
      </CardContent>
    </Card>
  )
} 