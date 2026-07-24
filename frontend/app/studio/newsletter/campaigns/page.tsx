'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { timeAgo } from '@/lib/editorial'
import type { CampaignStatus } from '@/lib/api/domain'
import { useCampaigns, useDeleteCampaign } from '@/lib/api/hooks/newsletter-admin.hooks'
import { Button } from '@/components/ui/button'
import { ConfirmModal } from '@/components/ui/modal'
import { NewsletterNavTabs } from '../_components/nav-tabs'

const STATUS_STYLE: Record<CampaignStatus, string> = {
  DRAFT: 'border-border text-txt2',
  SENDING: 'border-gold/60 text-gold',
  SENT: 'border-primary/60 text-primary',
}

export default function CampaignsPage() {
  const { data: campaigns, isLoading } = useCampaigns()
  const deleteCampaign = useDeleteCampaign()
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="mb-1.5 block font-mono text-[11px] tracking-[0.14em] text-primary">
            ◎ STUDIO
          </span>
          <h1 className="m-0 text-[clamp(26px,4vw,38px)] uppercase leading-none">Newsletter</h1>
        </div>
        <Button asChild variant="primary" className="rounded-full px-5">
          <Link href="/studio/newsletter/campaigns/new">
            <Plus />
            New Campaign
          </Link>
        </Button>
      </div>

      <NewsletterNavTabs />

      {isLoading ? (
        <div className="flex flex-col gap-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[64px] animate-pulse border border-border bg-muted" />
          ))}
        </div>
      ) : !campaigns || campaigns.length === 0 ? (
        <div className="border border-dashed border-border py-16 text-center font-mono text-[13px] text-muted-foreground">
          No campaigns yet — create your first one.
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {campaigns.map((c) => (
            <Link
              key={c.id}
              href={`/studio/newsletter/campaigns/${c.id}`}
              className="flex flex-wrap items-center gap-3 border border-border bg-background-secondary px-4 py-3.5 transition-colors hover:border-primary/40"
            >
              <span className="min-w-0 flex-1 truncate text-[15px] font-bold text-head">{c.subject}</span>
              <span
                className={cn(
                  'inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold tracking-[0.08em] uppercase',
                  STATUS_STYLE[c.status],
                )}
              >
                {c.status === 'DRAFT' ? 'Draft' : c.status === 'SENDING' ? `Sending ${c.sent_count}/${c.recipient_count}` : `Sent to ${c.recipient_count}`}
              </span>
              <span className="hidden shrink-0 font-mono text-[11px] text-muted-foreground sm:inline">
                {c.status === 'SENT' && c.sent_at ? `sent ${timeAgo(c.sent_at)}` : `updated ${timeAgo(c.updated_at)}`}
              </span>
              {c.status !== 'SENDING' && (
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    setPendingDelete(c.id)
                  }}
                  title="Delete campaign"
                  className="shrink-0 rounded-full border border-border p-2 text-txt2 transition-colors hover:border-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </Link>
          ))}
        </div>
      )}

      {pendingDelete && (
        <ConfirmModal
          title="Delete campaign?"
          message="This draft (or sent record) will be permanently deleted."
          confirmLabel="Delete"
          destructive
          pending={deleteCampaign.isPending}
          onConfirm={() => deleteCampaign.mutate(pendingDelete, { onSuccess: () => setPendingDelete(null) })}
          onClose={() => setPendingDelete(null)}
        />
      )}
    </>
  )
}
