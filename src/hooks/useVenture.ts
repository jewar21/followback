import { useParams } from 'react-router-dom'
import { useAppData } from '../app/providers/AppDataProvider'

export function useVenture(slugFromProps?: string) {
  const params = useParams()
  const slug = slugFromProps ?? params.slug ?? ''
  return useAppData().getVentureBySlug(slug)
}
