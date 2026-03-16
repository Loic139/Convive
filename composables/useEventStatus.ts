import type { EventStatus } from '~/types'

export function useEventStatus() {
  function getSeatsColor(seatsRemaining: number, maxSeats: number): string {
    if (seatsRemaining === 0) return 'text-red-600'
    const ratio = seatsRemaining / maxSeats
    if (ratio <= 0.2) return 'text-orange-600'
    return 'text-sage-dark'
  }

  function getSeatsRingColor(seatsRemaining: number, maxSeats: number): string {
    if (seatsRemaining === 0) return 'ring-red-200 bg-red-50'
    const ratio = seatsRemaining / maxSeats
    if (ratio <= 0.2) return 'ring-orange-200 bg-orange-50'
    return 'ring-sage-100 bg-sage-50'
  }

  function isBtnDisabled(status: EventStatus): boolean {
    return status !== 'active'
  }

  function formatDate(dateStr: string, locale = 'fr-FR'): string {
    return new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateStr))
  }

  function formatTime(dateStr: string, locale = 'fr-FR'): string {
    return new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr))
  }

  function formatDateShort(dateStr: string, locale = 'fr-FR'): string {
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateStr))
  }

  function isPast(dateStr: string): boolean {
    return new Date(dateStr) < new Date()
  }

  return {
    getSeatsColor,
    getSeatsRingColor,
    isBtnDisabled,
    formatDate,
    formatTime,
    formatDateShort,
    isPast,
  }
}
