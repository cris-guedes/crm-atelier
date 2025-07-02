"use client"

import { Badge } from "@/components/ui/badge"
import { useDroppable } from "@dnd-kit/core"
import { kanbanColumns } from "./constants/kanban-config"
import { LeadCard } from "./lead-card"
import { CreateLeadModal } from "./create-lead-modal"
import type { Lead, LeadStatus, User, LeadOriginType, Event, CreateLeadFormData } from "./types/kanban"

interface KanbanColumnProps {
  status: LeadStatus
  leads: Lead[]
  totalLeads: number
  availableAssignees: User[]
  availableOrigins: LeadOriginType[]
  availableEvents: Event[]
  onCreateLead: (status: LeadStatus, formData: CreateLeadFormData) => void
  onEditLead: (lead: Lead) => void
}

export function KanbanColumn({
  status,
  leads,
  totalLeads,
  availableAssignees,
  availableOrigins,
  availableEvents,
  onCreateLead,
  onEditLead,
}: KanbanColumnProps) {
  const column = kanbanColumns.find((col) => col.status === status)!
  const Icon = column.icon

  const { isOver, setNodeRef } = useDroppable({
    id: status,
    data: {
      type: "column",
      status,
    },
  })

  return (
    <div className="flex-1 min-w-80">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon className={`h-5 w-5 ${column.color}`} />
          <h3 className="font-semibold text-sm">{column.title}</h3>
          <Badge variant="secondary" className="text-xs">
            {leads.length}
          </Badge>
        </div>
        <div className="h-1 bg-gray-200 rounded-full">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              status === "won" ? "bg-green-400" : status === "lost" ? "bg-red-400" : "bg-blue-400"
            }`}
            style={{ width: `${Math.min((leads.length / Math.max(totalLeads, 1)) * 100, 100)}%` }}
          />
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={`space-y-2 min-h-96 rounded-lg transition-all duration-200 relative ${
          isOver
            ? "bg-blue-50 border-2 border-dashed border-blue-400 scale-[1.02] shadow-lg p-3"
            : "border-2 border-transparent hover:border-gray-200 p-3"
        }`}
      >
        {isOver && (
          <div className="absolute inset-0 bg-blue-100 bg-opacity-50 rounded-lg flex items-center justify-center pointer-events-none z-10">
            <div className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium shadow-lg">
              Solte aqui para mover o lead
            </div>
          </div>
        )}

        {/* Add Lead Button - Now at the top */}
        <div className="mb-4">
          <CreateLeadModal
            status={status}
            onCreateLead={onCreateLead}
            availableAssignees={availableAssignees}
            availableOrigins={availableOrigins}
            availableEvents={availableEvents}
          />
        </div>

        {/* Lead Cards */}
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} onEdit={onEditLead} />
        ))}

        {/* Empty state when no leads */}
        {leads.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">Nenhum lead nesta etapa</p>
          </div>
        )}
      </div>
    </div>
  )
}
