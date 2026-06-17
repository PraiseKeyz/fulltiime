'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { LogOut, User as UserIcon } from 'lucide-react'
import { useAuth } from '@/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

function UserMenuInner() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const currentUrl   = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname

  if (isLoading) {
    return <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
  }

  if (!isAuthenticated || !user) {
    return (
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="h-auto rounded-none border-b border-foreground! px-0 py-1 text-[13px] hover:bg-transparent hover:text-primary hover:border-primary!"
      >
        <Link href={`/login?callbackUrl=${encodeURIComponent(currentUrl)}`}>Sign In</Link>
      </Button>
    )
  }

  const name = user.full_name ?? user.username

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Account menu"
          className="flex h-8 w-8 items-center justify-center rounded-full transition-opacity hover:opacity-80"
        >
          <Avatar className="h-8 w-8 border border-border">
            <AvatarImage src={user.avatar_url ?? undefined} alt={name} />
            <AvatarFallback>
              {user.full_name ? name.charAt(0).toUpperCase() : <UserIcon className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <p className="truncate text-[13px] font-bold text-foreground">{name}</p>
          <p className="truncate text-[12px] font-normal text-muted-foreground">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => logout()}
          className="text-destructive data-highlighted:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function UserMenu() {
  return (
    <Suspense fallback={<div className="h-8 w-8 rounded-full bg-muted animate-pulse" />}>
      <UserMenuInner />
    </Suspense>
  )
}
