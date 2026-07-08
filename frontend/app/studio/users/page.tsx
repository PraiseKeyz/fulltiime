'use client'

import { useState } from 'react'
import { UserPlus, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useAuth } from '@/providers/auth-provider'
import { timeAgo } from '@/lib/editorial'
import type { Role, StudioUser } from '@/lib/api/domain'
import {
  useCreateStaff,
  useStudioUsers,
  useUpdateUserRole,
  type CreateStaffResult,
} from '@/lib/api/hooks/studio.hooks'

const ROLES: Role[] = ['USER', 'WRITER', 'EDITOR', 'ADMIN']

const inviteInputCls =
  'w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-[13px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary'

function InvitePanel({ onClose }: { onClose: () => void }) {
  const create = useCreateStaff()
  const [form, setForm] = useState({ email: '', username: '', full_name: '', role: 'WRITER' as 'WRITER' | 'EDITOR' })
  const [created, setCreated] = useState<CreateStaffResult | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = (await create.mutateAsync({
      email: form.email.trim(),
      username: form.username.trim(),
      full_name: form.full_name.trim() || undefined,
      role: form.role,
    })) as CreateStaffResult
    setCreated(result)
  }

  if (created) {
    return (
      <div className="mb-6 border border-primary/50 bg-primary/5 px-5 py-4.5">
        <div className="mb-2 font-mono text-[10px] font-bold tracking-[0.12em] text-primary uppercase">
          Account created
        </div>
        <p className="m-0 mb-3 text-[14px] text-foreground">
          <strong>{created.user.username}</strong> ({created.user.email}) is now a{' '}
          {created.user.role.toLowerCase()}.
        </p>
        {created.temp_password && (
          <div className="mb-3">
            <div className="mb-1.5 font-mono text-[11px] text-muted-foreground">
              Temporary password — copy it now, it won&apos;t be shown again:
            </div>
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(created.temp_password!)
                toast.success('Password copied')
              }}
              className="flex items-center gap-2 rounded-lg border border-border bg-background px-3.5 py-2.5 font-mono text-[14px] font-bold text-primary hover:border-primary"
            >
              {created.temp_password}
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        <button onClick={onClose} className="rounded-full border border-border px-4 py-2 text-[12px] font-bold text-txt2 hover:border-primary hover:text-primary">
          Done
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="mb-6 border border-border bg-background-secondary px-5 py-4.5">
      <div className="mb-3.5 font-mono text-[10px] font-bold tracking-[0.12em] text-primary uppercase">
        New staff account
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          placeholder="writer@fulltiime.com"
          className={inviteInputCls}
        />
        <input
          required
          minLength={3}
          maxLength={20}
          pattern="[a-zA-Z0-9_]+"
          title="Letters, numbers and underscores only"
          value={form.username}
          onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
          placeholder="username"
          className={inviteInputCls}
        />
        <input
          value={form.full_name}
          onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
          placeholder="Full name (optional)"
          className={inviteInputCls}
        />
        <div className="flex gap-2">
          {(['WRITER', 'EDITOR'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setForm((f) => ({ ...f, role: r }))}
              className={cn(
                'flex-1 rounded-lg border px-3 py-2.5 font-mono text-[12px] font-bold transition-colors',
                form.role === r
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-txt2 hover:border-primary hover:text-primary',
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 flex gap-2.5">
        <button
          type="submit"
          disabled={create.isPending}
          className="rounded-full bg-primary px-5 py-2.5 text-[13px] font-bold text-primary-foreground disabled:opacity-50"
        >
          {create.isPending ? 'Creating…' : 'Create account'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-border px-5 py-2.5 text-[13px] font-bold text-txt2 hover:border-primary hover:text-primary"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

function UserRow({ user, isSelf }: { user: StudioUser; isSelf: boolean }) {
  const updateRole = useUpdateUserRole()

  return (
    <div className="flex flex-wrap items-center gap-4 border border-border bg-background-secondary px-4 py-3.5">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border font-mono text-[13px] font-bold text-primary"
          style={{ background: 'var(--muted)' }}
        >
          {(user.full_name ?? user.username).charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="truncate text-[14px] font-bold text-head">
            {user.full_name ?? user.username}
            {isSelf && <span className="ml-2 font-mono text-[10px] text-primary">you</span>}
          </div>
          <div className="truncate font-mono text-[11px] text-muted-foreground">{user.email}</div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <span className="hidden font-mono text-[11px] text-muted-foreground sm:inline">
          {user._count.articles} article{user._count.articles === 1 ? '' : 's'} · joined{' '}
          {timeAgo(user.created_at)}
        </span>
        <select
          value={user.role}
          disabled={isSelf || updateRole.isPending}
          onChange={(e) => updateRole.mutate({ id: user.id, role: e.target.value as Role })}
          className="rounded-full border border-border bg-background px-3.5 py-2 font-mono text-[12px] font-bold text-primary outline-none focus:border-primary disabled:opacity-50"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default function UsersPage() {
  const { user: me } = useAuth()
  const [page, setPage] = useState(1)
  const [inviting, setInviting] = useState(false)
  const { data, isLoading } = useStudioUsers(page)

  const users = data?.users ?? []
  const totalPages = data?.pages ?? 1

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="mb-1.5 block font-mono text-[11px] tracking-[0.14em] text-primary">
            ◎ STUDIO
          </span>
          <h1 className="m-0 text-[clamp(26px,4vw,38px)] uppercase leading-none">Writers</h1>
          <p className="mt-2 font-mono text-[12px] text-muted-foreground">
            USER &lt; WRITER &lt; EDITOR &lt; ADMIN — higher roles inherit everything below
          </p>
        </div>
        {!inviting && (
          <button
            onClick={() => setInviting(true)}
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.75 text-[13px] font-bold text-primary-foreground"
          >
            <UserPlus className="h-4 w-4" />
            Add staff
          </button>
        )}
      </div>

      {inviting && <InvitePanel onClose={() => setInviting(false)} />}

      {isLoading ? (
        <div className="flex flex-col gap-2.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-[66px] animate-pulse border border-border bg-muted" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {users.map((u) => (
            <UserRow key={u.id} user={u} isSelf={u.id === me?.id} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-6">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page <= 1}
            className="rounded-full border border-border px-4 py-2 text-[12px] font-bold text-txt2 hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-30"
          >
            ← Prev
          </button>
          <span className="font-mono text-[12px] text-muted-foreground">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages}
            className="rounded-full border border-border px-4 py-2 text-[12px] font-bold text-txt2 hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      )}
    </>
  )
}
