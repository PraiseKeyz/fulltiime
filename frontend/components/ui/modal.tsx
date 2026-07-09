'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

function Modal({
  title,
  children,
  onClose,
}: {
  title: string
  children: React.ReactNode
  onClose: () => void
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  if (!mounted) return null

  return createPortal(
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="w-full max-w-[420px] animate-fade-up rounded-xl border border-border bg-background-secondary p-6 shadow-2xl [animation-duration:200ms]">
        <h3 className="m-0 mb-2 text-[19px]">{title}</h3>
        {children}
      </div>
    </div>,
    document.body,
  )
}

/** Confirm dialog — replaces window.confirm. */
export function ConfirmModal({
  title,
  message,
  confirmLabel = 'Confirm',
  destructive = false,
  pending = false,
  onConfirm,
  onClose,
}: {
  title: string
  message: string
  confirmLabel?: string
  destructive?: boolean
  pending?: boolean
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <Modal title={title} onClose={onClose}>
      <p className="m-0 mb-5 text-[14px] leading-relaxed text-txt2">{message}</p>
      <div className="flex justify-end gap-2.5">
        <Button variant="outline" className="rounded-full" onClick={onClose} disabled={pending}>
          Cancel
        </Button>
        <Button
          variant={destructive ? 'destructive' : 'primary'}
          className="rounded-full"
          onClick={onConfirm}
          disabled={pending}
        >
          {pending ? 'Working…' : confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}

/** Prompt dialog with a textarea — replaces window.prompt. */
export function PromptModal({
  title,
  message,
  placeholder,
  submitLabel = 'Submit',
  minLength = 5,
  pending = false,
  onSubmit,
  onClose,
}: {
  title: string
  message?: string
  placeholder?: string
  submitLabel?: string
  minLength?: number
  pending?: boolean
  onSubmit: (value: string) => void
  onClose: () => void
}) {
  const [value, setValue] = useState('')
  const [touched, setTouched] = useState(false)
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => ref.current?.focus(), [])

  const tooShort = value.trim().length < minLength

  return (
    <Modal title={title} onClose={onClose}>
      {message && <p className="m-0 mb-3 text-[14px] leading-relaxed text-txt2">{message}</p>}
      <textarea
        ref={ref}
        rows={4}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => setTouched(true)}
        placeholder={placeholder}
        className={cn(
          'mb-1.5 w-full resize-none rounded-lg border border-border bg-background px-3.5 py-2.75 text-[14px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary',
          touched && tooShort && 'border-destructive',
        )}
      />
      {touched && tooShort && (
        <p className="m-0 mb-2 text-[12px] text-destructive">
          At least {minLength} characters, please.
        </p>
      )}
      <div className="mt-3 flex justify-end gap-2.5">
        <Button variant="outline" className="rounded-full" onClick={onClose} disabled={pending}>
          Cancel
        </Button>
        <Button
          variant="primary"
          className="rounded-full"
          onClick={() => (tooShort ? setTouched(true) : onSubmit(value.trim()))}
          disabled={pending}
        >
          {pending ? 'Working…' : submitLabel}
        </Button>
      </div>
    </Modal>
  )
}
