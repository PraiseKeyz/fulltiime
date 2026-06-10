import { ScoresStrip } from '@/components/home/scores-strip'
import { HeroSection } from '@/components/home/hero-section'
import { WorldCupSpotlight } from '@/components/home/world-cup-spotlight'
import { NewsSection } from '@/components/home/news-section'

export default function HomePage() {
  return (
    <>
      <div className="pt-4">
        <ScoresStrip />
      </div>
      <HeroSection />
      <WorldCupSpotlight />
      <NewsSection />
    </>
  )
}
