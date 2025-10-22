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
import { DashboardData } from '@/lib/schema'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts'

const chartConfig = {
  products: {
    label: 'Products',
    color: 'hsl(158 64% 52%)',
  },
  services: {
    label: 'Services',
    color: 'hsl(221 83% 53%)',
  },
  subscriptions: {
    label: 'Subscriptions',
    color: 'hsl(262 83% 58%)',
  },
}

export function RevenueBreakdownChart({
  revenueBreakdown,
}: {
  revenueBreakdown: DashboardData['chartData']['revenueBreakdown']
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Breakdown</CardTitle>
        <CardDescription>
          Monthly revenue by category over the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width='100%' height={300}>
            <BarChart
              data={revenueBreakdown}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='month' />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar
                dataKey='products'
                fill='var(--color-products)'
                name='Products'
              />
              <Bar
                dataKey='services'
                fill='var(--color-services)'
                name='Services'
              />
              <Bar
                dataKey='subscriptions'
                fill='var(--color-subscriptions)'
                name='Subscriptions'
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <div className='mt-4 grid grid-cols-3 gap-4'>
          <div className='text-center p-3 bg-green-500/10 dark:bg-green-500/20 rounded-lg border border-green-500/20 dark:border-green-500/30'>
            <div className='text-2xl font-bold text-green-600 dark:text-green-400'>
              $
              {revenueBreakdown
                .reduce((acc, curr) => acc + curr.products, 0)
                .toLocaleString()}
            </div>
            <div className='text-sm text-muted-foreground'>Products (6mo)</div>
          </div>
          <div className='text-center p-3 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg border border-blue-500/20 dark:border-blue-500/30'>
            <div className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
              ${revenueBreakdown.reduce((acc, curr) => acc + curr.services, 0)}
            </div>
            <div className='text-sm text-muted-foreground'>Services (6mo)</div>
          </div>
          <div className='text-center p-3 bg-purple-500/10 dark:bg-purple-500/20 rounded-lg border border-purple-500/20 dark:border-purple-500/30'>
            <div className='text-2xl font-bold text-purple-600 dark:text-purple-400'>
              $
              {revenueBreakdown.reduce(
                (acc, curr) => acc + curr.subscriptions,
                0
              )}
            </div>
            <div className='text-sm text-muted-foreground'>
              Subscriptions (6mo)
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
