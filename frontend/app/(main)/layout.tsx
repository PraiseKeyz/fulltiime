import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { VerifyEmailBanner } from '@/components/layout/verify-email-banner'
import { ImmersiveProvider } from '@/providers/immersive-provider'
import { ImmersiveShell } from '@/components/layout/immersive-shell'
import { AdsProvider } from '@/components/ads/ads-provider'
import { SideRails } from '@/components/ads/side-rails'

export default function MainLayout({ children }: { children: React.ReactNode }) {

  return (
    <ImmersiveProvider>
      <AdsProvider>
        <ImmersiveShell>
          <VerifyEmailBanner />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ImmersiveShell>
        <SideRails />
      </AdsProvider>
    </ImmersiveProvider>
  )
}
