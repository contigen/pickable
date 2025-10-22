import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, TrendingUp, Lightbulb } from 'lucide-react'
import { DashboardData } from '@/lib/schema'

export function InsightsPanel({
  insights,
}: {
  insights: DashboardData['insights']
}) {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return TrendingUp
      case 'warning':
        return AlertTriangle
      default:
        return Lightbulb
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity':
        return 'text-green-600 bg-green-100'
      case 'warning':
        return 'text-yellow-600 bg-yellow-100'
      default:
        return 'text-blue-600 bg-blue-100'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Insights</CardTitle>
        <CardDescription>
          AI-identified patterns and recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {insights.map((insight, index) => {
            const Icon = getInsightIcon(insight.type)
            const colorClass = getInsightColor(insight.type)

            return (
              <div
                key={index}
                className='flex gap-3 p-3 rounded-lg border bg-muted/30'
              >
                <div
                  className={`p-2 rounded-full ${colorClass} flex-shrink-0 size-fit`}
                >
                  <Icon className='size-4' />
                </div>
                <div className='flex-1 space-y-2'>
                  <div className='flex items-start justify-between'>
                    <h4 className='font-medium'>{insight.title}</h4>
                    <Badge variant='outline' className='text-xs'>
                      {insight.confidence}% confidence
                    </Badge>
                  </div>
                  <p className='text-sm text-muted-foreground'>
                    {insight.description}
                  </p>
                  <Badge
                    variant={
                      insight.impact === 'high' ? 'default' : 'secondary'
                    }
                    className='text-xs'
                  >
                    {insight.impact} impact
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
