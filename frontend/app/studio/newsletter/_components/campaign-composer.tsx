'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Send, FlaskConical } from 'lucide-react'
import type { Campaign } from '@/lib/api/domain'
import {
  useCreateCampaign,
  useUpdateCampaign,
  useSendCampaign,
  useSendTestCampaign,
} from '@/lib/api/hooks/newsletter-admin.hooks'
import { Button } from '@/components/ui/button'
import { ConfirmModal } from '@/components/ui/modal'
import { RichEditor } from '@/app/studio/_components/rich-editor'

const inputCls =
  'w-full rounded-lg border border-border bg-background-secondary px-3.5 py-2.75 text-[14px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary'

export function CampaignComposer({ campaign }: { campaign?: Campaign }) {
  const router = useRouter()
  const [subject, setSubject] = useState(campaign?.subject ?? '')
  const [content, setContent] = useState(campaign?.content ?? '')
  const [confirmingSend, setConfirmingSend] = useState(false)

  const create = useCreateCampaign()
  const update = useUpdateCampaign()
  const sendTest = useSendTestCampaign()
  const send = useSendCampaign()

  const locked = campaign && campaign.status !== 'DRAFT'
  const busy = create.isPending || update.isPending || sendTest.isPending || send.isPending

  const save = async (): Promise<Campaign | null> => {
    if (!subject.trim() || content.replace(/<[^>]+>/g, '').trim().length < 10) {
      toast.error('Add a subject and at least a couple of sentences before saving.')
      return null
    }
    if (campaign) {
      return (await update.mutateAsync({ id: campaign.id, subject, content })) as Campaign
    }
    const created = (await create.mutateAsync({ subject, content })) as Campaign
    router.replace(`/studio/newsletter/campaigns/${created.id}`)
    return created
  }

  const onSendTest = async () => {
    const saved = await save()
    if (!saved) return
    const res = (await sendTest.mutateAsync(saved.id)) as { message: string }
    toast.success(res.message)
  }

  const onSend = async () => {
    if (!campaign) return
    setConfirmingSend(false)
    await send.mutateAsync(campaign.id)
    router.push(`/studio/newsletter/campaigns/${campaign.id}`)
  }

  return (
    <div className="mx-auto max-w-[760px]">
      <div className="mb-6 flex items-center gap-3">
        <h1 className="m-0 text-[clamp(24px,3.5vw,32px)] uppercase leading-none">
          {campaign ? 'Edit campaign' : 'New campaign'}
        </h1>
        {campaign?.status === 'SENDING' && (
          <span className="rounded-full border border-gold/60 px-2.5 py-1 font-mono text-[10px] font-bold tracking-[0.08em] text-gold uppercase">
            Sending {campaign.sent_count}/{campaign.recipient_count}
          </span>
        )}
        {campaign?.status === 'SENT' && (
          <span className="rounded-full border border-primary/60 px-2.5 py-1 font-mono text-[10px] font-bold tracking-[0.08em] text-primary uppercase">
            Sent to {campaign.recipient_count}
          </span>
        )}
      </div>

      {campaign?.status === 'SENDING' && (
        <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all"
            style={{
              width: `${campaign.recipient_count ? Math.round((campaign.sent_count / campaign.recipient_count) * 100) : 0}%`,
            }}
          />
        </div>
      )}

      {locked && (
        <div className="mb-6 rounded-lg border border-border bg-background-secondary px-4 py-3 font-mono text-[12px] text-muted-foreground">
          This campaign has {campaign.status === 'SENDING' ? 'started sending' : 'already been sent'} — content is locked.
        </div>
      )}

      <fieldset disabled={!!locked || busy} className="flex flex-col gap-5">
        <label className="block">
          <span className="mb-1.5 block font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
            Subject
          </span>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="This week in football…"
            className={inputCls}
          />
        </label>

        <div>
          <span className="mb-1.5 block font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
            Body
          </span>
          {locked ? (
            <div
              className="article-prose border border-border bg-background-secondary p-5"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <RichEditor value={content} onChange={setContent} placeholder="Write the newsletter…" />
          )}
        </div>
      </fieldset>

      <div className="mt-7 flex flex-wrap items-center gap-2.5 border-t border-border pt-5">
        {!locked && (
          <Button variant="primary" className="rounded-full px-5.5" onClick={() => save()} disabled={busy}>
            {campaign ? 'Save' : 'Create draft'}
          </Button>
        )}

        {(!campaign || campaign.status === 'DRAFT') && (
          <Button
            variant="outline"
            className="rounded-full px-5.5 text-txt2 hover:border-primary hover:text-primary"
            onClick={onSendTest}
            disabled={busy}
          >
            <FlaskConical className="h-3.5 w-3.5" />
            {sendTest.isPending ? 'Sending test…' : 'Send test to myself'}
          </Button>
        )}

        {campaign?.status === 'DRAFT' && (
          <Button
            variant="outline"
            className="rounded-full border-primary px-5.5 text-primary hover:text-primary"
            onClick={() => setConfirmingSend(true)}
            disabled={busy}
          >
            <Send className="h-3.5 w-3.5" />
            Send to subscribers
          </Button>
        )}
      </div>

      {confirmingSend && campaign && (
        <ConfirmModal
          title="Send this campaign?"
          message="This goes out to every confirmed subscriber, right now. It can't be undone or recalled once it starts sending."
          confirmLabel="Send now"
          destructive
          pending={send.isPending}
          onConfirm={onSend}
          onClose={() => setConfirmingSend(false)}
        />
      )}
    </div>
  )
}
