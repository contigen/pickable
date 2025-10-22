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
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import { DashboardData } from '@/lib/schema'

const chartConfig = {
  actual: {
    label: 'Actual Revenue',
    color: 'hsl(var(--chart-1))',
  },
  predicted: {
    label: 'Predicted Revenue',
    color: 'hsl(var(--chart-2))',
  },
}

export function ForecastChart({
  forecast,
}: {
  forecast: DashboardData['chartData']['forecast']
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Forecast</CardTitle>
        <CardDescription>
          Historical data vs AI predictions for the next 3 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width='100%' height={300}>
            <AreaChart data={forecast}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='month' />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type='monotone'
                dataKey='actual'
                stroke='var(--color-actual)'
                fill='var(--color-actual)'
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Area
                type='monotone'
                dataKey='predicted'
                stroke='var(--color-predicted)'
                fill='var(--color-predicted)'
                fillOpacity={0.2}
                strokeWidth={2}
                strokeDasharray='5 5'
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
