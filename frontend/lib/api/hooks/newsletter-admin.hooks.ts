import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../instance'
import type {
  Campaign,
  CampaignStatus,
  PaginatedSubscribers,
  SubscriberStatus,
} from '../domain'

export const newsletterAdminKeys = {
  subscribers: (page: number, status: string, search: string) =>
    ['studio', 'newsletter', 'subscribers', page, status, search] as const,
  campaigns: ['studio', 'newsletter', 'campaigns'] as const,
  campaign: (id: string) => ['studio', 'newsletter', 'campaigns', id] as const,
}

// ─── Subscribers ────────────────────────────────────────────────────────────

export function useSubscribers(page = 1, status?: SubscriberStatus, search = '') {
  return useQuery({
    queryKey: newsletterAdminKeys.subscribers(page, status ?? '', search),
    queryFn: () =>
      api.get<PaginatedSubscribers>('/studio/newsletter/subscribers', {
        params: {
          page,
          ...(status ? { status } : {}),
          ...(search ? { search } : {}),
        },
      }),
    placeholderData: (prev) => prev,
  })
}

export function useDeleteSubscriber() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api.delete(`/studio/newsletter/subscribers/${id}`, { successMessage: 'Subscriber removed' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['studio', 'newsletter', 'subscribers'] }),
  })
}

// ─── Campaigns ────────────────────────────────────────────────────────────────

export interface CampaignInput {
  subject: string
  content: string
}

export function useCampaigns() {
  return useQuery({
    queryKey: newsletterAdminKeys.campaigns,
    queryFn: () => api.get<Campaign[]>('/studio/newsletter/campaigns'),
  })
}

export function useCampaign(id: string, opts?: { poll?: boolean }) {
  return useQuery({
    queryKey: newsletterAdminKeys.campaign(id),
    queryFn: () => api.get<Campaign>(`/studio/newsletter/campaigns/${id}`),
    enabled: !!id,
    // While a send is in flight, keep polling so progress (sent_count) updates live.
    refetchInterval: (query) => {
      if (!opts?.poll) return false
      const status = (query.state.data as Campaign | undefined)?.status as CampaignStatus | undefined
      return status === 'SENDING' ? 2_000 : false
    },
  })
}

function useCampaignMutation<TVars>(fn: (vars: TVars) => Promise<unknown>) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['studio', 'newsletter', 'campaigns'] }),
  })
}

export function useCreateCampaign() {
  return useCampaignMutation((body: CampaignInput) =>
    api.post<Campaign>('/studio/newsletter/campaigns', body, { successMessage: 'Draft created' }),
  )
}

export function useUpdateCampaign() {
  return useCampaignMutation(({ id, ...body }: Partial<CampaignInput> & { id: string }) =>
    api.patch<Campaign>(`/studio/newsletter/campaigns/${id}`, body, { successMessage: 'Saved' }),
  )
}

export function useDeleteCampaign() {
  return useCampaignMutation((id: string) =>
    api.delete(`/studio/newsletter/campaigns/${id}`, { successMessage: 'Campaign deleted' }),
  )
}

export function useSendTestCampaign() {
  return useMutation({
    mutationFn: (id: string) => api.post<{ message: string }>(`/studio/newsletter/campaigns/${id}/send-test`),
  })
}

export function useSendCampaign() {
  return useCampaignMutation((id: string) =>
    api.post(`/studio/newsletter/campaigns/${id}/send`, undefined, { successMessage: 'Sending started' }),
  )
}
