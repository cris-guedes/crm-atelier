"use client"

import { useState, useMemo } from "react"
import type { Lead, LeadStatus, Filters, User, LeadOriginType, Event, CreateLeadFormData } from "../types/kanban"
import { initialLeads } from "../data/initial-leads"
import { getBudgetCategory } from "../constants/kanban-config"
import { getDateRangeForFilter, isDateInRange } from "../utils/date-utils"

export function useLeadsKanban() {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [filters, setFilters] = useState<Filters>({
    searchTerm: "",
    budget: "all",
    assignee: "all",
    origin: "all",
    event: "all",
    dateFilter: "all",
    customDateStart: undefined,
    customDateEnd: undefined,
  })

  // Get unique values for filters
  const uniqueAssignees = useMemo((): User[] => {
    const assignees = leads.filter((lead) => lead.assignee).map((lead) => lead.assignee!)
    const uniqueMap = new Map<string, User>()
    assignees.forEach((assignee) => uniqueMap.set(assignee.id, assignee))
    return Array.from(uniqueMap.values())
  }, [leads])

  const uniqueOrigins = useMemo((): LeadOriginType[] => {
    const origins = leads.filter((lead) => lead.origin).map((lead) => lead.origin!)
    const uniqueMap = new Map<string, LeadOriginType>()
    origins.forEach((origin) => uniqueMap.set(origin.id, origin))
    return Array.from(uniqueMap.values())
  }, [leads])

  const uniqueEvents = useMemo((): Event[] => {
    const events = leads.filter((lead) => lead.event).map((lead) => lead.event!)
    const uniqueMap = new Map<string, Event>()
    events.forEach((event) => uniqueMap.set(event.id, event))
    return Array.from(uniqueMap.values())
  }, [leads])

  // Filter leads based on current filters
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        lead.customer.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        lead.customer.email.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (lead.message && lead.message.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
        (lead.additionalInfo && lead.additionalInfo.toLowerCase().includes(filters.searchTerm.toLowerCase()))

      const matchesBudget = filters.budget === "all" || getBudgetCategory(lead.budget) === filters.budget
      const matchesAssignee = filters.assignee === "all" || lead.assignee?.id === filters.assignee
      const matchesOrigin = filters.origin === "all" || lead.origin?.id === filters.origin
      const matchesEvent = filters.event === "all" || lead.event?.id === filters.event

      // Date filter logic
      let matchesDate = true
      if (filters.dateFilter !== "all") {
        if (filters.dateFilter === "custom") {
          if (filters.customDateStart && filters.customDateEnd) {
            const startDate = new Date(filters.customDateStart)
            const endDate = new Date(filters.customDateEnd)
            matchesDate = isDateInRange(lead.createdAt, startDate, endDate)
          } else {
            matchesDate = true // If custom dates not set, show all
          }
        } else {
          const dateRange = getDateRangeForFilter(filters.dateFilter)
          if (dateRange) {
            matchesDate = isDateInRange(lead.createdAt, dateRange.start, dateRange.end)
          }
        }
      }

      return matchesSearch && matchesBudget && matchesAssignee && matchesOrigin && matchesEvent && matchesDate
    })
  }, [leads, filters])

  // Group filtered leads by status
  const leadsByStatus = useMemo(() => {
    const statusMap: Record<LeadStatus, Lead[]> = {
      online_interest: [],
      store_interest: [],
      scheduled: [],
      closed_first: [],
      not_closed_chance: [],
      closed_later: [],
      lost: [],
    }

    filteredLeads.forEach((lead) => {
      // Map database status to kanban status
      let kanbanStatus: LeadStatus = "online_interest"

      if (lead.status?.type.toLowerCase().includes("online")) kanbanStatus = "online_interest"
      else if (lead.status?.type.toLowerCase().includes("loja")) kanbanStatus = "store_interest"
      else if (lead.status?.type.toLowerCase().includes("agendado")) kanbanStatus = "scheduled"
      else if (lead.status?.type.toLowerCase().includes("fechado 1")) kanbanStatus = "closed_first"
      else if (lead.status?.type.toLowerCase().includes("com chance")) kanbanStatus = "not_closed_chance"
      else if (
        lead.status?.type.toLowerCase().includes("fechado 2") ||
        lead.status?.type.toLowerCase().includes("fechado 3")
      )
        kanbanStatus = "closed_later"
      else if (lead.status?.type.toLowerCase().includes("perdido")) kanbanStatus = "lost"

      statusMap[kanbanStatus].push(lead)
    })

    return statusMap
  }, [filteredLeads])

  // Update the moveLead function to include attendant information
  const moveLead = (leadId: string, newStatus: LeadStatus, interactionNote?: string, attendantId?: string) => {
    setLeads((prevLeads) =>
      prevLeads.map((lead) => {
        if (lead.id === leadId) {
          const updatedLead = {
            ...lead,
            status: {
              id: `status-${newStatus}`,
              type: getStatusDisplayName(newStatus),
            },
            updatedAt: new Date(),
          }

          // Add interaction if provided
          if (interactionNote && attendantId) {
            const selectedAttendant = uniqueAssignees.find((a) => a.id === attendantId)
            const newInteraction = {
              id: `interaction-${Date.now()}-${Math.random()}`,
              tenantId: "tenant-1",
              leadId: leadId,
              additionalInfo: interactionNote,
              attendantId: attendantId,
              attendant: selectedAttendant,
              createdAt: new Date(),
              updatedAt: new Date(),
            }

            updatedLead.customerInteractions = [...(lead.customerInteractions || []), newInteraction]
          }

          return updatedLead
        }
        return lead
      }),
    )
  }

  // Update createLead and updateLead functions to handle attendant information
  const createLead = (status: LeadStatus, formData: CreateLeadFormData) => {
    const now = new Date()
    const leadId = Date.now().toString()
    const customerId = `customer-${leadId}`

    // Find selected assignee, origin, and event
    const selectedAssignee = formData.assigneeId ? uniqueAssignees.find((a) => a.id === formData.assigneeId) : undefined
    const selectedOrigin = formData.originId ? uniqueOrigins.find((o) => o.id === formData.originId) : undefined
    const selectedEvent = formData.eventId ? uniqueEvents.find((e) => e.id === formData.eventId) : undefined

    // Create customer interactions with attendant information
    const customerInteractions = formData.interactions.map((interaction) => {
      const selectedAttendant = interaction.attendantId
        ? uniqueAssignees.find((a) => a.id === interaction.attendantId)
        : undefined

      return {
        id: `interaction-${Date.now()}-${Math.random()}`,
        tenantId: "tenant-1",
        leadId: leadId,
        additionalInfo: interaction.additionalInfo,
        attendantId: interaction.attendantId,
        attendant: selectedAttendant,
        createdAt: interaction.createdAt || now,
        updatedAt: interaction.createdAt || now,
      }
    })

    const newLead: Lead = {
      id: leadId,
      tenantId: "tenant-1",
      customerId: customerId,
      eventId: formData.eventId || undefined,
      additionalInfo: formData.additionalInfo || undefined,
      message: formData.message || undefined,
      budget: formData.budget,
      assigneeId: formData.assigneeId || undefined,
      originId: formData.originId || undefined,
      statusId: `status-${status}`,
      createdAt: now,
      updatedAt: now,
      customer: {
        id: customerId,
        name: formData.customerName,
        phone: formData.customerPhone,
        email: formData.customerEmail,
        city: formData.customerCity || undefined,
        gender: formData.customerGender,
      },
      assignee: selectedAssignee,
      origin: selectedOrigin,
      status: {
        id: `status-${status}`,
        type: getStatusDisplayName(status),
      },
      event: selectedEvent,
      customerInteractions: customerInteractions,
    }

    setLeads((prev) => [...prev, newLead])
  }

  const updateLead = (leadId: string, formData: CreateLeadFormData) => {
    setLeads((prevLeads) =>
      prevLeads.map((lead) => {
        if (lead.id === leadId) {
          // Find selected assignee, origin, and event
          const selectedAssignee = formData.assigneeId
            ? uniqueAssignees.find((a) => a.id === formData.assigneeId)
            : undefined
          const selectedOrigin = formData.originId ? uniqueOrigins.find((o) => o.id === formData.originId) : undefined
          const selectedEvent = formData.eventId ? uniqueEvents.find((e) => e.id === formData.eventId) : undefined

          // Create new customer interactions with attendant information
          const newInteractions = formData.interactions.map((interaction) => {
            const selectedAttendant = interaction.attendantId
              ? uniqueAssignees.find((a) => a.id === interaction.attendantId)
              : undefined

            return {
              id: `interaction-${Date.now()}-${Math.random()}`,
              tenantId: "tenant-1",
              leadId: leadId,
              additionalInfo: interaction.additionalInfo,
              attendantId: interaction.attendantId,
              attendant: selectedAttendant,
              createdAt: interaction.createdAt || new Date(),
              updatedAt: interaction.createdAt || new Date(),
            }
          })

          // Combine existing and new interactions
          const existingInteractions = lead.customerInteractions || []
          const allInteractions = [...existingInteractions, ...newInteractions]

          return {
            ...lead,
            additionalInfo: formData.additionalInfo || undefined,
            message: formData.message || undefined,
            budget: formData.budget,
            assigneeId: formData.assigneeId || undefined,
            originId: formData.originId || undefined,
            eventId: formData.eventId || undefined,
            updatedAt: new Date(),
            customer: {
              ...lead.customer,
              name: formData.customerName,
              phone: formData.customerPhone,
              email: formData.customerEmail,
              city: formData.customerCity || undefined,
              gender: formData.customerGender,
            },
            assignee: selectedAssignee,
            origin: selectedOrigin,
            event: selectedEvent,
            customerInteractions: allInteractions,
          }
        }
        return lead
      }),
    )
  }

  const deleteLead = (leadId: string) => {
    setLeads((prevLeads) => prevLeads.filter((lead) => lead.id !== leadId))
  }

  const clearFilters = () => {
    setFilters({
      searchTerm: "",
      budget: "all",
      assignee: "all",
      origin: "all",
      event: "all",
      dateFilter: "all",
      customDateStart: undefined,
      customDateEnd: undefined,
    })
  }

  return {
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
  }
}

function getStatusDisplayName(status: LeadStatus): string {
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
