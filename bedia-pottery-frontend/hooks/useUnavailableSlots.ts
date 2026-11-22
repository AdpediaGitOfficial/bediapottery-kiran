import { useEffect, useRef, useState } from 'react'
import { getPotteryCapacity } from '@/services/avaliablity.service'

interface SlotRef {
  _id: string
  startTime: string
  endTime: string
}

/**
 * Which of a day's time slots are unavailable right now.
 *
 * One booking owns a time window: as soon as a slot is taken (confirmed, or being
 * paid for by someone else) nobody else can book it. This asks the server about
 * every slot of the chosen day, and asks again every `refreshMs` while the page
 * is open and visible, so a slot taken by another visitor is marked unavailable
 * without a reload. The server still refuses a taken slot at booking time, so
 * this only keeps the page honest.
 *
 * A slot whose status cannot be fetched is treated as available (the booking
 * itself is checked again on the server).
 */
export function useUnavailableSlots(
  date: string,
  slots: SlotRef[],
  bookingType?: string,
  refreshMs = 30000,
): string[] {
  const [unavailableIds, setUnavailableIds] = useState<string[]>([])
  const slotsRef = useRef(slots)
  slotsRef.current = slots
  const slotsKey = slots.map((s) => `${s._id}|${s.startTime}|${s.endTime}`).join(',')

  useEffect(() => {
    if (!date || !slotsKey) {
      setUnavailableIds([])
      return
    }

    let cancelled = false

    const load = async () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return

      const results = await Promise.all(
        slotsRef.current.map(async (slot) => {
          try {
            const res = await getPotteryCapacity({
              bookingDate: date,
              startTime: slot.startTime,
              endTime: slot.endTime,
              ...(bookingType ? { bookingType } : {}),
            })
            return { id: slot._id, unavailable: !!res?.result && res.result.remainingCapacity <= 0 }
          } catch {
            return { id: slot._id, unavailable: false }
          }
        }),
      )

      if (!cancelled) {
        const next = results.filter((r) => r.unavailable).map((r) => r.id)
        setUnavailableIds((current) =>
          current.length === next.length && current.every((id, i) => id === next[i]) ? current : next,
        )
      }
    }

    load()
    const timer = setInterval(load, refreshMs)
    const onVisible = () => {
      if (document.visibilityState === 'visible') load()
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      cancelled = true
      clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [date, slotsKey, bookingType, refreshMs])

  return unavailableIds
}
