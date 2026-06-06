import { redirect } from 'next/navigation'

// Analytics now lives as a tab under News
export default function AnalyticsRedirect() {
  redirect('/news?tab=analytics')
}
