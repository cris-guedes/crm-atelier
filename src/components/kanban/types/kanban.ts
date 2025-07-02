export type LeadStatus =
  | "online_interest"
  | "store_interest"
  | "scheduled"
  | "closed_first"
  | "not_closed_chance"
  | "closed_later"
  | "lost"

export type BudgetCategory = "low" | "medium" | "high"

export type GenderType = "MAN" | "WOMAN"

export type DateFilterType = "all" | "today" | "yesterday" | "last7days" | "last30days" | "custom"

export interface CustomerInteraction {
  id: string
  tenantId: string
  leadId: string
  additionalInfo?: string
  attendantId?: string
  attendant?: User
  createdAt: Date
  updatedAt: Date
}

export interface Lead {
  id: string
  tenantId: string
  customerId: string
  eventId?: string
  additionalInfo?: string
  message?: string
  budget: number
  assigneeId?: string
  originId?: string
  statusId?: string
  createdAt: Date
  updatedAt: Date

  // Relations
  customer: Customer
  assignee?: User
  origin?: LeadOriginType
  status?: LeadStatusType
  event?: Event
  customerInteractions?: CustomerInteraction[]
}

export interface Customer {
  id: string
  name: string
  phone: string
  email: string
  city?: string
  gender: GenderType
}

export interface User {
  id: string
  name: string
  email: string
  position?: PositionType
}

export interface PositionType {
  id: string
  type: string
}

export interface LeadOriginType {
  id: string
  type: string
}

export interface LeadStatusType {
  id: string
  type: string
}

export interface Event {
  id: string
  name?: string
  eventType: EventType
  city?: string
  date: string
}

export interface EventType {
  id: string
  type: string
}

export interface Filters {
  searchTerm: string
  budget: BudgetCategory | "all"
  assignee: string
  origin: string
  event: string
  dateFilter: DateFilterType
  customDateStart?: string
  customDateEnd?: string
}

export interface KanbanColumn {
  id: string
  title: string
  status: LeadStatus
  color: string
  icon: any
}

export interface BudgetRange {
  min: number
  max: number
  label: string
  color: string
}

export interface DragData {
  type: "lead"
  lead: Lead
}

export interface CreateLeadFormData {
  customerName: string
  customerEmail: string
  customerPhone: string
  customerCity: string
  customerGender: GenderType
  message: string
  additionalInfo: string
  budget: number
  assigneeId: string
  originId: string
  eventId: string
  eventDate: string
  interactions: CreateInteractionFormData[]
}

export interface CreateInteractionFormData {
  id?: string
  additionalInfo: string
  attendantId?: string
  createdAt?: Date
}
