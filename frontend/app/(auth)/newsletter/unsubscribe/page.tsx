'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { AuthShell } from '../../_components/auth-shell'
import { useUnsubscribeNewsletter } from '@/lib/api/hooks/newsletter.hooks'

function UnsubscribeInner() {
  const token = useSearchParams().get('token') ?? ''
  const { mutate: unsubscribe } = useUnsubscribeNewsletter()
  const [status, setStatus] = useState<'working' | 'success' | 'error'>(token ? 'working' : 'error')
  const [message, setMessage] = useState('')
  const ran = useRef(false)

  useEffect(() => {
    if (!token || ran.current) return
    ran.current = true
    unsubscribe(token, {
      onSuccess: (res) => {
        setStatus('success')
        setMessage(res.message)
      },
      onError: (err) => {
        setStatus('error')
        setMessage(err instanceof Error ? err.message : 'This link is invalid.')
      },
    })
  }, [token, unsubscribe])

  if (status === 'working') {
    return (
      <AuthShell title="One moment…">
        <div className="flex flex-col items-center text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </AuthShell>
    )
  }

  if (status === 'success') {
    return (
      <AuthShell title="You're unsubscribed">
        <div className="flex flex-col items-center text-center">
          <CheckCircle2 className="h-12 w-12 text-primary" />
          <p className="mt-4 text-[14px] text-muted-foreground">{message}</p>
          <Link href="/" className="mt-6 text-[13px] font-bold text-primary hover:underline">
            Back to Fulltiime
          </Link>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Something went wrong">
      <div className="flex flex-col items-center text-center">
        <XCircle className="h-12 w-12 text-destructive" />
        <p className="mt-4 text-[14px] text-muted-foreground">{message}</p>
        <Link href="/" className="mt-6 text-[13px] font-bold text-primary hover:underline">
          Back to Fulltiime
        </Link>
      </div>
    </AuthShell>
  )
}

export default function NewsletterUnsubscribePage() {
  return (
    <Suspense fallback={null}>
      <UnsubscribeInner />
    </Suspense>
  )
}
