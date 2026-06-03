import { ScoresStrip } from '@/components/home/scores-strip'
import { HeroSection } from '@/components/home/hero-section'
import { WorldCupSpotlight } from '@/components/home/world-cup-spotlight'
import { StandingsSnapshot } from '@/components/home/standings-snapshot'
import { CompetitionsSection } from '@/components/home/competitions-section'

export default function HomePage() {
  return (
    <>
      <ScoresStrip />
      <HeroSection />
      <WorldCupSpotlight />
      <StandingsSnapshot />
      <CompetitionsSection />
    </>
  )
}
