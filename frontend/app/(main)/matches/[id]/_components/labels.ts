// Shorten a knockout slot label for compact display.
//   "3rd Group A/B/C/D/F" → "3A/B/C/D/F"
//   "Winner Match 74"     → "W74"
//   "Winner Semi-final 2" → "W SF2"
export function shortSlot(s: string | null): string {
  if (!s) return 'TBD'
  let m: RegExpMatchArray | null
  if ((m = s.match(/^(\d)(?:st|nd|rd|th) Group (.+)$/i)))          return `${m[1]}${m[2]}`
  if ((m = s.match(/^Winner Match (\d+)$/i)))                      return `W${m[1]}`
  if ((m = s.match(/^Winner (Quarter-final|Semi-final) (\d+)$/i))) return `W ${m[1].startsWith('Q') ? 'QF' : 'SF'}${m[2]}`
  if ((m = s.match(/^Loser (Quarter-final|Semi-final) (\d+)$/i)))  return `L ${m[1].startsWith('Q') ? 'QF' : 'SF'}${m[2]}`
  return s
}
