import { HeroSection } from '@/components/home/hero-section'
import { ScoresStrip } from '@/components/home/scores-strip'
import { BreakingNews } from '@/components/home/breaking-news'
import { FeaturedAnalysis } from '@/components/home/featured-analysis'
import { CompetitionsSection } from '@/components/home/competitions-section'
import { Zap } from 'lucide-react'

// Set to false when the site is ready to launch
const COMING_SOON = true

export default function HomePage() {
  if (COMING_SOON) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary mb-8">
          <Zap className="h-8 w-8 fill-black text-black" />
        </div>
        <h1 className="text-6xl sm:text-8xl font-black tracking-tight text-foreground leading-none">
          Coming Soon
        </h1>
        <p className="mt-5 text-lg sm:text-xl text-muted-foreground font-medium">
          with a fulltiime football experience
        </p>
      </div>
    )
  }

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
