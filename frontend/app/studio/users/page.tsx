'use client'

import { useEffect, useState } from 'react'
import { UserPlus, Copy, Search } from 'lucide-react'
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
import { Button } from '@/components/ui/button'

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
          {created.user.role.toLowerCase()}.{' '}
          {created.emailed
            ? 'An invite with their one-time password is on its way — they’ll be asked to set their own password on first login.'
            : 'The invite email could not be sent.'}
        </p>
        {!created.emailed && created.temp_password && (
          <div className="mb-3">
            <div className="mb-1.5 font-mono text-[11px] text-muted-foreground">
              Share this one-time password with them — it won&apos;t be shown again:
            </div>
            <Button
              variant="outline"
              className="bg-background font-mono text-[14px] text-primary hover:text-primary"
              onClick={async () => {
                await navigator.clipboard.writeText(created.temp_password!)
                toast.success('Password copied')
              }}
            >
              {created.temp_password}
              <Copy className="!size-3.5" />
            </Button>
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          className="rounded-full text-txt2 hover:border-primary hover:text-primary"
          onClick={onClose}
        >
          Done
        </Button>
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
            <Button
              key={r}
              type="button"
              variant={form.role === r ? 'primary' : 'outline'}
              onClick={() => setForm((f) => ({ ...f, role: r }))}
              className={cn(
                'flex-1 font-mono text-[12px]',
                form.role !== r && 'text-txt2 hover:border-primary hover:text-primary',
              )}
            >
              {r}
            </Button>
          ))}
        </div>
      </div>
      <div className="mt-4 flex gap-2.5">
        <Button type="submit" variant="primary" className="rounded-full px-5" disabled={create.isPending}>
          {create.isPending ? 'Creating…' : 'Create account'}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-full px-5 text-txt2 hover:border-primary hover:text-primary"
          onClick={onClose}
        >
          Cancel
        </Button>
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
        {isSelf ? (
          <span
            title="You can't change your own role — ask another admin"
            className="cursor-not-allowed rounded-full border border-border px-3.5 py-2 font-mono text-[12px] font-bold text-muted-foreground"
          >
            {user.role}
          </span>
        ) : (
          <select
            value={user.role}
            disabled={updateRole.isPending}
            onChange={(e) => updateRole.mutate({ id: user.id, role: e.target.value as Role })}
            className="cursor-pointer rounded-full border border-border bg-background px-3.5 py-2 font-mono text-[12px] font-bold text-primary outline-none focus:border-primary disabled:opacity-50"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  )
}

export default function UsersPage() {
  const { user: me } = useAuth()
  const [page, setPage] = useState(1)
  const [inviting, setInviting] = useState(false)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 350)
    return () => clearTimeout(t)
  }, [search])

  const { data, isLoading } = useStudioUsers(page, debouncedSearch)

  const users = data?.users ?? []
  const totalPages = data?.pages ?? 1

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="mb-1.5 block font-mono text-[11px] tracking-[0.14em] text-primary">
            ◎ STUDIO
          </span>
          <h1 className="m-0 text-[clamp(26px,4vw,38px)] uppercase leading-none">Users</h1>
          <p className="mt-2 font-mono text-[12px] text-muted-foreground">
            USER &lt; WRITER &lt; EDITOR &lt; ADMIN — higher roles inherit everything below
          </p>
        </div>
        {!inviting && (
          <Button variant="primary" className="rounded-full px-5" onClick={() => setInviting(true)}>
            <UserPlus />
            Add staff
          </Button>
        )}
      </div>

      {inviting && <InvitePanel onClose={() => setInviting(false)} />}

      <div className="relative mb-5 max-w-[340px]">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, username or email…"
          className="w-full rounded-full border border-border bg-background-secondary py-2.5 pl-10 pr-4 text-[13px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-[66px] animate-pulse border border-border bg-muted" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="border border-dashed border-border py-16 text-center font-mono text-[13px] text-muted-foreground">
          No users match “{debouncedSearch}”.
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
