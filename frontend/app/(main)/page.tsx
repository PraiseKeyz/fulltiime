import { HeroSection } from '@/components/home/hero-section'
import { ScoresStrip } from '@/components/home/scores-strip'
import { BreakingNews } from '@/components/home/breaking-news'
import { FeaturedAnalysis } from '@/components/home/featured-analysis'
import { CompetitionsSection } from '@/components/home/competitions-section'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ScoresStrip />
      <BreakingNews />
      <FeaturedAnalysis />
      <CompetitionsSection />
    </>
  )
}
