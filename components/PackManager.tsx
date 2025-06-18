"use client"

import { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Edit2, Trash2, Clock } from "lucide-react"
import { toast } from "sonner"
import { AnimatedPackCard } from "./AnimatedPackCard"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"

interface Question {
  question: string
  options: string[]
  correctAnswer: number
}

interface Pack {
  id: string
  name: string
  description: string
  questions: Question[]
  isPublic: boolean
  timeLimit?: number
}

interface PackManagerProps {
  onSelectPack: (pack: Pack) => void
}

export function PackManager({ onSelectPack }: PackManagerProps) {
  const [packs, setPacks] = useState<Pack[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null)
  const [newPack, setNewPack] = useState<Partial<Pack>>({
    name: "",
    description: "",
    questions: [],
    isPublic: false,
    timeLimit: 30,
  })

  // Load packs from localStorage on mount
  useEffect(() => {
    const savedPacks = localStorage.getItem("quizPacks")
    if (savedPacks) {
      try {
        setPacks(JSON.parse(savedPacks))
      } catch (err) {
        console.error("Failed to load saved packs:", err)
        toast.error("Failed to load saved packs")
      }
    }
  }, [])

  // Save packs to localStorage when they change
  useEffect(() => {
    localStorage.setItem("quizPacks", JSON.stringify(packs))
  }, [packs])

  const validatePack = useCallback((pack: Partial<Pack>): string | null => {
    if (!pack.name?.trim()) return "Pack name is required"
    if (!pack.description?.trim()) return "Pack description is required"
    if (!pack.questions?.length) return "At least one question is required"
    
    // Validate each question
    for (const [index, question] of (pack.questions || []).entries()) {
      if (!question.question.trim()) return `Question ${index + 1} is empty`
      if (question.options.some(opt => !opt.trim())) {
        return `Question ${index + 1} has empty options`
      }
      if (question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
        return `Question ${index + 1} has invalid correct answer`
      }
    }

    return null
  }, [])

  const handleCreatePack = useCallback(() => {
    const error = validatePack(newPack)
    if (error) {
      toast.error(error)
      return
    }

    const pack: Pack = {
      id: selectedPack?.id || Math.random().toString(36).substr(2, 9),
      name: newPack.name!,
      description: newPack.description!,
      questions: newPack.questions || [],
      isPublic: newPack.isPublic || false,
      timeLimit: Math.max(10, Math.min(120, newPack.timeLimit || 30)),
    }

    if (selectedPack) {
      setPacks(packs.map(p => p.id === pack.id ? pack : p))
      toast.success("Pack updated successfully!")
    } else {
      setPacks([...packs, pack])
      toast.success("Pack created successfully!")
    }

    setNewPack({
      name: "",
      description: "",
      questions: [],
      isPublic: false,
      timeLimit: 30,
    })
    setIsCreating(false)
    setSelectedPack(null)
  }, [newPack, packs, selectedPack, validatePack])

  const handleAddQuestion = useCallback(() => {
    setNewPack(prev => ({
      ...prev,
      questions: [
        ...(prev.questions || []),
        {
          question: "",
          options: ["", "", "", ""],
          correctAnswer: 0,
        },
      ],
    }))
  }, [])

  const handleQuestionChange = useCallback((index: number, field: keyof Question, value: any) => {
    setNewPack(prev => ({
      ...prev,
      questions: prev.questions?.map((q, i) =>
        i === index ? { ...q, [field]: value } : q
      ),
    }))
  }, [])

  const handleOptionChange = useCallback((questionIndex: number, optionIndex: number, value: string) => {
    setNewPack(prev => ({
      ...prev,
      questions: prev.questions?.map((q, i) =>
        i === questionIndex
          ? {
              ...q,
              options: q.options.map((opt, j) =>
                j === optionIndex ? value : opt
              ),
            }
          : q
      ),
    }))
  }, [])

  const handleEditPack = useCallback((pack: Pack) => {
    setSelectedPack(pack)
    setNewPack(pack)
    setIsCreating(true)
  }, [])

  const handleDeletePack = useCallback((pack: Pack) => {
    if (window.confirm("Are you sure you want to delete this pack?")) {
      setPacks(packs.filter(p => p.id !== pack.id))
      toast.success("Pack deleted")
    }
  }, [packs])

  const handleCancel = useCallback(() => {
    setIsCreating(false)
    setSelectedPack(null)
    setNewPack({
      name: "",
      description: "",
      questions: [],
      isPublic: false,
      timeLimit: 30,
    })
  }, [])

  return (
    <div className="space-y-6">
      {!isCreating ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packs.map(pack => (
            <AnimatedPackCard
              key={pack.id}
              pack={pack}
              isSelected={selectedPack?.id === pack.id}
              onSelect={setSelectedPack}
              onEdit={handleEditPack}
              onDelete={handleDeletePack}
            />
          ))}
          <Card
            className="border-dashed hover:border-yellow-500 cursor-pointer transition-all duration-300 hover:scale-105"
            onClick={() => setIsCreating(true)}
          >
            <CardContent className="flex items-center justify-center h-32">
              <div className="text-center">
                <Plus className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                <p className="text-sm text-gray-500">Create New Pack</p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="packName">Pack Name</Label>
                <Input
                  id="packName"
                  value={newPack.name}
                  onChange={e => setNewPack(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter pack name"
                  maxLength={50}
                />
              </div>
              <div>
                <Label htmlFor="packDescription">Description</Label>
                <Input
                  id="packDescription"
                  value={newPack.description}
                  onChange={e => setNewPack(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter pack description"
                  maxLength={200}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Time Limit per Question</Label>
                  <span className="text-sm text-gray-500">{newPack.timeLimit || 30} seconds</span>
                </div>
                <Slider
                  value={[newPack.timeLimit || 30]}
                  min={10}
                  max={120}
                  step={5}
                  onValueChange={([value]) => setNewPack(prev => ({ ...prev, timeLimit: value }))}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="public"
                  checked={newPack.isPublic}
                  onCheckedChange={(checked) => setNewPack(prev => ({ ...prev, isPublic: checked }))}
                />
                <Label htmlFor="public">Make this pack public</Label>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Questions</h3>
                <Button onClick={handleAddQuestion} size="sm">
                  Add Question
                </Button>
              </div>

              {newPack.questions?.map((question, qIndex) => (
                <Card key={qIndex} className="p-4">
                  <div className="space-y-4">
                    <div>
                      <Label>Question {qIndex + 1}</Label>
                      <Input
                        value={question.question}
                        onChange={e => handleQuestionChange(qIndex, "question", e.target.value)}
                        placeholder="Enter question"
                        maxLength={200}
                      />
                    </div>
                    <div className="space-y-2">
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-2">
                          <Input
                            value={option}
                            onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)}
                            placeholder={`Option ${oIndex + 1}`}
                            maxLength={100}
                          />
                          <Button
                            variant={question.correctAnswer === oIndex ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleQuestionChange(qIndex, "correctAnswer", oIndex)}
                          >
                            Correct
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button onClick={handleCreatePack}>
                {selectedPack ? "Update Pack" : "Create Pack"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 