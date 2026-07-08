'use client'

import { Suspense } from 'react'
import { NewsTab } from './_components/news-tab'

export default function NewsPage() {
  return (
    <div data-bp className="mx-auto max-w-[var(--content-max)] px-4.5 pb-17.5 sm:px-10">
      <Suspense fallback={null}>
        <NewsTab />
      </Suspense>
    </div>
  )
}
