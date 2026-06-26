// Exact UTC instant boundaries for the CALLER's local calendar day (today +
// offset). Only the client genuinely knows the visitor's timezone — building
// the Date from separate y/m/d components (not a string) makes JS interpret
// them in the browser's local timezone, including DST, with no manual
// timezone math needed. Pass these straight through as `from`/`to` to the
// backend instead of a bare date string, which can only ever describe a UTC
// day server-side and silently drifts from the visitor's actual "today" for
// roughly |their UTC offset| hours out of every 24.
export function getLocalDayRange(offset = 0): { from: string; to: string } {
  const now = new Date()
  const from = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset)
  const to   = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset + 1)
  return { from: from.toISOString(), to: to.toISOString() }
}
