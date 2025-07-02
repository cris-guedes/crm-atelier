"use client"

import { useState } from "react"
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core"
import { LeadFilters } from "./lead-filters"
import { KanbanColumn } from "./kanban-column"
import { DragOverlayComponent } from "./drag-overlay"
import { EditLeadModal } from "./edit-lead-modal"
import { StageTransitionModal } from "./stage-transition-modal"
import { useLeadsKanban } from "./hooks/use-leads-kanban"
import { kanbanColumns } from "./constants/kanban-config"
import type { LeadStatus, Lead } from "./types/kanban"

export default function LeadsKanbanBoard() {
  const {
    leads,
    filters,
    setFilters,
    uniqueAssignees,
    uniqueOrigins,
    uniqueEvents,
    filteredLeads,
    leadsByStatus,
    moveLead,
    createLead,
    updateLead,
    deleteLead,
    clearFilters,
  } = useLeadsKanban()

  const [activeId, setActiveId] = useState<string | null>(null)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Stage transition modal state
  const [isTransitionModalOpen, setIsTransitionModalOpen] = useState(false)
  const [pendingTransition, setPendingTransition] = useState<{
    lead: Lead
    fromStatus: LeadStatus
    toStatus: LeadStatus
  } | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveId(active.id as string)
  }

  // Helper function to check if transition requires modal
  const requiresModal = (fromStatus: LeadStatus, toStatus: LeadStatus): boolean => {
    // Check if transition requires interaction (early stages to later stages)
    const requiresInteraction =
      ["online_interest", "store_interest", "scheduled"].includes(fromStatus) &&
      ["closed_first", "not_closed_chance", "closed_later", "lost"].includes(toStatus)

    // Check if transition is forbidden (going backwards)
    const isForbiddenTransition =
      ["closed_first", "not_closed_chance", "closed_later", "lost"].includes(fromStatus) &&
      ["online_interest", "store_interest", "scheduled"].includes(toStatus)

    return requiresInteraction || isForbiddenTransition
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      setActiveId(null)
      return
    }

    const activeId = active.id as string
    const overId = over.id as string

    // Check if we're dropping over a column
    const isOverColumn = kanbanColumns.some((col) => col.status === overId)

    if (isOverColumn) {
      const newStatus = overId as LeadStatus
      const draggedLead = filteredLeads.find((lead) => lead.id === activeId)

      if (draggedLead) {
        // Get current status of the lead
        let currentStatus: LeadStatus = "online_interest"

        if (draggedLead.status?.type.toLowerCase().includes("online")) currentStatus = "online_interest"
        else if (draggedLead.status?.type.toLowerCase().includes("loja")) currentStatus = "store_interest"
        else if (draggedLead.status?.type.toLowerCase().includes("agendado")) currentStatus = "scheduled"
        else if (draggedLead.status?.type.toLowerCase().includes("fechado 1")) currentStatus = "closed_first"
        else if (draggedLead.status?.type.toLowerCase().includes("com chance")) currentStatus = "not_closed_chance"
        else if (
          draggedLead.status?.type.toLowerCase().includes("fechado 2") ||
          draggedLead.status?.type.toLowerCase().includes("fechado 3")
        )
          currentStatus = "closed_later"
        else if (draggedLead.status?.type.toLowerCase().includes("perdido")) currentStatus = "lost"

        // If same status, do nothing
        if (currentStatus === newStatus) {
          setActiveId(null)
          return
        }

        // Check if this transition requires a modal
        if (requiresModal(currentStatus, newStatus)) {
          // Set up pending transition for modal
          setPendingTransition({
            lead: draggedLead,
            fromStatus: currentStatus,
            toStatus: newStatus,
          })
          setIsTransitionModalOpen(true)
        } else {
          // Move directly without modal for unproblematic transitions
          moveLead(activeId, newStatus)
        }
      }
    }

    setActiveId(null)
  }

  const handleConfirmTransition = (
    leadId: string,
    newStatus: LeadStatus,
    interactionNote?: string,
    attendantId?: string,
  ) => {
    moveLead(leadId, newStatus, interactionNote, attendantId)
    setPendingTransition(null)
    setIsTransitionModalOpen(false)
  }

  const handleCancelTransition = () => {
    setPendingTransition(null)
    setIsTransitionModalOpen(false)
  }

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead)
    setIsEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setEditingLead(null)
    setIsEditModalOpen(false)
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Pipeline de Leads</h1>
          <p className="text-gray-600">Gerencie seus leads através do funil de vendas</p>
        </div>

        {/* Filters */}
        <LeadFilters
          filters={filters}
          onFiltersChange={setFilters}
          uniqueAssignees={uniqueAssignees}
          uniqueOrigins={uniqueOrigins}
          uniqueEvents={uniqueEvents}
          totalLeads={leads.length}
          filteredCount={filteredLeads.length}
          onClearFilters={clearFilters}
        />

        {/* Kanban Board */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-4">
            {kanbanColumns.map((column) => (
              <KanbanColumn
                key={column.id}
                status={column.status}
                leads={leadsByStatus[column.status]}
                totalLeads={filteredLeads.length}
                availableAssignees={uniqueAssignees}
                availableOrigins={uniqueOrigins}
                availableEvents={uniqueEvents}
                onCreateLead={createLead}
                onEditLead={handleEditLead}
              />
            ))}
          </div>

          <DragOverlayComponent activeId={activeId} leads={filteredLeads} />
        </DndContext>

        {/* Edit Lead Modal */}
        <EditLeadModal
          lead={editingLead}
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onUpdateLead={updateLead}
          onDeleteLead={deleteLead}
          availableAssignees={uniqueAssignees}
          availableOrigins={uniqueOrigins}
          availableEvents={uniqueEvents}
        />

        {/* Stage Transition Modal - Only shown when needed */}
        {pendingTransition && (
          <StageTransitionModal
            isOpen={isTransitionModalOpen}
            onClose={() => setIsTransitionModalOpen(false)}
            lead={pendingTransition.lead}
            fromStatus={pendingTransition.fromStatus}
            toStatus={pendingTransition.toStatus}
            availableAttendants={uniqueAssignees}
            onConfirmTransition={handleConfirmTransition}
            onCancelTransition={handleCancelTransition}
          />
        )}
      </div>
    </div>
  )
}
