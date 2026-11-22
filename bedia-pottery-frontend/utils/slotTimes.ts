/**
 * Time-slot overlap, mirroring the server's rule (the studio is one room, and one
 * booking owns a time window): two sessions on the same day clash when their
 * times share any part of the day. Back-to-back sessions (one ends exactly when
 * the next starts) do not clash.
 */
const MINUTES_IN_DAY = 24 * 60

/** "6:00 PM", "10:30 AM" or "18:00" as minutes after midnight; null if unreadable. */
export function parseTimeToMinutes(time?: string): number | null {
  if (!time) return null
  const match = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i)
  if (!match) return null

  let hours = Number(match[1])
  const minutes = Number(match[2])
  const period = match[3]?.toUpperCase()

  if (minutes > 59) return null
  if (period) {
    if (hours < 1 || hours > 12) return null
    if (period === 'PM' && hours !== 12) hours += 12
    if (period === 'AM' && hours === 12) hours = 0
  } else if (hours > 23) {
    return null
  }

  return hours * 60 + minutes
}

interface SlotTimes {
  startTime?: string
  endTime?: string
}

function toSpan(slot: SlotTimes): { start: number; end: number } | null {
  const start = parseTimeToMinutes(slot.startTime)
  const end = parseTimeToMinutes(slot.endTime)
  if (start === null || end === null) return null
  return { start, end: end > start ? end : end + MINUTES_IN_DAY }
}

const spansOverlap = (a: { start: number; end: number }, b: { start: number; end: number }) =>
  a.start < b.end && b.start < a.end

export function slotsOverlap(a: SlotTimes, b: SlotTimes): boolean {
  const spanA = toSpan(a)
  const spanB = toSpan(b)

  // Without usable end times, fall back to comparing start times.
  if (!spanA || !spanB) {
    const startA = parseTimeToMinutes(a.startTime)
    const startB = parseTimeToMinutes(b.startTime)
    return startA !== null && startB !== null && startA === startB
  }

  return (
    spansOverlap(spanA, spanB) ||
    spansOverlap(spanA, { start: spanB.start + MINUTES_IN_DAY, end: spanB.end + MINUTES_IN_DAY }) ||
    spansOverlap(spanA, { start: spanB.start - MINUTES_IN_DAY, end: spanB.end - MINUTES_IN_DAY })
  )
}
