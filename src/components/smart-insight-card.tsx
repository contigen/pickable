import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DashboardData } from '@/lib/schema'

export function SmartInsightCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  description,
  aiInsight,
}: DashboardData['smartInsights'][number]) {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'negative':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-muted-foreground bg-muted/50 border-border'
    }
  }

  return (
    <Card className='hover:shadow-md transition-shadow'>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium text-muted-foreground'>
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className='flex items-center justify-between'>
          <div className='text-2xl font-bold'>{value}</div>
          {change && (
            <Badge variant='outline' className={getChangeColor()}>
              {change}
            </Badge>
          )}
        </div>
        {description && (
          <p className='text-xs text-muted-foreground mt-2'>{description}</p>
        )}
        <p className='text-xs text-muted-foreground mt-2'>{aiInsight}</p>
      </CardContent>
    </Card>
  )
}
