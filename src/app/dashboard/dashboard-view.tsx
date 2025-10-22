'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, Download, Loader2 } from 'lucide-react'
import { ForecastChart } from '@/components/forecast-chart'
import { InsightsPanel } from '@/components/insights-panel'
import { RecommendationsCard } from '@/components/recommendations-card'
import { EmailReportDialog } from '@/components/email-report-dialog'
import { RevenueBreakdownChart } from '@/components/revenue-breakdown-chart'
import { SeasonalPatternsChart } from '@/components/seasonal-patterns-chart'
import { CustomerAcquisitionChart } from '@/components/customer-acquisition-chart'
import { InventoryTurnoverChart } from '@/components/inventory-turnover-chart'
import { ProfitMarginAnalysis } from '@/components/profit-margin-analysis'
import { AIQueryBar } from '@/components/ai-query-bar'
import { SmartInsightCard } from '@/components/smart-insight-card'
import { DashboardData } from '@/lib/schema'
import { generateDashboardPDF } from '@/lib/pdf-utils'

export function DashboardView({
  dashboardData,
}: {
  dashboardData: DashboardData
}) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const {
    forecastSummary,
    smartInsights,
    insights,
    suggestedQueries,
    reportName,
    recommendations,
    chartData: {
      revenueBreakdown,
      seasonalPatterns,
      customerAcquisition,
      inventoryTurnover,
      profitMargin,
      forecast,
    },
  } = dashboardData

  const handleDownloadPDF = async () => {
    await generateDashboardPDF(dashboardData, setIsGeneratingPDF)
  }

  return (
    <div className='container max-w-7xl mx-auto py-8 px-4'>
      <div className='space-y-8'>
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>AI Dashboard</h1>
            <p className='text-muted-foreground'>
              Ask questions about your business data in natural language
            </p>
          </div>
          <div className='flex gap-2'>
            <EmailReportDialog reportName={reportName} />
            <Button onClick={handleDownloadPDF} disabled={isGeneratingPDF}>
              {isGeneratingPDF ? (
                <>
                  <Loader2 className='size-4 mr-2 animate-spin' />
                  Generating...
                </>
              ) : (
                <>
                  <Download className='size-4 mr-2' />
                  Download PDF
                </>
              )}
            </Button>
          </div>
        </div>

        <AIQueryBar suggestedQueries={suggestedQueries} />

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {smartInsights.map((insight, index) => (
            <SmartInsightCard key={index} {...insight} />
          ))}
        </div>

        <Tabs defaultValue='overview'>
          <TabsList className='grid w-full grid-cols-3'>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            <TabsTrigger value='detailed'>Detailed Analysis</TabsTrigger>
            <TabsTrigger value='recommendations'>Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value='overview' className='space-y-6 mt-6'>
            <Card className='bg-gradient-to-br from-primary/5 to-background'>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle className='flex items-center gap-2'>
                      <div className='h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center'>
                        <TrendingUp className='h-4 w-4 text-primary' />
                      </div>
                      AI Forecast Summary
                    </CardTitle>
                  </div>
                  <Badge className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'>
                    {forecastSummary.confidence}% Confidence
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className='prose prose-sm max-w-none text-muted-foreground'>
                  <p className='text-base leading-relaxed'>
                    {forecastSummary.overview}
                  </p>
                  <p className='text-base leading-relaxed mt-4'>
                    {forecastSummary.summary}
                  </p>
                  <p className='text-base leading-relaxed mt-4'>
                    {forecastSummary.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              <div id='forecast-chart'>
                <ForecastChart forecast={forecast} />
              </div>
              <InsightsPanel insights={insights} />
            </div>
          </TabsContent>

          <TabsContent value='detailed' className='space-y-6 mt-6'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              <div id='revenue-breakdown-chart'>
                <RevenueBreakdownChart revenueBreakdown={revenueBreakdown} />
              </div>
              <div id='seasonal-patterns-chart'>
                <SeasonalPatternsChart seasonalPatterns={seasonalPatterns} />
              </div>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              <div id='customer-acquisition-chart'>
                <CustomerAcquisitionChart
                  customerAcquisition={customerAcquisition}
                />
              </div>
              <div id='inventory-turnover-chart'>
                <InventoryTurnoverChart inventoryTurnover={inventoryTurnover} />
              </div>
            </div>

            <div className='grid grid-cols-1 gap-6'>
              <div id='profit-margin-chart'>
                <ProfitMarginAnalysis profitMargin={profitMargin} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value='recommendations' className='space-y-6 mt-6'>
            <RecommendationsCard recommendations={recommendations} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
