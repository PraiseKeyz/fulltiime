import { GoogleOAuthProviderWrapper } from '@/providers/google-oauth-provider'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <GoogleOAuthProviderWrapper>{children}</GoogleOAuthProviderWrapper>
    </div>
  )
}
