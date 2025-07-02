"use client"

import { useState } from "react"
import { Search, Filter, Calendar, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Filters, User, LeadOriginType, Event, BudgetCategory, DateFilterType } from "./types/kanban"
import { formatDateRange } from "./utils/date-utils"

interface LeadFiltersProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  uniqueAssignees: User[]
  uniqueOrigins: LeadOriginType[]
  uniqueEvents: Event[]
  totalLeads: number
  filteredCount: number
  onClearFilters: () => void
}

export function LeadFilters({
  filters,
  onFiltersChange,
  uniqueAssignees,
  uniqueOrigins,
  uniqueEvents,
  totalLeads,
  filteredCount,
  onClearFilters,
}: LeadFiltersProps) {
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false)

  const hasActiveFilters =
    filters.searchTerm ||
    filters.budget !== "all" ||
    filters.assignee !== "all" ||
    filters.origin !== "all" ||
    filters.event !== "all" ||
    filters.dateFilter !== "all"

  const handleDateFilterChange = (dateFilter: DateFilterType) => {
    onFiltersChange({
      ...filters,
      dateFilter,
      customDateStart: undefined,
      customDateEnd: undefined,
    })

    if (dateFilter !== "custom") {
      setIsDatePopoverOpen(false)
    }
  }

  const handleCustomDateChange = (field: "customDateStart" | "customDateEnd", value: string) => {
    onFiltersChange({
      ...filters,
      [field]: value,
    })
  }

  const getDateFilterLabel = () => {
    switch (filters.dateFilter) {
      case "today":
        return "Hoje"
      case "yesterday":
        return "Ontem"
      case "last7days":
        return "Últimos 7 dias"
      case "last30days":
        return "Últimos 30 dias"
      case "custom":
        if (filters.customDateStart && filters.customDateEnd) {
          return formatDateRange(filters.customDateStart, filters.customDateEnd)
        }
        return "Período personalizado"
      default:
        return "Todas as datas"
    }
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar leads..."
              value={filters.searchTerm}
              onChange={(e) => onFiltersChange({ ...filters, searchTerm: e.target.value })}
              className="w-64"
            />
          </div>

          <Select
            value={filters.budget}
            onValueChange={(value) => onFiltersChange({ ...filters, budget: value as BudgetCategory | "all" })}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Orçamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os orçamentos</SelectItem>
              <SelectItem value="low">Até R$ 10.000</SelectItem>
              <SelectItem value="medium">R$ 10.001 - R$ 20.000</SelectItem>
              <SelectItem value="high">Acima de R$ 20.000</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.assignee} onValueChange={(value) => onFiltersChange({ ...filters, assignee: value })}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Responsável" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {uniqueAssignees.map((assignee) => (
                <SelectItem key={assignee.id} value={assignee.id}>
                  {assignee.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.origin} onValueChange={(value) => onFiltersChange({ ...filters, origin: value })}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Origem" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {uniqueOrigins.map((origin) => (
                <SelectItem key={origin.id} value={origin.id}>
                  {origin.type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.event} onValueChange={(value) => onFiltersChange({ ...filters, event: value })}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Evento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {uniqueEvents.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.name || event.eventType.type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Filter */}
          <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`w-48 justify-start text-left font-normal ${
                  filters.dateFilter !== "all" ? "bg-blue-50 border-blue-200" : ""
                }`}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {getDateFilterLabel()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="start">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Filtrar por data de criação</Label>
                  <Select value={filters.dateFilter} onValueChange={handleDateFilterChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as datas</SelectItem>
                      <SelectItem value="today">Hoje</SelectItem>
                      <SelectItem value="yesterday">Ontem</SelectItem>
                      <SelectItem value="last7days">Últimos 7 dias</SelectItem>
                      <SelectItem value="last30days">Últimos 30 dias</SelectItem>
                      <SelectItem value="custom">Período personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {filters.dateFilter === "custom" && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="startDate" className="text-xs">
                          Data inicial
                        </Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={filters.customDateStart || ""}
                          onChange={(e) => handleCustomDateChange("customDateStart", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endDate" className="text-xs">
                          Data final
                        </Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={filters.customDateEnd || ""}
                          onChange={(e) => handleCustomDateChange("customDateEnd", e.target.value)}
                        />
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setIsDatePopoverOpen(false)}
                      disabled={!filters.customDateStart || !filters.customDateEnd}
                      className="w-full"
                    >
                      Aplicar período
                    </Button>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <Button variant="outline" onClick={onClearFilters} className="flex items-center gap-2 bg-transparent">
            <Filter className="h-4 w-4" />
            Limpar filtros
          </Button>
        </div>

        {hasActiveFilters && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Mostrando {filteredCount} de {totalLeads} leads
                {filters.searchTerm && ` • Busca: "${filters.searchTerm}"`}
                {filters.budget !== "all" && ` • Orçamento: ${filters.budget}`}
                {filters.assignee !== "all" && ` • Responsável selecionado`}
                {filters.origin !== "all" && ` • Origem selecionada`}
                {filters.event !== "all" && ` • Evento selecionado`}
                {filters.dateFilter !== "all" && ` • Data: ${getDateFilterLabel()}`}
              </p>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearFilters}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  Limpar
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
