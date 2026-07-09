'use client'

import { useRef, useState } from 'react'
import { Upload, Copy, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useMediaList, useUploadMedia } from '@/lib/api/hooks/studio.hooks'
import { Button } from '@/components/ui/button'

function prettyBytes(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function MediaPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useMediaList(page)
  const upload = useUploadMedia()
  const fileRef = useRef<HTMLInputElement>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const media = data?.media ?? []
  const totalPages = data?.pages ?? 1

  const copyUrl = async (url: string, id: string) => {
    await navigator.clipboard.writeText(url)
    setCopied(id)
    toast.success('URL copied')
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="mb-1.5 block font-mono text-[11px] tracking-[0.14em] text-primary">
            ◎ STUDIO
          </span>
          <h1 className="m-0 text-[clamp(26px,4vw,38px)] uppercase leading-none">Media</h1>
        </div>
        <Button
          variant="primary"
          className="rounded-full px-5 disabled:opacity-40"
          onClick={() => fileRef.current?.click()}
          disabled={upload.isPending}
        >
          {upload.isPending ? <Loader2 className="animate-spin" /> : <Upload />}
          {upload.isPending ? 'Uploading…' : 'Upload image'}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) upload.mutate(f)
            e.target.value = ''
          }}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse border border-border bg-muted" />
          ))}
        </div>
      ) : media.length === 0 ? (
        <div className="border border-dashed border-border py-20 text-center font-mono text-[13px] text-muted-foreground">
          No uploads yet. Covers and inline photos will live here.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {media.map((m) => (
            <button
              key={m.id}
              onClick={() => copyUrl(m.url, m.id)}
              title="Click to copy URL"
              className="group relative aspect-square overflow-hidden border border-border bg-background-secondary transition-colors hover:border-primary"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.url} alt="" className="h-full w-full object-cover" loading="lazy" />
              <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/70 px-2.5 py-1.5 font-mono text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                {prettyBytes(m.bytes)}
                {copied === m.id ? (
                  <Check className="h-3 w-3 text-[#C9FF3B]" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </span>
            </button>
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
    </>
  )
}
