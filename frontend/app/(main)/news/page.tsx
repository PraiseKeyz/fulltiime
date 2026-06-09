'use client'

import { NewsTab } from './_components/news-tab'

export default function NewsPage() {
  return (
    <>
      <div className="bg-card border-b border-border">
        <div className="mx-auto max-w-[1400px] px-4 lg:px-6 py-6">
          <h1 className="text-3xl font-semibold">News</h1>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 lg:px-6 py-6">
        <NewsTab />
      </div>
    </>
  )
}
