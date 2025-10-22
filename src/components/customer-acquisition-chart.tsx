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
} from 'recharts'
import { TrendingUp, Users, UserPlus } from 'lucide-react'
import { DashboardData } from '@/lib/schema'

const chartConfig = {
  newCustomers: {
    label: 'New Customers',
    color: 'hsl(158 64% 52%)',
  },
  totalCustomers: {
    label: 'Total Customers',
    color: 'hsl(221 83% 53%)',
  },
}

export function CustomerAcquisitionChart({
  customerAcquisition,
}: {
  customerAcquisition: DashboardData['chartData']['customerAcquisition']
}) {
  const avgAcquisition =
    customerAcquisition.reduce((sum, item) => sum + item.newCustomers, 0) /
    customerAcquisition.length
  const totalGrowth =
    ((customerAcquisition[customerAcquisition.length - 1].totalCustomers -
      customerAcquisition[0].totalCustomers) /
      customerAcquisition[0].totalCustomers) *
    100

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Acquisition</CardTitle>
        <CardDescription>
          New customer growth and retention trends
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width='100%' height={300}>
            <AreaChart
              data={customerAcquisition}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='month' />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type='monotone'
                dataKey='newCustomers'
                stroke='var(--color-newCustomers)'
                fill='var(--color-newCustomers)'
                fillOpacity={0.3}
                strokeWidth={2}
                name='New Customers'
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        <div className='mt-4 grid grid-cols-3 gap-4'>
          <div className='flex items-center gap-2 p-3 bg-green-500/10 dark:bg-green-500/20 rounded-lg border border-green-500/20 dark:border-green-500/30'>
            <div className='h-8 w-8 rounded-full bg-green-500/20 dark:bg-green-500/30 flex items-center justify-center'>
              <UserPlus className='h-4 w-4 text-green-600 dark:text-green-400' />
            </div>
            <div>
              <div className='text-lg font-bold text-foreground'>
                {Math.round(avgAcquisition)}
              </div>
              <div className='text-xs text-muted-foreground'>Avg/Month</div>
            </div>
          </div>
          <div className='flex items-center gap-2 p-3 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg border border-blue-500/20 dark:border-blue-500/30'>
            <div className='h-8 w-8 rounded-full bg-blue-500/20 dark:bg-blue-500/30 flex items-center justify-center'>
              <Users className='h-4 w-4 text-blue-600 dark:text-blue-400' />
            </div>
            <div>
              <div className='text-lg font-bold text-foreground'>
                {customerAcquisition.at(-1)?.totalCustomers}
              </div>
              <div className='text-xs text-muted-foreground'>Total</div>
            </div>
          </div>
          <div className='flex items-center gap-2 p-3 bg-purple-500/10 dark:bg-purple-500/20 rounded-lg border border-purple-500/20 dark:border-purple-500/30'>
            <div className='h-8 w-8 rounded-full bg-purple-500/20 dark:bg-purple-500/30 flex items-center justify-center'>
              <TrendingUp className='h-4 w-4 text-purple-600 dark:text-purple-400' />
            </div>
            <div>
              <div className='text-lg font-bold text-foreground'>
                +{totalGrowth.toFixed(1)}%
              </div>
              <div className='text-xs text-muted-foreground'>Growth</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
