"use client"

import type React from "react"

import { useState } from "react"
import type { Status } from "../types/kanban"

export function useDragDrop(onMoveCard: (cardId: string, newStatus: Status) => void) {
  const [draggedCard, setDraggedCard] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<Status | null>(null)

  const handleDragStart = (cardId: string) => {
    setDraggedCard(cardId)
  }

  const handleDragEnd = () => {
    setDraggedCard(null)
    setDragOverColumn(null)
  }

  const handleDragEnter = (status: Status) => {
    if (draggedCard) {
      setDragOverColumn(status)
    }
  }

  const handleDragLeave = (e: React.DragEvent, status: Status) => {
    // Only clear drag over if we're actually leaving the drop zone
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverColumn(null)
    }
  }

  const handleDrop = (targetStatus: Status) => {
    if (draggedCard) {
      onMoveCard(draggedCard, targetStatus)
    }
    setDraggedCard(null)
    setDragOverColumn(null)
  }

  return {
    draggedCard,
    dragOverColumn,
    handleDragStart,
    handleDragEnd,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
  }
}
