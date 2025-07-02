"use client"

import { DragOverlay } from "@dnd-kit/core"
import { LeadCard } from "./lead-card"
import type { Lead } from "./types/kanban"

interface DragOverlayComponentProps {
  activeId: string | null
  leads: Lead[]
}

export function DragOverlayComponent({ activeId, leads }: DragOverlayComponentProps) {
  const activeLead = leads.find((lead) => lead.id === activeId)

  return (
    <DragOverlay>
      {activeLead ? (
        <div className="rotate-3 scale-105">
          <LeadCard lead={activeLead} onEdit={function (lead: Lead): void {
                      throw new Error("Function not implemented.")
                  } } />
        </div>
      ) : null}
    </DragOverlay>
  )
}
