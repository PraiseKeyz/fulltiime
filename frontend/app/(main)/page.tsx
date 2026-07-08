import { NewsSection } from '@/components/home/news-section'
import { AdSlot } from '@/components/ads/ad-slot'

export default function HomePage() {
  return (
    <>
      <div className="mx-auto max-w-[var(--content-max)] px-4 lg:px-6 pt-2 pb-4">
        <AdSlot zone="home-top" />
      </div>
      <NewsSection />
    </>
  )
}
