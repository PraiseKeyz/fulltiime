import { redirect } from 'next/navigation'

// Transfers now lives as a tab under News
export default function TransfersRedirect() {
  redirect('/news?tab=transfers')
}
