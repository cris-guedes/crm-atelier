"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"
import type { LeadStatus } from "../types/kanban"

interface AddLeadFormProps {
  status: LeadStatus
  onAddLead: (status: LeadStatus, customerName: string) => void
}

export function AddLeadForm({ status, onAddLead }: AddLeadFormProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [customerName, setCustomerName] = useState("")

  const handleSubmit = () => {
    if (customerName.trim()) {
      onAddLead(status, customerName)
      setCustomerName("")
      setIsAdding(false)
    }
  }

  const handleCancel = () => {
    setCustomerName("")
    setIsAdding(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit()
    } else if (e.key === "Escape") {
      handleCancel()
    }
  }

  if (isAdding) {
    return (
      <div className="p-3 border-2 border-dashed border-gray-300 rounded-lg bg-white">
        <Input
          placeholder="Nome do cliente..."
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          className="mb-2"
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSubmit} disabled={!customerName.trim()}>
            Adicionar Lead
          </Button>
          <Button size="sm" variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Button
      variant="ghost"
      className="w-full border-2 border-dashed border-gray-300 h-12 text-gray-500 hover:border-gray-400 hover:text-gray-600"
      onClick={() => setIsAdding(true)}
    >
      <Plus className="h-4 w-4 mr-2" />
      Adicionar Lead
    </Button>
  )
}
