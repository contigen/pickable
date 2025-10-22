import { getCachedDataset, getForecast, getUserId } from '@/actions'
import { DashboardView } from './dashboard-view'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const userId = (await getUserId())!
  const dataset = await getCachedDataset(userId)
  if (!dataset) redirect('/onboarding')
  const forecast = await getForecast(`${dataset.name} ${dataset.data}`, userId)
  console.log(forecast)
  return <DashboardView dashboardData={forecast} />
}
