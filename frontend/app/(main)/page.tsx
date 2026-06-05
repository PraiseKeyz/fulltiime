import { ScoresStrip } from '@/components/home/scores-strip'
import { HeroSection } from '@/components/home/hero-section'
import { WorldCupSpotlight } from '@/components/home/world-cup-spotlight'
import { NewsSection } from '@/components/home/news-section'

export default function HomePage() {
  return (
    <>
      <ScoresStrip />
      <HeroSection />
      <WorldCupSpotlight />
      <NewsSection />
    </>
  )
}
