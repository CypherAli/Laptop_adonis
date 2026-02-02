/**
 * Format date consistently for SSR
 * Prevents hydration mismatch between server and client
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${month}/${day}/${year}`
}

/**
 * Format date with time
 */
export function formatDateTime(date: Date | string): string {
  const d = new Date(date)
  const datePart = formatDate(d)
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${datePart} ${hours}:${minutes}`
}
