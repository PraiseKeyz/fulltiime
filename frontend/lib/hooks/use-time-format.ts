import { useTimeZone } from '@/providers/timezone-provider'
import { formatKickoff, formatMatchDate, formatFullDate } from '@/lib/utils'

export function useTimeFormat() {
  const timeZone = useTimeZone()
  return {
    timeZone,
    formatKickoff: (date: string) => formatKickoff(date, timeZone),
    formatMatchDate: (date: string) => formatMatchDate(date, timeZone),
    formatFullDate: (date: string) => formatFullDate(date, timeZone),
  }
}
