import { redirect } from 'next/navigation'

// Canonical match detail lives at /matches/[id]
export default async function FixtureRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/matches/${id}`)
}
