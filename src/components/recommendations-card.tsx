import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, DollarSign } from 'lucide-react'
import { DashboardData } from '@/lib/schema'

export function RecommendationsCard({
  recommendations,
}: {
  recommendations: DashboardData['recommendations']
}) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-800/50'
      case 'medium':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800/50'
      default:
        return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/50'
    }
  }

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>
          AI Recommendations
        </h2>
        <p className='text-muted-foreground'>
          Actionable insights to optimize your business performance
        </p>
      </div>

      <div className='grid gap-6'>
        {recommendations.map(
          (
            { icon, title, description, priority, timeframe, impact, actions },
            idx
          ) => (
            <Card
              key={idx}
              className='overflow-hidden hover:shadow-lg transition-all duration-300'
            >
              <CardHeader>
                <div className='flex items-start justify-between'>
                  <div className='flex items-center   gap-3'>
                    <div className='p-2 rounded-lg bg-primary/10'>{icon}</div>
                    <div>
                      <CardTitle className='text-lg'>{title}</CardTitle>
                      <CardDescription className='mt-1'>
                        {description}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    className={`${getPriorityColor(
                      priority
                    )} transition-colors duration-200 cursor-default`}
                  >
                    {priority}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                    <div className='flex items-center gap-2'>
                      <Clock className='h-4 w-4 text-muted-foreground' />
                      <span className='text-muted-foreground'>Timeframe:</span>
                      <span className='font-medium'>{timeframe}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <DollarSign className='h-4 w-4 text-muted-foreground' />
                      <span className='text-muted-foreground'>
                        Expected Impact:
                      </span>
                      <span className='font-medium text-green-600'>
                        {impact}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className='font-medium mb-2'>Action Items:</h4>
                    <div className='space-y-2'>
                      {actions.map((action, index) => (
                        <div
                          key={index}
                          className='flex items-center gap-2 text-sm'
                        >
                          <CheckCircle className='h-4 w-4 text-green-600 flex-shrink-0' />
                          <span>{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  )
}
