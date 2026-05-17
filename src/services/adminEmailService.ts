import { getFirebaseFunctions, isFirebaseAvailable } from '../lib/firebase'

export type AdminCampaignAudience =
  | 'all_active'
  | 'pending_onboarding'
  | 'completed_onboarding'
  | 'without_venture'

export type SendAdminCampaignInput = {
  subject: string
  body: string
  audience: AdminCampaignAudience
}

type SendAdminCampaignResult = {
  campaignId: string
  recipientCount: number
}

export async function sendAdminCampaignEmail(input: SendAdminCampaignInput) {
  if (!isFirebaseAvailable) {
    throw new Error('Firebase Functions no esta disponible en este entorno.')
  }

  const [{ httpsCallable }, functions] = await Promise.all([
    import('firebase/functions'),
    getFirebaseFunctions(),
  ])
  const callable = httpsCallable<SendAdminCampaignInput, SendAdminCampaignResult>(functions, 'sendAdminCampaignEmails')
  const result = await callable(input)
  return result.data
}
