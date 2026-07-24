'use client'

import { useEffect, useState } from 'react'
import { Search, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { timeAgo } from '@/lib/editorial'
import type { SubscriberStatus } from '@/lib/api/domain'
import { useDeleteSubscriber, useSubscribers } from '@/lib/api/hooks/newsletter-admin.hooks'
import { Button } from '@/components/ui/button'
import { ConfirmModal } from '@/components/ui/modal'
import { NewsletterNavTabs } from '../_components/nav-tabs'

const STATUS_TABS: { label: string; value: SubscriberStatus | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Unsubscribed', value: 'UNSUBSCRIBED' },
]

const STATUS_STYLE: Record<SubscriberStatus, string> = {
  CONFIRMED: 'border-primary/60 text-primary',
  UNSUBSCRIBED: 'border-border text-muted-foreground line-through',
}

export default function SubscribersPage() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<SubscriberStatus | undefined>(undefined)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 350)
    return () => clearTimeout(t)
  }, [search])

  const { data, isLoading } = useSubscribers(page, status, debouncedSearch)
  const deleteSubscriber = useDeleteSubscriber()

  const subscribers = data?.subscribers ?? []
  const totalPages = data?.pages ?? 1

  return (
    <>
      <div className="mb-6">
        <span className="mb-1.5 block font-mono text-[11px] tracking-[0.14em] text-primary">
          ◎ STUDIO
        </span>
        <h1 className="m-0 text-[clamp(26px,4vw,38px)] uppercase leading-none">Newsletter</h1>
        <p className="mt-2 font-mono text-[12px] text-muted-foreground">
          {data?.total ?? '…'} total · confirmed subscribers receive every campaign you send
        </p>
      </div>

      <NewsletterNavTabs />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {STATUS_TABS.map((tab) => (
          <Button
            key={tab.label}
            size="sm"
            variant={status === tab.value ? 'primary' : 'outline'}
            onClick={() => {
              setStatus(tab.value)
              setPage(1)
            }}
            className={cn('rounded-full', status !== tab.value && 'text-txt2 hover:border-primary hover:text-primary')}
          >
            {tab.label}
          </Button>
        ))}

        <div className="relative ml-auto max-w-[280px] flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email…"
            className="w-full rounded-full border border-border bg-background-secondary py-2.5 pl-10 pr-4 text-[13px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[56px] animate-pulse border border-border bg-muted" />
          ))}
        </div>
      ) : subscribers.length === 0 ? (
        <div className="border border-dashed border-border py-16 text-center font-mono text-[13px] text-muted-foreground">
          No subscribers match this view yet.
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {subscribers.map((s) => (
            <div
              key={s.id}
              className="flex flex-wrap items-center gap-3 border border-border bg-background-secondary px-4 py-3"
            >
              <span className="min-w-0 flex-1 truncate text-[14px] font-semibold text-head">{s.email}</span>
              <span
                className={cn(
                  'inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold tracking-[0.08em] uppercase',
                  STATUS_STYLE[s.status],
                )}
              >
                {s.status}
              </span>
              <span className="hidden shrink-0 font-mono text-[11px] text-muted-foreground sm:inline">
                subscribed {timeAgo(s.subscribed_at)}
              </span>
              <button
                onClick={() => setPendingDelete(s.id)}
                title="Remove subscriber"
                className="shrink-0 rounded-full border border-border p-2 text-txt2 transition-colors hover:border-destructive hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p - 1)}
            disabled={page <= 1}
            className="rounded-full text-txt2 hover:border-primary hover:text-primary disabled:opacity-30"
          >
            ← Prev
          </Button>
          <span className="font-mono text-[12px] text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages}
            className="rounded-full text-txt2 hover:border-primary hover:text-primary disabled:opacity-30"
          >
            Next →
          </Button>
        </div>
      )}

      {pendingDelete && (
        <ConfirmModal
          title="Remove subscriber?"
          message="They'll be permanently removed from the list. This can't be undone."
          confirmLabel="Remove"
          destructive
          pending={deleteSubscriber.isPending}
          onConfirm={() =>
            deleteSubscriber.mutate(pendingDelete, { onSuccess: () => setPendingDelete(null) })
          }
          onClose={() => setPendingDelete(null)}
        />
      )}
    </>
  )
}
