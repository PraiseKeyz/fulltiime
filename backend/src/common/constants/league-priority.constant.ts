export const LEAGUE_PRIORITY: Record<number, number> = {
  732:  100, // World Cup
  8:     90, // Premier League
  564:   80, // La Liga
  384:   70, // Serie A
  82:    60, // Bundesliga
  1107:  50, // CAF Champions League
  720:   40, // WC Qualification — Europe
  726:   35, // WC Qualification — South America
  717:   30, // WC Qualification — Concacaf
  714:   28, // WC Qualification — Asia
  711:   26, // CAF World Cup Qualifiers
  723:   24, // WC Qualification — Oceania
  729:   22, // WC Qualification — Intercontinental Playoffs
};

export function leaguePriority(apiFootballId: number | null | undefined): number {
  return apiFootballId != null ? (LEAGUE_PRIORITY[apiFootballId] ?? 0) : 0;
}
