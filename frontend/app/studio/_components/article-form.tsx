'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Trash2, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/providers/auth-provider'
import { roleAtLeast } from '@/lib/roles'
import { SECTION_META, ALL_SECTIONS } from '@/lib/sections'
import type { Article, Section } from '@/lib/api/domain'
import {
  useCreateArticle,
  useUpdateArticle,
  useDeleteArticle,
  useSubmitArticle,
  usePublishArticle,
  useRejectArticle,
  useUnpublishArticle,
  useFeatureArticle,
  useUploadMedia,
  type ArticleInput,
} from '@/lib/api/hooks/studio.hooks'
import { StatusChip } from './status-chip'
import { RichEditor } from './rich-editor'

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block font-mono text-[10px] text-muted-foreground">{hint}</span>}
    </label>
  )
}

const inputCls =
  'w-full rounded-lg border border-border bg-background-secondary px-3.5 py-2.75 text-[14px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary'

export function ArticleForm({ article }: { article?: Article }) {
  const router = useRouter()
  const { user } = useAuth()
  const isEditor = roleAtLeast(user?.role, 'EDITOR')

  const [form, setForm] = useState<ArticleInput>({
    title: article?.title ?? '',
    content: article?.content ?? '',
    section: article?.section ?? 'NEWS',
    excerpt: article?.excerpt ?? '',
    cover_url: article?.cover_url ?? '',
    kicker: article?.kicker ?? '',
    move: article?.move ?? '',
    crest: article?.crest ?? '',
    formation: article?.formation ?? '',
    video_url: article?.video_url ?? '',
    duration: article?.duration ?? '',
    tags: article?.tags ?? [],
  })

  const set = <K extends keyof ArticleInput>(key: K, value: ArticleInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const create = useCreateArticle()
  const update = useUpdateArticle()
  const remove = useDeleteArticle()
  const submit = useSubmitArticle()
  const publish = usePublishArticle()
  const reject = useRejectArticle()
  const unpublish = useUnpublishArticle()
  const feature = useFeatureArticle()
  const upload = useUploadMedia()
  const fileRef = useRef<HTMLInputElement>(null)

  const busy =
    create.isPending || update.isPending || remove.isPending || submit.isPending ||
    publish.isPending || reject.isPending || unpublish.isPending || upload.isPending

  const cleanPayload = (): ArticleInput => ({
    ...form,
    excerpt: form.excerpt || undefined,
    cover_url: form.cover_url || undefined,
    kicker: form.kicker || undefined,
    move: form.move || undefined,
    crest: form.crest || undefined,
    formation: form.formation || undefined,
    video_url: form.video_url || undefined,
    duration: form.duration || undefined,
    tags: form.tags?.length ? form.tags : undefined,
  })

  const save = async (): Promise<Article | null> => {
    if (!form.title.trim() || form.content.replace(/<[^>]+>/g, '').trim().length < 50) {
      window.alert('A title and at least a paragraph of content are required.')
      return null
    }
    if (article) {
      return (await update.mutateAsync({ id: article.id, ...cleanPayload() })) as Article
    }
    const created = (await create.mutateAsync(cleanPayload())) as Article
    router.replace(`/studio/articles/${created.id}`)
    return created
  }

  const saveThen = async (action: (id: string) => Promise<unknown>) => {
    const saved = await save()
    if (saved) await action(saved.id)
  }

  const onReject = async () => {
    if (!article) return
    const note = window.prompt('Feedback for the writer (required):')
    if (!note || note.trim().length < 5) return
    await reject.mutateAsync({ id: article.id, note: note.trim() })
  }

  const onDelete = async () => {
    if (!article) return
    if (!window.confirm(`Delete "${article.title}"? This cannot be undone.`)) return
    await remove.mutateAsync(article.id)
    router.replace('/studio/articles')
  }

  const onUpload = async (file: File | undefined) => {
    if (!file) return
    const media = (await upload.mutateAsync(file)) as { url: string }
    set('cover_url', media.url)
  }

  const status = article?.status
  // Writers can only edit drafts — mirror the backend rule in the UI.
  const locked = !isEditor && !!article && status !== 'DRAFT'

  return (
    <div className="mx-auto max-w-[860px]">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="m-0 text-[clamp(24px,3.5vw,32px)] uppercase leading-none">
            {article ? 'Edit article' : 'New article'}
          </h1>
          {status && <StatusChip status={status} />}
          {article?.is_featured && <Star className="h-4 w-4 fill-primary text-primary" />}
        </div>
        {article?.status === 'PUBLISHED' && (
          <a
            href={`/news/${article.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[12px] text-primary hover:underline"
          >
            view live ↗
          </a>
        )}
      </div>

      {/* Review feedback */}
      {article?.review_note && status === 'DRAFT' && (
        <div className="mb-6 rounded-lg border border-gold/50 bg-gold/8 px-4 py-3">
          <div className="mb-1 font-mono text-[10px] font-bold tracking-[0.12em] text-gold uppercase">
            Editor feedback
          </div>
          <p className="m-0 text-[14px] leading-relaxed text-foreground">{article.review_note}</p>
        </div>
      )}

      {locked && (
        <div className="mb-6 rounded-lg border border-border bg-background-secondary px-4 py-3 font-mono text-[12px] text-muted-foreground">
          This article is {status === 'IN_REVIEW' ? 'awaiting review' : 'live'} — editing is locked.
          Ask an editor for changes.
        </div>
      )}

      <fieldset disabled={locked || busy} className="flex flex-col gap-5">
        <Field label="Headline">
          <input
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="The Tournament That Refused To Behave"
            className={cn(inputCls, 'font-heading text-[22px] leading-tight')}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Section">
            <select
              value={form.section}
              onChange={(e) => set('section', e.target.value as Section)}
              className={inputCls}
            >
              {ALL_SECTIONS.map((s) => (
                <option key={s} value={s}>
                  {SECTION_META[s].title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Kicker" hint="Mono label above the headline, e.g. THE BIG READ · WORLD CUP 2026">
            <input
              value={form.kicker ?? ''}
              onChange={(e) => set('kicker', e.target.value)}
              placeholder="MATCHDAY"
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="Standfirst" hint="One-sentence sub shown under the headline and on cards">
          <textarea
            value={form.excerpt ?? ''}
            onChange={(e) => set('excerpt', e.target.value)}
            rows={2}
            maxLength={300}
            placeholder="Three host nations, one chaotic group stage, and a sport quietly rewriting its own rules."
            className={cn(inputCls, 'resize-none')}
          />
        </Field>

        {/* Cover */}
        <Field label="Cover image">
          <div className="flex gap-2">
            <input
              value={form.cover_url ?? ''}
              onChange={(e) => set('cover_url', e.target.value)}
              placeholder="https://… or upload →"
              className={inputCls}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex shrink-0 items-center gap-2 rounded-lg border border-border px-4 text-[13px] font-bold text-txt2 transition-colors hover:border-primary hover:text-primary"
            >
              <Upload className="h-4 w-4" />
              {upload.isPending ? 'Uploading…' : 'Upload'}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              className="hidden"
              onChange={(e) => onUpload(e.target.files?.[0])}
            />
          </div>
          {form.cover_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.cover_url} alt="Cover preview" className="mt-2.5 max-h-[220px] border border-border object-cover" />
          )}
        </Field>

        {/* Section-specific extras */}
        {form.section === 'TRANSFERS' && (
          <div className="grid gap-5 sm:grid-cols-[1fr_140px]">
            <Field label="Transfer move" hint="e.g. Viktoria SC → Northgate Utd">
              <input value={form.move ?? ''} onChange={(e) => set('move', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Crest initials" hint="e.g. NU">
              <input value={form.crest ?? ''} onChange={(e) => set('crest', e.target.value)} maxLength={4} className={inputCls} />
            </Field>
          </div>
        )}
        {form.section === 'TACTICS' && (
          <Field label="Formation" hint="Shown on the pitch graphic, e.g. 4-3-3">
            <input value={form.formation ?? ''} onChange={(e) => set('formation', e.target.value)} className={cn(inputCls, 'max-w-[200px]')} />
          </Field>
        )}
        {form.section === 'TV' && (
          <div className="grid gap-5 sm:grid-cols-[1fr_140px]">
            <Field label="Video URL">
              <input value={form.video_url ?? ''} onChange={(e) => set('video_url', e.target.value)} placeholder="https://youtube.com/…" className={inputCls} />
            </Field>
            <Field label="Duration" hint="e.g. 8:42">
              <input value={form.duration ?? ''} onChange={(e) => set('duration', e.target.value)} className={inputCls} />
            </Field>
          </div>
        )}

        <Field label="Body">
          <RichEditor value={form.content} onChange={(html) => set('content', html)} />
        </Field>

        <Field label="Tags" hint="Comma-separated">
          <input
            value={(form.tags ?? []).join(', ')}
            onChange={(e) =>
              set(
                'tags',
                e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
              )
            }
            placeholder="world cup, tactics"
            className={inputCls}
          />
        </Field>
      </fieldset>

      {/* Actions */}
      <div className="mt-7 flex flex-wrap items-center gap-2.5 border-t border-border pt-5">
        {!locked && (
          <button
            onClick={() => save()}
            disabled={busy}
            className="rounded-full bg-primary px-5.5 py-2.75 text-[13px] font-bold text-primary-foreground disabled:opacity-50"
          >
            {article ? 'Save' : 'Create draft'}
          </button>
        )}

        {(!article || status === 'DRAFT') && !isEditor && (
          <button
            onClick={() => saveThen((id) => submit.mutateAsync(id))}
            disabled={busy}
            className="rounded-full border border-primary px-5.5 py-2.75 text-[13px] font-bold text-primary disabled:opacity-50"
          >
            Submit for review
          </button>
        )}

        {isEditor && status !== 'PUBLISHED' && (
          <button
            onClick={() => saveThen((id) => publish.mutateAsync(id))}
            disabled={busy}
            className="rounded-full border border-primary px-5.5 py-2.75 text-[13px] font-bold text-primary disabled:opacity-50"
          >
            {article ? 'Publish' : 'Publish now'}
          </button>
        )}

        {isEditor && status === 'IN_REVIEW' && (
          <button
            onClick={onReject}
            disabled={busy}
            className="rounded-full border border-gold px-5.5 py-2.75 text-[13px] font-bold text-gold disabled:opacity-50"
          >
            Send back
          </button>
        )}

        {isEditor && status === 'PUBLISHED' && (
          <>
            {!article?.is_featured && (
              <button
                onClick={() => article && feature.mutateAsync(article.id)}
                disabled={busy}
                className="flex items-center gap-1.5 rounded-full border border-border px-5.5 py-2.75 text-[13px] font-bold text-txt2 hover:border-primary hover:text-primary disabled:opacity-50"
              >
                <Star className="h-3.5 w-3.5" />
                Feature
              </button>
            )}
            <button
              onClick={() => article && unpublish.mutateAsync(article.id)}
              disabled={busy}
              className="rounded-full border border-gold px-5.5 py-2.75 text-[13px] font-bold text-gold disabled:opacity-50"
            >
              Unpublish
            </button>
          </>
        )}

        {article && (isEditor || status === 'DRAFT') && (
          <button
            onClick={onDelete}
            disabled={busy}
            className="ml-auto flex items-center gap-1.5 rounded-full border border-border px-4.5 py-2.75 text-[13px] font-bold text-destructive/80 hover:border-destructive hover:text-destructive disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        )}
      </div>
    </div>
  )
}
