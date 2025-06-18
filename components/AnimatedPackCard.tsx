"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2, Clock, Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface Pack {
  id: string
  name: string
  description: string
  questions: Question[]
  isPublic: boolean
  timeLimit?: number
}

interface Question {
  question: string
  options: string[]
  correctAnswer: number
}

interface AnimatedPackCardProps {
  pack: Pack
  isSelected?: boolean
  onSelect: (pack: Pack) => void
  onEdit: (pack: Pack) => void
  onDelete: (pack: Pack) => void
}

export function AnimatedPackCard({
  pack,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: AnimatedPackCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Memoize handlers to prevent unnecessary re-renders
  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit(pack)
  }, [pack, onEdit])

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(pack)
  }, [pack, onDelete])

  const handleSelect = useCallback(() => {
    onSelect(pack)
  }, [pack, onSelect])

  // Ensure timeLimit is within valid range
  const timeLimit = Math.max(10, Math.min(120, pack.timeLimit || 30))

  return (
    <motion.div
      initial={{ scale: 1 }}
      animate={{
        scale: isSelected ? 1.05 : isHovered ? 1.02 : 1,
        rotate: isSelected ? 2 : 0,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleSelect}
      className="cursor-pointer"
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className={cn(
          "relative overflow-hidden transition-all duration-300",
          isSelected
            ? "border-2 border-yellow-500 shadow-lg"
            : "border-2 border-yellow-200 hover:border-yellow-400",
          "bg-gradient-to-br from-yellow-50 to-amber-50"
        )}
      >
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-2 right-2"
            >
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>

        <CardHeader className="pb-2">
          <CardTitle className="flex justify-between items-center">
            <span className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent truncate max-w-[200px]">
              {pack.name}
            </span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleEdit}
                className="hover:bg-yellow-100"
                aria-label="Edit pack"
              >
                <Edit2 className="w-4 h-4 text-yellow-600" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                className="hover:bg-red-100"
                aria-label="Delete pack"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 line-clamp-2">{pack.description}</p>
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-yellow-600" />
              <span>{timeLimit}s per question</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-yellow-600" />
              <span>{pack.questions.length} questions</span>
            </div>
          </div>

          <div className="flex gap-2">
            {pack.questions.slice(0, 3).map((q, i) => (
              <div
                key={i}
                className="flex-1 h-1 rounded-full bg-gradient-to-r from-yellow-400 to-amber-400"
              />
            ))}
            {pack.questions.length > 3 && (
              <div className="flex-1 h-1 rounded-full bg-gray-200" />
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
} 