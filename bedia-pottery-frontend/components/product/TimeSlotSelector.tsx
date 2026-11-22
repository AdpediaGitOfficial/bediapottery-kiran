'use client'

import React from 'react'
import { TimeSlot } from '@/types'

/**
 * TimeSlotSelector Component
 * Single Responsibility: Handle time slot selection only
 * Interface Segregation: Only depends on TimeSlot interface
 */
interface TimeSlotSelectorProps {
  slots: TimeSlot[]
  selectedSlotId: string | null
  onSlotSelect: (slotId: string) => void
  className?: string
  /** Slots someone else has already taken; shown greyed out and not selectable. */
  unavailableSlotIds?: string[]
}

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  slots,
  selectedSlotId,
  onSlotSelect,
  className = '',
  unavailableSlotIds = [],
}) => {
  if (slots.length === 0) {
    return null
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-lg font-medium text-gray-900">Select Time Slot</h3>
      <div className="grid xl:grid-cols-3 lg:grid-cols-2 xl:gap-3 gap-2">
        {slots.map((slot) => (
          <button
            key={slot._id}
            onClick={() => slot.capacity && !unavailableSlotIds.includes(slot._id) && onSlotSelect(slot._id)}
            disabled={!slot.capacity || unavailableSlotIds.includes(slot._id)}
            className={`px-1 py-3  font-medium transition-colors duration-200 ${
              selectedSlotId === slot._id && !unavailableSlotIds.includes(slot._id)
                ? 'bg-primary text-white border border-primary'
                : slot.capacity && !unavailableSlotIds.includes(slot._id)
                ? 'bg-white text-gray-700 border border-gray-300 hover:border-primary'
                : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
            }`}
          >
            {slot.startTime} - {slot.endTime}
            {unavailableSlotIds.includes(slot._id) && (
              <span className="block text-xs font-normal">FULLY BOOKED</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export default TimeSlotSelector
