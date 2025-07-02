"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, MessageSquare, Trash2, Calendar, User } from "lucide-react"
import type { CreateInteractionFormData, CustomerInteraction } from "./types/kanban"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { User as UserType } from "./types/kanban"

interface InteractionsSectionProps {
  interactions: CreateInteractionFormData[]
  existingInteractions?: CustomerInteraction[]
  availableAttendants: UserType[]
  onInteractionsChange: (interactions: CreateInteractionFormData[]) => void
  isEditing?: boolean
}

export function InteractionsSection({
  interactions,
  existingInteractions = [],
  availableAttendants,
  onInteractionsChange,
  isEditing = false,
}: InteractionsSectionProps) {
  const [newInteraction, setNewInteraction] = useState("")
  const [selectedAttendantId, setSelectedAttendantId] = useState("")
  const [isAddingInteraction, setIsAddingInteraction] = useState(false)

  const handleAddInteraction = () => {
    if (newInteraction.trim() && selectedAttendantId) {
      const interaction: CreateInteractionFormData = {
        id: Date.now().toString(),
        additionalInfo: newInteraction.trim(),
        attendantId: selectedAttendantId,
        createdAt: new Date(),
      }

      onInteractionsChange([...interactions, interaction])
      setNewInteraction("")
      setSelectedAttendantId("")
      setIsAddingInteraction(false)
    }
  }

  const handleRemoveInteraction = (index: number) => {
    const updatedInteractions = interactions.filter((_, i) => i !== index)
    onInteractionsChange(updatedInteractions)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleAddInteraction()
    } else if (e.key === "Escape") {
      setNewInteraction("")
      setIsAddingInteraction(false)
    }
  }

  // Combine existing and new interactions for display
  const allInteractions = [
    ...existingInteractions.map((interaction) => ({
      id: interaction.id,
      additionalInfo: interaction.additionalInfo || "",
      createdAt: interaction.createdAt,
      isExisting: true,
      attendant: interaction.attendant,
    })),
    ...interactions.map((interaction) => ({
      id: interaction.id || Date.now().toString(),
      additionalInfo: interaction.additionalInfo,
      createdAt: interaction.createdAt || new Date(),
      isExisting: false,
      attendantId: interaction.attendantId,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">Atendimentos</h3>
          <Badge variant="secondary" className="text-xs">
            {allInteractions.length}
          </Badge>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsAddingInteraction(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Adicionar Atendimento
        </Button>
      </div>

      {isAddingInteraction && (
        <Card className="border-dashed border-2 border-blue-300 bg-blue-50">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="attendantSelect">Quem realizou o atendimento?</Label>
                <Select value={selectedAttendantId} onValueChange={setSelectedAttendantId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar atendente" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAttendants.map((attendant) => (
                      <SelectItem key={attendant.id} value={attendant.id}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{attendant.name}</span>
                          {attendant.position && (
                            <span className="text-xs text-gray-500">({attendant.position.type})</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newInteraction">Descrição do Atendimento</Label>
                <Textarea
                  id="newInteraction"
                  value={newInteraction}
                  onChange={(e) => setNewInteraction(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Descreva o atendimento realizado..."
                  rows={3}
                  autoFocus
                  className="bg-white"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleAddInteraction}
                  disabled={!newInteraction.trim() || !selectedAttendantId}
                >
                  Adicionar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setNewInteraction("")
                    setSelectedAttendantId("")
                    setIsAddingInteraction(false)
                  }}
                >
                  Cancelar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Dica: Use Ctrl+Enter para adicionar rapidamente</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Display interactions */}
      <div className="space-y-3 max-h-60 overflow-y-auto">
        {allInteractions.length === 0 ? (
          <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">Nenhum atendimento registrado</p>
            <p className="text-xs text-muted-foreground">Adicione atendimentos para acompanhar o histórico do lead</p>
          </div>
        ) : (
          allInteractions.map((interaction, index) => {
            const attendant = interaction.isExisting
              ? interaction.attendant
              : availableAttendants.find((a) => a.id === interaction.attendantId)

            return (
              <Card
                key={interaction.id}
                className={`${
                  interaction.isExisting ? "bg-gray-50 border-gray-200" : "bg-green-50 border-green-200 border-2"
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                      <CardTitle className="text-sm">
                        {interaction.isExisting ? "Atendimento Existente" : "Novo Atendimento"}
                      </CardTitle>
                      {attendant && (
                        <Badge variant="outline" className="text-xs">
                          <User className="h-3 w-3 mr-1" />
                          {attendant.name}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(interaction.createdAt).toLocaleDateString("pt-BR")} às{" "}
                        {new Date(interaction.createdAt).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      {!interaction.isExisting && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveInteraction(index - existingInteractions.length)}
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{interaction.additionalInfo}</p>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {allInteractions.length > 0 && (
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          {existingInteractions.length > 0 && (
            <span>
              {existingInteractions.length} atendimento{existingInteractions.length !== 1 ? "s" : ""} existente
              {existingInteractions.length !== 1 ? "s" : ""}
            </span>
          )}
          {existingInteractions.length > 0 && interactions.length > 0 && <span> • </span>}
          {interactions.length > 0 && (
            <span>
              {interactions.length} novo{interactions.length !== 1 ? "s" : ""} atendimento
              {interactions.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
