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
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from 'recharts'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { DashboardData } from '@/lib/schema'

const chartConfig = {
  grossMargin: {
    label: 'Gross Margin %',
    color: 'hsl(158 64% 52%)',
  },
  netMargin: {
    label: 'Net Margin %',
    color: 'hsl(221 83% 53%)',
  },
}

export function ProfitMarginAnalysis({
  profitMargin,
}: {
  profitMargin: DashboardData['chartData']['profitMargin']
}) {
  // if (!profitMargin.length) return null
  const avgGrossMargin =
    profitMargin.reduce((sum, item) => sum + item.grossMargin, 0) /
    profitMargin.length
  const avgNetMargin =
    profitMargin.reduce((sum, item) => sum + item.netMargin, 0) /
    profitMargin.length
  const marginTrend =
    (profitMargin.at(-1)?.netMargin || 0) - (profitMargin.at(0)?.netMargin || 0)

  const getTrendIcon = (trend: number) => {
    if (trend > 1)
      return (
        <TrendingUp className='size-4 text-green-600 dark:text-green-400' />
      )
    if (trend < -1)
      return <TrendingDown className='size-4 text-red-600 dark:text-red-400' />
    return <Minus className='h-4 w-4 text-muted-foreground' />
  }

  const getTrendColor = (trend: number) => {
    if (trend > 1) return 'text-green-600 dark:text-green-400'
    if (trend < -1) return 'text-red-600 dark:text-red-400'
    return 'text-muted-foreground'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profit Margin Analysis</CardTitle>
        <CardDescription>
          Gross and net profit margin trends over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width='100%' height={350}>
            <AreaChart
              data={profitMargin}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='month' />
              <YAxis domain={[0, 40]} />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value, name) => [`${value}%`, name]}
              />
              <ReferenceLine
                y={20}
                stroke='#666'
                strokeDasharray='2 2'
                label='Industry Average'
              />
              <Area
                type='monotone'
                dataKey='grossMargin'
                stroke='var(--color-grossMargin)'
                fill='var(--color-grossMargin)'
                fillOpacity={0.2}
                strokeWidth={2}
                name='Gross Margin %'
              />
              <Area
                type='monotone'
                dataKey='netMargin'
                stroke='var(--color-netMargin)'
                fill='var(--color-netMargin)'
                fillOpacity={0.3}
                strokeWidth={2}
                name='Net Margin %'
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        <div className='mt-6 grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='text-center p-4 bg-green-500/10 dark:bg-green-500/20 rounded-lg border border-green-500/20 dark:border-green-500/30'>
            <div className='text-2xl font-bold text-green-700 dark:text-green-300'>
              {isNaN(avgGrossMargin) ? 'N/A' : `${avgGrossMargin.toFixed(1)}%`}
            </div>
            <div className='text-sm text-green-600 dark:text-green-400'>
              Average Gross Margin
            </div>
          </div>

          <div className='text-center p-4 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg border border-blue-500/20 dark:border-blue-500/30'>
            <div className='text-2xl font-bold text-blue-700 dark:text-blue-300'>
              {isNaN(avgNetMargin) ? 'N/A' : `${avgNetMargin.toFixed(1)}%`}
            </div>
            <div className='text-sm text-blue-600 dark:text-blue-400'>
              Average Net Margin
            </div>
          </div>

          <div className='text-center p-4 bg-muted/50 dark:bg-muted/20 rounded-lg border border-border'>
            <div
              className={`text-2xl font-bold flex items-center justify-center gap-1 ${getTrendColor(
                marginTrend
              )}`}
            >
              {getTrendIcon(marginTrend)}
              {marginTrend > 0 ? '+' : ''}
              {isNaN(marginTrend) ? 'N/A' : `${marginTrend.toFixed(1)}% `}
            </div>
            <div className='text-sm text-muted-foreground'>6-Month Trend</div>
            <Badge variant='outline' className='mt-2' hidden={!marginTrend}>
              {marginTrend > 1
                ? 'Improving'
                : marginTrend < -1
                ? 'Declining'
                : 'Stable'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
