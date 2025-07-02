import { Globe, Store, Calendar, CheckCircle2, AlertCircle, Trophy, X } from "lucide-react"
import type { KanbanColumn, BudgetRange, BudgetCategory } from "../types/kanban"

export const budgetRanges: Record<BudgetCategory, BudgetRange> = {
  low: { min: 0, max: 10000, label: "Até R$ 10.000", color: "bg-red-100 text-red-800" },
  medium: { min: 10001, max: 20000, label: "R$ 10.001 - R$ 20.000", color: "bg-yellow-100 text-yellow-800" },
  high: {
    min: 20001,
    max: Number.POSITIVE_INFINITY,
    label: "Acima de R$ 20.000",
    color: "bg-green-100 text-green-800",
  },
}

export const kanbanColumns: KanbanColumn[] = [
  {
    id: "online_interest",
    title: "Interesse inicial (Online)",
    status: "online_interest",
    color: "text-blue-600",
    icon: Globe,
  },
  {
    id: "store_interest",
    title: "Interesse inicial (na loja)",
    status: "store_interest",
    color: "text-purple-600",
    icon: Store,
  },
  {
    id: "scheduled",
    title: "Agendado atendimento",
    status: "scheduled",
    color: "text-orange-600",
    icon: Calendar,
  },
  {
    id: "closed_first",
    title: "Fechado 1ª visita",
    status: "closed_first",
    color: "text-green-600",
    icon: CheckCircle2,
  },
  {
    id: "not_closed_chance",
    title: "Não fechado (COM CHANCE)",
    status: "not_closed_chance",
    color: "text-yellow-600",
    icon: AlertCircle,
  },
  {
    id: "closed_later",
    title: "Fechado 2 ou 3ª Visita",
    status: "closed_later",
    color: "text-emerald-600",
    icon: Trophy,
  },
  {
    id: "lost",
    title: "Não fechado (PERDIDO)",
    status: "lost",
    color: "text-red-600",
    icon: X,
  },
]

export function getBudgetCategory(budget: number): BudgetCategory {
  if (budget <= budgetRanges.low.max) return "low"
  if (budget <= budgetRanges.medium.max) return "medium"
  return "high"
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}
