"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import type {
  LeadStatus,
  CreateLeadFormData,
  User,
  LeadOriginType,
  Event,
  GenderType,
  CreateInteractionFormData,
} from "./types/kanban"
import { formatDateForInput } from "./utils/date-utils"
import { InteractionsSection } from "./interactions-section"

interface CreateLeadModalProps {
  status: LeadStatus
  onCreateLead: (status: LeadStatus, formData: CreateLeadFormData) => void
  availableAssignees: User[]
  availableOrigins: LeadOriginType[]
  availableEvents: Event[]
}

export function CreateLeadModal({
  status,
  onCreateLead,
  availableAssignees,
  availableOrigins,
  availableEvents,
}: CreateLeadModalProps) {
  const [open, setOpen] = useState(false)
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.customerName.trim()) {
      return
    }

    onCreateLead(status, formData)

    // Reset form
    setFormData({
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

    setOpen(false)
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="w-full border-2 border-dashed border-gray-300 h-12 text-gray-500 hover:border-gray-400 hover:text-gray-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Lead
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Lead</DialogTitle>
        </DialogHeader>

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
            availableAttendants={availableAssignees}
            onInteractionsChange={handleInteractionsChange}
          />

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!formData.customerName.trim()}>
              Criar Lead
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
