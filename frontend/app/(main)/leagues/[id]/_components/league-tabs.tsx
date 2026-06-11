import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { Tab } from './types'

export function LeagueTabs({
  tab, onSelect, hasStandings, hasBracket, tableLabel,
}: {
  tab: Tab
  onSelect: (value: Tab) => void
  hasStandings: boolean
  hasBracket: boolean
  tableLabel: string
}) {
  const tabClass = (active: boolean) => cn(
    'h-auto rounded-none border-b-2 -mb-px px-5 py-2.5 text-[13px] hover:bg-transparent',
    active ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground',
  )

  return (
    <div className="flex gap-1 border-b border-border mb-6">
      {hasStandings && (
        <Button onClick={() => onSelect('table')} variant="ghost" className={tabClass(tab === 'table')}>
          {tableLabel}
        </Button>
      )}
      {hasBracket && (
        <Button onClick={() => onSelect('knockout')} variant="ghost" className={tabClass(tab === 'knockout')}>
          Knockout
        </Button>
      )}
      <Button onClick={() => onSelect('fixtures')} variant="ghost" className={tabClass(tab === 'fixtures')}>
        Fixtures &amp; Results
      </Button>
    </div>
  )
}
