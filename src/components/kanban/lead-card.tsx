"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Phone, Mail, MapPin, Calendar, User, Clock, MessageSquare } from "lucide-react"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { budgetRanges, getBudgetCategory, formatCurrency } from "./constants/kanban-config"
import { getTimeInBoard } from "./utils/date-utils"
import type { Lead } from "./types/kanban"

interface LeadCardProps {
  lead: Lead
  onEdit: (lead: Lead) => void
}

export function LeadCard({ lead, onEdit }: LeadCardProps) {
  const budgetCategory = getBudgetCategory(lead.budget)
  const budgetConfig = budgetRanges[budgetCategory]
  const timeInBoard = getTimeInBoard(lead.createdAt)

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
    data: {
      type: "lead",
      lead,
    },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // Only open edit modal if not dragging
    if (!isDragging) {
      e.stopPropagation()
      onEdit(lead)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`mb-3 cursor-grab active:cursor-grabbing transition-all duration-200 select-none ${
        isDragging ? "opacity-50 scale-105 rotate-2 z-50" : "hover:scale-[1.02]"
      }`}
    >
      <Card
        className="hover:shadow-md transition-shadow border-l-4 border-l-blue-400 cursor-pointer"
        onClick={handleCardClick}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-sm font-medium leading-tight mb-1">{lead.customer.name}</CardTitle>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" />
                {lead.customer.phone || "Não informado"}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge variant="outline" className={`text-xs ${budgetConfig.color}`}>
                {formatCurrency(lead.budget)}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {timeInBoard}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {lead.customer.email && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mail className="h-3 w-3" />
              {lead.customer.email}
            </div>
          )}

          {lead.customer.city && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {lead.customer.city}
            </div>
          )}

          {lead.event && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {lead.event.name || lead.event.eventType.type}
            </div>
          )}

          {/* Interactions indicator */}
          {lead.customerInteractions && lead.customerInteractions.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                <MessageSquare className="h-3 w-3" />
                {lead.customerInteractions.length} atendimento{lead.customerInteractions.length !== 1 ? "s" : ""}
              </div>
              {/* Show last attendant */}
              {lead.customerInteractions.length > 0 && lead.customerInteractions[0].attendant && (
                <div className="flex items-center gap-1 text-xs text-gray-600 px-2">
                  <User className="h-3 w-3" />
                  <span>Último: {lead.customerInteractions[0].attendant.name}</span>
                </div>
              )}
            </div>
          )}

          {lead.message && (
            <p className="text-xs text-muted-foreground line-clamp-2 bg-gray-50 p-2 rounded">{lead.message}</p>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="flex gap-1">
              {lead.origin && (
                <Badge variant="secondary" className="text-xs">
                  {lead.origin.type}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{lead.createdAt.toLocaleDateString("pt-BR")}</span>
              {lead.assignee && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <Avatar className="h-5 w-5">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="text-xs">
                      {lead.assignee.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
