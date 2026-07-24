'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useCampaign } from '@/lib/api/hooks/newsletter-admin.hooks'
import { CampaignComposer } from '../../_components/campaign-composer'

export default function EditCampaignPage() {
  const { id } = useParams<{ id: string }>()
  const { data: campaign, isLoading, isError } = useCampaign(id, { poll: true })

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[760px]">
        <div className="mb-6 h-8 w-56 animate-pulse bg-muted" />
        <div className="flex flex-col gap-5">
          <div className="h-12 animate-pulse border border-border bg-muted" />
          <div className="h-[320px] animate-pulse border border-border bg-muted" />
        </div>
      </div>
    )
  }

  if (isError || !campaign) {
    return (
      <div className="py-20 text-center">
        <p className="font-mono text-[13px] text-muted-foreground">Campaign not found.</p>
        <Link
          href="/studio/newsletter/campaigns"
          className="mt-2 inline-block text-[13px] font-bold text-primary hover:underline"
        >
          Back to campaigns
        </Link>
      </div>
    )
  }

  return <CampaignComposer key={campaign.id} campaign={campaign} />
}
