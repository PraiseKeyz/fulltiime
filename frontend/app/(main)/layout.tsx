import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { VerifyEmailBanner } from '@/components/layout/verify-email-banner'

export default function MainLayout({ children }: { children: React.ReactNode }) {

  return (
    <div className="flex flex-col min-h-screen">
      <VerifyEmailBanner />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
