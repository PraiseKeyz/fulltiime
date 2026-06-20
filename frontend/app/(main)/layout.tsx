import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { VerifyEmailBanner } from '@/components/layout/verify-email-banner'
import { ImmersiveProvider } from '@/providers/immersive-provider'
import { ImmersiveShell } from '@/components/layout/immersive-shell'

export default function MainLayout({ children }: { children: React.ReactNode }) {

  return (
    <ImmersiveProvider>
      <ImmersiveShell>
        <VerifyEmailBanner />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </ImmersiveShell>
    </ImmersiveProvider>
  )
}
