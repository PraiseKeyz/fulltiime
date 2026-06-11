import type { PlayerPosition } from '@/lib/api/domain'

export const POSITION_ORDER: PlayerPosition[] = ['GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'FORWARD']

export const POSITION_LABEL: Record<PlayerPosition, string> = {
  GOALKEEPER: 'Goalkeepers',
  DEFENDER:   'Defenders',
  MIDFIELDER: 'Midfielders',
  FORWARD:    'Forwards',
}
