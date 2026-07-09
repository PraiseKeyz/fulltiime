'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Trash2, Star, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/providers/auth-provider'
import { roleAtLeast } from '@/lib/roles'
import { SECTION_META, ALL_SECTIONS } from '@/lib/sections'
import type { Article, Section } from '@/lib/api/domain'
import type { Media } from '@/lib/api/domain'
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
  useDeleteMedia,
  type ArticleInput,
} from '@/lib/api/hooks/studio.hooks'
import { Button } from '@/components/ui/button'
import { ConfirmModal, PromptModal } from '@/components/ui/modal'
import { StatusChip } from './status-chip'
import { RichEditor } from './rich-editor'

function Field({
  label,
  children,
  hint,
  error,
}: {
  label: string
  children: React.ReactNode
  hint?: string
  error?: string
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
        {label}
      </span>
      {children}
      {error ? (
        <span className="mt-1.5 block text-[12px] text-destructive">{error}</span>
      ) : (
        hint && <span className="mt-1 block font-mono text-[10px] text-muted-foreground">{hint}</span>
      )}
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
  })
  // Kept as raw text while typing (a controlled array round-trip would eat
  // the comma as you type it); parsed into tags on save.
  const [tagsText, setTagsText] = useState((article?.tags ?? []).join(', '))
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({})
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [confirmingCover, setConfirmingCover] = useState(false)
  const [removingCover, setRemovingCover] = useState(false)
  const [rejecting, setRejecting] = useState(false)

  const set = <K extends keyof ArticleInput>(key: K, value: ArticleInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    if (key === 'title' || key === 'content') {
      setErrors((e) => ({ ...e, [key]: undefined }))
    }
  }

  const create = useCreateArticle()
  const update = useUpdateArticle()
  const remove = useDeleteArticle()
  const submit = useSubmitArticle()
  const publish = usePublishArticle()
  const reject = useRejectArticle()
  const unpublish = useUnpublishArticle()
  const feature = useFeatureArticle()
  const upload = useUploadMedia()
  const deleteMedia = useDeleteMedia()
  const fileRef = useRef<HTMLInputElement>(null)
  // The Media record of a cover uploaded in this session — lets the ✕ button
  // remove the asset from Cloudinary too, not just clear the field.
  const [uploadedCover, setUploadedCover] = useState<Media | null>(null)

  const busy =
    create.isPending || update.isPending || remove.isPending || submit.isPending ||
    publish.isPending || reject.isPending || unpublish.isPending || upload.isPending

  const cleanPayload = (): ArticleInput => {
    const tags = tagsText.split(',').map((t) => t.trim()).filter(Boolean)
    return {
      ...form,
      excerpt: form.excerpt || undefined,
      cover_url: form.cover_url || undefined,
      kicker: form.kicker || undefined,
      move: form.move || undefined,
      crest: form.crest || undefined,
      formation: form.formation || undefined,
      video_url: form.video_url || undefined,
      duration: form.duration || undefined,
      tags: tags.length ? tags : undefined,
    }
  }

  const save = async (): Promise<Article | null> => {
    const nextErrors: typeof errors = {}
    if (!form.title.trim()) {
      nextErrors.title = 'A headline is required.'
    }
    if (form.content.replace(/<[^>]+>/g, '').trim().length < 50) {
      nextErrors.content = 'Write at least a short paragraph (50+ characters) before saving.'
    }
    if (nextErrors.title || nextErrors.content) {
      setErrors(nextErrors)
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

  const onReject = async (note: string) => {
    if (!article) return
    await reject.mutateAsync({ id: article.id, note })
    setRejecting(false)
  }

  const onDelete = async () => {
    if (!article) return
    await remove.mutateAsync(article.id)
    router.replace('/studio/articles')
  }

  const onUpload = async (file: File | undefined) => {
    if (!file) return
    const media = (await upload.mutateAsync(file)) as Media
    set('cover_url', media.url)
    setUploadedCover(media)
  }

  const onRemoveCover = async () => {
    setConfirmingCover(false)
    setRemovingCover(true)
    try {
      // Only purge from Cloudinary if this session uploaded it; a pasted URL
      // (or a cover saved earlier) just clears the field.
      if (uploadedCover) {
        await deleteMedia.mutateAsync(uploadedCover.id)
        setUploadedCover(null)
      }
      set('cover_url', '')
      if (fileRef.current) fileRef.current.value = ''
    } finally {
      setRemovingCover(false)
    }
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
        <Field label="Headline" error={errors.title}>
          <input
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="The Tournament That Refused To Behave"
            className={cn(
              inputCls,
              'font-heading text-[22px] leading-tight',
              errors.title && 'border-destructive',
            )}
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
            <Button
              type="button"
              variant="outline"
              onClick={() => fileRef.current?.click()}
              disabled={upload.isPending}
              className="h-auto shrink-0 self-stretch disabled:opacity-40"
            >
              {upload.isPending ? <Loader2 className="animate-spin" /> : <Upload />}
              {upload.isPending ? 'Uploading…' : 'Upload'}
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              className="hidden"
              onChange={(e) => onUpload(e.target.files?.[0])}
            />
          </div>
          {form.cover_url && (
            <div className="relative mt-2.5 w-fit">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.cover_url} alt="Cover preview" className="max-h-[220px] border border-border object-cover" />

              {removingCover ? (
                /* Red deleting state over the image */
                <div className="absolute inset-0 flex animate-pulse items-center justify-center gap-2 bg-destructive/70 backdrop-blur-[2px]">
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                  <span className="font-mono text-[12px] font-bold tracking-[0.08em] text-white uppercase">
                    Deleting…
                  </span>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setConfirmingCover(true)}
                  title="Remove cover"
                  className="absolute right-2 top-2 h-7 w-7 rounded-full bg-black/70 text-white hover:bg-destructive hover:text-white"
                >
                  <X />
                </Button>
              )}
            </div>
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

        <Field label="Body" error={errors.content}>
          <div className={cn(errors.content && '[&>div]:border-destructive')}>
            <RichEditor value={form.content} onChange={(html) => set('content', html)} />
          </div>
        </Field>

        <Field label="Tags" hint="Comma-separated">
          <input
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            placeholder="world cup, tactics"
            className={inputCls}
          />
        </Field>
      </fieldset>

      {/* Actions */}
      <div className="mt-7 flex flex-wrap items-center gap-2.5 border-t border-border pt-5">
        {!locked && (
          <Button variant="primary" className="rounded-full px-5.5" onClick={() => save()} disabled={busy}>
            {article ? 'Save' : 'Create draft'}
          </Button>
        )}

        {(!article || status === 'DRAFT') && !isEditor && (
          <Button
            variant="outline"
            className="rounded-full border-primary px-5.5 text-primary hover:text-primary"
            onClick={() => saveThen((id) => submit.mutateAsync(id))}
            disabled={busy}
          >
            Submit for review
          </Button>
        )}

        {isEditor && status !== 'PUBLISHED' && (
          <Button
            variant="outline"
            className="rounded-full border-primary px-5.5 text-primary hover:text-primary"
            onClick={() => saveThen((id) => publish.mutateAsync(id))}
            disabled={busy}
          >
            {article ? 'Publish' : 'Publish now'}
          </Button>
        )}

        {isEditor && status === 'IN_REVIEW' && (
          <Button
            variant="outline"
            className="rounded-full border-gold px-5.5 text-gold hover:text-gold"
            onClick={() => setRejecting(true)}
            disabled={busy}
          >
            Send back
          </Button>
        )}

        {isEditor && status === 'PUBLISHED' && (
          <>
            {!article?.is_featured && (
              <Button
                variant="outline"
                className="rounded-full px-5.5 text-txt2 hover:border-primary hover:text-primary"
                onClick={() => article && feature.mutateAsync(article.id)}
                disabled={busy}
              >
                <Star />
                Feature
              </Button>
            )}
            <Button
              variant="outline"
              className="rounded-full border-gold px-5.5 text-gold hover:text-gold"
              onClick={() => article && unpublish.mutateAsync(article.id)}
              disabled={busy}
            >
              Unpublish
            </Button>
          </>
        )}

        {article && (isEditor || status === 'DRAFT') && (
          <Button
            variant="outline"
            className="ml-auto rounded-full text-destructive/80 hover:border-destructive hover:text-destructive"
            onClick={() => setConfirmingDelete(true)}
            disabled={busy}
          >
            <Trash2 />
            Delete
          </Button>
        )}
      </div>

      {confirmingCover && (
        <ConfirmModal
          title="Remove cover image?"
          message={
            uploadedCover
              ? 'This upload will be permanently deleted from storage. You can upload a different image afterwards.'
              : 'The cover will be cleared from this article. The image itself is not deleted since it wasn’t uploaded here.'
          }
          confirmLabel="Remove"
          destructive
          onConfirm={onRemoveCover}
          onClose={() => setConfirmingCover(false)}
        />
      )}

      {confirmingDelete && article && (
        <ConfirmModal
          title="Delete article?"
          message={`“${article.title}” will be permanently deleted. This cannot be undone.`}
          confirmLabel="Delete"
          destructive
          pending={remove.isPending}
          onConfirm={onDelete}
          onClose={() => setConfirmingDelete(false)}
        />
      )}

      {rejecting && article && (
        <PromptModal
          title="Send back to writer"
          message={`Tell ${article.author.full_name ?? article.author.username} what needs work — they’ll see this note on their draft.`}
          placeholder="The intro buries the lede — open with the result…"
          submitLabel="Send back"
          pending={reject.isPending}
          onSubmit={onReject}
          onClose={() => setRejecting(false)}
        />
      )}
    </div>
  )
}
