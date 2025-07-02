export function getTimeInBoard(createdAt: Date): string {
  const now = new Date()
  const diffInMs = now.getTime() - createdAt.getTime()

  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInDays > 0) {
    return `${diffInDays} dia${diffInDays > 1 ? "s" : ""}`
  } else if (diffInHours > 0) {
    return `${diffInHours} hora${diffInHours > 1 ? "s" : ""}`
  } else if (diffInMinutes > 0) {
    return `${diffInMinutes} min`
  } else {
    return "Agora"
  }
}

export function formatDateForInput(date: Date): string {
  return date.toISOString().split("T")[0]
}

export function isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const startOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
  const endOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())

  return dateOnly >= startOnly && dateOnly <= endOnly
}

export function getDateRangeForFilter(filterType: string): { start: Date; end: Date } | null {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  switch (filterType) {
    case "today":
      return {
        start: today,
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
      }

    case "yesterday":
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
      return {
        start: yesterday,
        end: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1),
      }

    case "last7days":
      return {
        start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
      }

    case "last30days":
      return {
        start: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
      }

    default:
      return null
  }
}

export function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)

  const startFormatted = start.toLocaleDateString("pt-BR")
  const endFormatted = end.toLocaleDateString("pt-BR")

  if (startFormatted === endFormatted) {
    return startFormatted
  }

  return `${startFormatted} - ${endFormatted}`
}
