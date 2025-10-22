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
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { Package, RotateCcw, AlertTriangle } from 'lucide-react'
import { DashboardData } from '@/lib/schema'

const chartConfig = {
  inventory: {
    label: 'Inventory Level',
    color: 'hsl(221 83% 53%)',
  },
  turnover: {
    label: 'Turnover Rate',
    color: 'hsl(158 64% 52%)',
  },
}

export function InventoryTurnoverChart({
  inventoryTurnover,
}: {
  inventoryTurnover: DashboardData['chartData']['inventoryTurnover']
}) {
  const avgTurnover =
    inventoryTurnover.reduce((sum, item) => sum + item.turnover, 0) /
    inventoryTurnover.length
  const currentInventory = inventoryTurnover.at(-1)?.inventory
  const avgDaysOnHand =
    inventoryTurnover.reduce((sum, item) => sum + item.daysOnHand, 0) /
    inventoryTurnover.length

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Analysis</CardTitle>
        <CardDescription>
          Inventory levels and turnover efficiency
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width='100%' height={300}>
            <ComposedChart
              data={inventoryTurnover}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='month' />
              <YAxis yAxisId='left' />
              <YAxis yAxisId='right' orientation='right' />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                yAxisId='left'
                dataKey='inventory'
                fill='var(--color-inventory)'
                fillOpacity={0.6}
                name='Inventory Level'
              />
              <Line
                yAxisId='right'
                type='monotone'
                dataKey='turnover'
                stroke='var(--color-turnover)'
                strokeWidth={3}
                name='Turnover Rate'
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>

        <div className='mt-4 grid grid-cols-3 gap-4'>
          <div className='flex items-center gap-2 p-3 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg border border-blue-500/20 dark:border-blue-500/30'>
            <div className='h-8 w-8 rounded-full bg-blue-500/20 dark:bg-blue-500/30 flex items-center justify-center'>
              <Package className='h-4 w-4 text-blue-600 dark:text-blue-400' />
            </div>
            <div>
              <div className='text-lg font-bold text-foreground'>
                {currentInventory}
              </div>
              <div className='text-xs text-muted-foreground'>Current Stock</div>
            </div>
          </div>
          <div className='flex items-center gap-2 p-3 bg-green-500/10 dark:bg-green-500/20 rounded-lg border border-green-500/20 dark:border-green-500/30'>
            <div className='h-8 w-8 rounded-full bg-green-500/20 dark:bg-green-500/30 flex items-center justify-center'>
              <RotateCcw className='h-4 w-4 text-green-600 dark:text-green-400' />
            </div>
            <div>
              <div className='text-lg font-bold text-foreground'>
                {avgTurnover.toFixed(1)}x
              </div>
              <div className='text-xs text-muted-foreground'>Avg Turnover</div>
            </div>
          </div>
          <div className='flex items-center gap-2 p-3 bg-yellow-500/10 dark:bg-yellow-500/20 rounded-lg border border-yellow-500/20 dark:border-yellow-500/30'>
            <div className='h-8 w-8 rounded-full bg-yellow-500/20 dark:bg-yellow-500/30 flex items-center justify-center'>
              <AlertTriangle className='h-4 w-4 text-yellow-600 dark:text-yellow-400' />
            </div>
            <div>
              <div className='text-lg font-bold text-foreground'>
                {Math.round(avgDaysOnHand)}
              </div>
              <div className='text-xs text-muted-foreground'>Days on Hand</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
