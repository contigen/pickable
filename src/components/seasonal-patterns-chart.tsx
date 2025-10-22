'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { Badge } from '@/components/ui/badge'
import { DashboardData } from '@/lib/schema'

const chartConfig = {
  thisYear: {
    label: 'This Year',
    color: 'hsl(158 64% 52%)',
  },
  lastYear: {
    label: 'Last Year',
    color: 'hsl(221 83% 53%)',
  },
  average: {
    label: '3-Year Average',
    color: 'hsl(45 93% 47%)',
  },
}

export function SeasonalPatternsChart({
  seasonalPatterns,
}: {
  seasonalPatterns: DashboardData['chartData']['seasonalPatterns']
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Seasonal Patterns</CardTitle>
        <CardDescription>
          Revenue patterns and seasonal trends analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width='100%' height={300}>
            <LineChart
              data={seasonalPatterns}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='month' />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type='monotone'
                dataKey='average'
                stroke='var(--color-average)'
                strokeWidth={2}
                strokeDasharray='5 5'
                name='3-Year Average'
              />
              <Line
                type='monotone'
                dataKey='lastYear'
                stroke='var(--color-lastYear)'
                strokeWidth={2}
                name='Last Year'
              />
              <Line
                type='monotone'
                dataKey='thisYear'
                stroke='var(--color-thisYear)'
                strokeWidth={3}
                name='This Year'
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        <div className='mt-4 flex flex-wrap gap-2'>
          <Badge
            variant='outline'
            className='bg-green-500/10 dark:bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30 dark:border-green-500/40 hover:bg-green-500/20 dark:hover:bg-green-500/30 transition-colors'
          >
            Peak Season:{' '}
            {
              seasonalPatterns.find(pattern => pattern.month === 'Nov')
                ?.thisYear
            }{' '}
            (+25%)
            {
              seasonalPatterns.find(pattern => pattern.month === 'Nov')
                ?.thisYear
            }
          </Badge>
          <Badge
            variant='outline'
            className='bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30 dark:border-blue-500/40 hover:bg-blue-500/20 dark:hover:bg-blue-500/30 transition-colors'
          >
            Low Season:{' '}
            {
              seasonalPatterns.find(pattern => pattern.month === 'Jan')
                ?.thisYear
            }{' '}
            (-15%)
          </Badge>
          <Badge
            variant='outline'
            className='bg-yellow-500/10 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30 dark:border-yellow-500/40 hover:bg-yellow-500/20 dark:hover:bg-yellow-500/30 transition-colors'
          >
            Growth Trend:{' '}
            {
              seasonalPatterns.find(pattern => pattern.month === 'Jan')
                ?.thisYear
            }{' '}
            +12% YoY
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
