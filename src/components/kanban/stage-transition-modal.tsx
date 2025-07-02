"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, MessageSquare, ArrowRight, User } from "lucide-react"
import type { Lead, LeadStatus, User as UserType } from "./types/kanban"

interface StageTransitionModalProps {
  isOpen: boolean
  onClose: () => void
  lead: Lead
  fromStatus: LeadStatus
  toStatus: LeadStatus
  availableAttendants: UserType[]
  onConfirmTransition: (leadId: string, newStatus: LeadStatus, interactionNote?: string, attendantId?: string) => void
  onCancelTransition: () => void
}

export function StageTransitionModal({
  isOpen,
  onClose,
  lead,
  fromStatus,
  toStatus,
  availableAttendants,
  onConfirmTransition,
  onCancelTransition,
}: StageTransitionModalProps) {
  const [interactionNote, setInteractionNote] = useState("")
  const [selectedAttendantId, setSelectedAttendantId] = useState("")

  // Check if transition requires interaction
  const requiresInteraction =
    ["online_interest", "store_interest", "scheduled"].includes(fromStatus) &&
    ["closed_first", "not_closed_chance", "closed_later", "lost"].includes(toStatus)

  // Check if transition is forbidden (going backwards)
  const isForbiddenTransition =
    ["closed_first", "not_closed_chance", "closed_later", "lost"].includes(fromStatus) &&
    ["online_interest", "store_interest", "scheduled"].includes(toStatus)

  const getStatusDisplayName = (status: LeadStatus): string => {
    const statusNames: Record<LeadStatus, string> = {
      online_interest: "Interesse inicial (Online)",
      store_interest: "Interesse inicial (na loja)",
      scheduled: "Agendado atendimento",
      closed_first: "Fechado 1ª visita",
      not_closed_chance: "Não fechado (COM CHANCE)",
      closed_later: "Fechado 2 ou 3ª Visita",
      lost: "Não fechado (PERDIDO)",
    }
    return statusNames[status]
  }

  const handleConfirm = () => {
    if (requiresInteraction && (!interactionNote.trim() || !selectedAttendantId)) {
      return // Don't proceed without interaction note and attendant
    }

    onConfirmTransition(lead.id, toStatus, interactionNote.trim() || undefined, selectedAttendantId || undefined)
    setInteractionNote("")
    setSelectedAttendantId("")
    onClose()
  }

  const handleCancel = () => {
    onCancelTransition()
    setInteractionNote("")
    setSelectedAttendantId("")
    onClose()
  }

  if (isForbiddenTransition) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <DialogTitle className="text-red-900">Movimento Não Permitido</DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800 mb-3">
                <strong>Impossível voltar etapas no funil de vendas!</strong>
              </p>

              <div className="space-y-2 text-sm text-red-700">
                <div className="flex items-center gap-2">
                  <span className="font-medium">De:</span>
                  <span>{getStatusDisplayName(fromStatus)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4" />
                  <span className="font-medium">Para:</span>
                  <span>{getStatusDisplayName(toStatus)}</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              Leads que já passaram pelas etapas de atendimento (4-7) não podem retornar às etapas iniciais (1-3).
            </p>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button onClick={handleCancel} className="w-full">
                Entendi
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (requiresInteraction) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <DialogTitle>Registrar Atendimento</DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 mb-3">
                <strong>Atendimento obrigatório para esta transição!</strong>
              </p>

              <div className="space-y-2 text-sm text-blue-700">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Lead:</span>
                  <span>{lead.customer.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">De:</span>
                  <span>{getStatusDisplayName(fromStatus)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4" />
                  <span className="font-medium">Para:</span>
                  <span>{getStatusDisplayName(toStatus)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="attendantSelect">Quem realizou o atendimento? *</Label>
                <Select value={selectedAttendantId} onValueChange={setSelectedAttendantId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar atendente">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {selectedAttendantId
                          ? availableAttendants.find((a) => a.id === selectedAttendantId)?.name
                          : "Selecionar atendente"}
                      </div>
                    </SelectValue>
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
                <Label htmlFor="interactionNote">Descreva o atendimento realizado *</Label>
                <Textarea
                  id="interactionNote"
                  value={interactionNote}
                  onChange={(e) => setInteractionNote(e.target.value)}
                  placeholder="Ex: Cliente visitou a loja, apresentamos o catálogo completo, demonstrou interesse no pacote premium..."
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500">Este atendimento será registrado no histórico do lead</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!interactionNote.trim() || !selectedAttendantId}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Registrar e Mover
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // This case should never be reached since we only show modal when needed
  return null
}
