"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Trash2, Save } from "lucide-react"
import type {
  Lead,
  CreateLeadFormData,
  User,
  LeadOriginType,
  Event,
  GenderType,
  CreateInteractionFormData,
} from "./types/kanban"
import { formatDateForInput } from "./utils/date-utils"
import { formatCurrency } from "./constants/kanban-config"
import { InteractionsSection } from "./interactions-section"

interface EditLeadModalProps {
  lead: Lead | null
  isOpen: boolean
  onClose: () => void
  onUpdateLead: (leadId: string, formData: CreateLeadFormData) => void
  onDeleteLead: (leadId: string) => void
  availableAssignees: User[]
  availableOrigins: LeadOriginType[]
  availableEvents: Event[]
}

export function EditLeadModal({
  lead,
  isOpen,
  onClose,
  onUpdateLead,
  onDeleteLead,
  availableAssignees,
  availableOrigins,
  availableEvents,
}: EditLeadModalProps) {
  const [formData, setFormData] = useState<CreateLeadFormData>({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerCity: "",
    customerGender: "MAN",
    message: "",
    additionalInfo: "",
    budget: 10000,
    assigneeId: "defaultAssigneeId",
    originId: "defaultOriginId",
    eventId: "defaultEventId",
    eventDate: formatDateForInput(new Date()),
    interactions: [],
  })

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Populate form when lead changes
  useEffect(() => {
    if (lead) {
      setFormData({
        customerName: lead.customer.name,
        customerEmail: lead.customer.email || "",
        customerPhone: lead.customer.phone || "",
        customerCity: lead.customer.city || "",
        customerGender: lead.customer.gender,
        message: lead.message || "",
        additionalInfo: lead.additionalInfo || "",
        budget: lead.budget,
        assigneeId: lead.assignee?.id || "defaultAssigneeId",
        originId: lead.origin?.id || "defaultOriginId",
        eventId: lead.event?.id || "defaultEventId",
        eventDate: lead.event?.date || formatDateForInput(new Date()),
        interactions: [],
      })
    }
  }, [lead])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!lead || !formData.customerName.trim()) {
      return
    }

    onUpdateLead(lead.id, formData)
    onClose()
  }

  const handleDelete = () => {
    if (lead) {
      onDeleteLead(lead.id)
      onClose()
      setShowDeleteConfirm(false)
    }
  }

  const handleInputChange = (field: keyof CreateLeadFormData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleInteractionsChange = (interactions: CreateInteractionFormData[]) => {
    setFormData((prev) => ({
      ...prev,
      interactions,
    }))
  }

  if (!lead) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Editar Lead</DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  ID: {lead.id}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {formatCurrency(lead.budget)}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Criado em {lead.createdAt.toLocaleDateString("pt-BR")}
                </Badge>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {showDeleteConfirm ? (
          <div className="space-y-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="text-center">
              <h3 className="text-lg font-medium text-red-900">Confirmar Exclusão</h3>
              <p className="text-sm text-red-700 mt-2">
                Tem certeza que deseja excluir o lead de <strong>{lead.customer.name}</strong>?
              </p>
              <p className="text-xs text-red-600 mt-1">Esta ação não pode ser desfeita.</p>
            </div>
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Excluir Lead
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informações do Cliente</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Nome *</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => handleInputChange("customerName", e.target.value)}
                    placeholder="Nome completo do cliente"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Email</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => handleInputChange("customerEmail", e.target.value)}
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Telefone</Label>
                  <Input
                    id="customerPhone"
                    value={formData.customerPhone}
                    onChange={(e) => handleInputChange("customerPhone", e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerCity">Cidade</Label>
                  <Input
                    id="customerCity"
                    value={formData.customerCity}
                    onChange={(e) => handleInputChange("customerCity", e.target.value)}
                    placeholder="São Paulo"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerGender">Gênero</Label>
                <Select
                  value={formData.customerGender}
                  onValueChange={(value) => handleInputChange("customerGender", value as GenderType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MAN">Masculino</SelectItem>
                    <SelectItem value="WOMAN">Feminino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Lead Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informações do Lead</h3>

              <div className="space-y-2">
                <Label htmlFor="message">Mensagem do Cliente</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  placeholder="Mensagem ou interesse demonstrado pelo cliente..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalInfo">Informações Adicionais</Label>
                <Textarea
                  id="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={(e) => handleInputChange("additionalInfo", e.target.value)}
                  placeholder="Observações internas sobre o lead..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget">Orçamento (R$)</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={formData.budget}
                    onChange={(e) => handleInputChange("budget", Number(e.target.value))}
                    placeholder="10000"
                    min="0"
                    step="100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eventDate">Data do Evento</Label>
                  <Input
                    id="eventDate"
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => handleInputChange("eventDate", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Assignment and Origin */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Atribuição e Origem</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assigneeId">Responsável</Label>
                  <Select value={formData.assigneeId} onValueChange={(value) => handleInputChange("assigneeId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="defaultAssigneeId">Nenhum</SelectItem>
                      {availableAssignees.map((assignee) => (
                        <SelectItem key={assignee.id} value={assignee.id}>
                          {assignee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="originId">Origem do Lead</Label>
                  <Select value={formData.originId} onValueChange={(value) => handleInputChange("originId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar origem" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="defaultOriginId">Nenhuma</SelectItem>
                      {availableOrigins.map((origin) => (
                        <SelectItem key={origin.id} value={origin.id}>
                          {origin.type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventId">Evento Relacionado</Label>
                <Select value={formData.eventId} onValueChange={(value) => handleInputChange("eventId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar evento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="defaultEventId">Nenhum</SelectItem>
                    {availableEvents.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.name || event.eventType.type} - {event.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Interactions Section */}
            <InteractionsSection
              interactions={formData.interactions}
              existingInteractions={lead?.customerInteractions || []}
              onInteractionsChange={handleInteractionsChange}
              isEditing={true}
            />

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!formData.customerName.trim()}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
