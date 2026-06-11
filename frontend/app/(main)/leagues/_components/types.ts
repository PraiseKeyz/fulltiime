export const TAB_OPTIONS = [
  { label: 'Leagues', value: 'LEAGUES' as const },
  { label: 'Cups & Tournaments', value: 'CUPS' as const },
]

export type LeagueTab = (typeof TAB_OPTIONS)[number]['value']
