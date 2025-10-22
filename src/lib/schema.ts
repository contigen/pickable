import z from 'zod'

export const loginSchema = z.object({
  email: z
    .string('Email is required')
    .trim()
    .min(1, `Email is required`)
    .pipe(z.email(`Invalid email`)),
  businessName: z
    .string('Business Name is required')
    .trim()
    .min(1, `Business Name is required`),
})

export const ColumnsSchema = z.enum([
  'Date',
  'Total Sales',
  'Orders',
  'Returning Customers',
  'New Customers',
  'Ad Spend',
  'Inventory Level',
])

export const SerialisedQuerySchema = z.object({
  content: z.string(),
  sliceType: z.string(),
  timeframe: z.string(),
})

export const ContextualSummarySchema = z.object({
  items: z.array(
    z.object({
      content: z.string(),
      sliceType: z.string(),
      timeframe: z.string(),
      metadata: z
        .array(
          z.object({
            key: z.string(),
            value: z.string(),
          })
        )
        .optional(),
    })
  ),
})

export type ContextualSummaries = z.infer<typeof ContextualSummarySchema>

const MetricSchema = z.object({
  current: z.number(),
  predicted: z.number(),
  change: z.number(),
})

const ForecastSummarySchema = z.object({
  period: z.string(),
  confidence: z.number().min(0).max(100),
  trend: z.enum(['upward', 'downward', 'stable']),
  keyMetrics: z.object({
    revenue: MetricSchema,
    inventory: MetricSchema,
    customers: MetricSchema,
  }),
  overview: z.string(),
  summary: z.string(),
  description: z.string(),
})

const SmartInsightSchema = z.object({
  title: z.string(),
  value: z.string(),
  change: z.string().optional(),
  changeType: z.enum(['positive', 'negative', 'neutral']),
  icon: z.string(),
  trend: z.enum(['up', 'down', 'stable']),
  description: z.string().optional(),
  confidence: z.number().min(0).max(100),
  aiInsight: z.string(),
})

const InsightSchema = z.object({
  type: z.union([z.enum(['opportunity', 'warning', 'insight']), z.string()]),
  title: z.string(),
  description: z.string(),
  impact: z.enum(['high', 'medium', 'low']),
  confidence: z.number().min(0).max(100),
})

const RecommendationSchema = z.object({
  title: z.string(),
  description: z.string(),
  priority: z.enum(['high', 'medium', 'low']),
  timeframe: z.string(),
  impact: z.string(),
  icon: z.string(),
  actions: z.array(z.string()),
})

const ForecastChartSchema = z.array(
  z.object({
    month: z.string(),
    actual: z.number(),
    predicted: z.boolean().nullable(),
  })
)

const RevenueBreakdownSchema = z.array(
  z.object({
    month: z.string(),
    products: z.number(),
    services: z.number(),
    subscriptions: z.number(),
  })
)

const SeasonalDataSchema = z.array(
  z.object({
    month: z.string(),
    thisYear: z.number(),
    lastYear: z.string(),
    average: z.number(),
  })
)

const CustomerAcquisitionSchema = z.array(
  z.object({
    month: z.string(),
    newCustomers: z.number(),
    totalCustomers: z.number(),
    churnRate: z.number(),
  })
)

const InventoryTurnoverSchema = z.array(
  z.object({
    month: z.string(),
    inventory: z.number(),
    turnover: z.number(),
    daysOnHand: z.number(),
  })
)

const ProfitMarginSchema = z.array(
  z.object({
    month: z.string(),
    revenue: z.number(),
    costs: z.number(),
    grossMargin: z.number(),
    netMargin: z.number(),
  })
)

export const DashboardSchema = z.object({
  reportName: z.string(),
  suggestedQueries: z.array(z.string()),
  forecastSummary: ForecastSummarySchema,
  smartInsights: z.array(SmartInsightSchema),
  insights: z.array(InsightSchema),
  recommendations: z.array(RecommendationSchema),
  chartData: z.object({
    forecast: ForecastChartSchema,
    revenueBreakdown: RevenueBreakdownSchema,
    seasonalPatterns: SeasonalDataSchema,
    customerAcquisition: CustomerAcquisitionSchema,
    inventoryTurnover: InventoryTurnoverSchema,
    profitMargin: ProfitMarginSchema,
  }),
})

export type DashboardData = z.infer<typeof DashboardSchema>

export const AIQueryResponseSchema = z.object({
  query: z.string(),
  response: z.string(),
  confidence: z.number().min(0).max(100),
  suggestedActions: z.array(z.string()).optional(),
  relatedInsights: z.array(z.string()).optional(),
  timestamp: z.string().datetime(),
})

export type AIQueryResponse = z.infer<typeof AIQueryResponseSchema>

const InventoryItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  sku: z.string(),
  currentStock: z.number(),
  reorderPoint: z.number(),
  status: z.enum(['safe', 'warning', 'critical']),
  daysLeft: z.number(),
  velocity: z.number(),
  category: z.string(),
  reason: z.string(),
  lastUpdated: z.string().datetime().optional(),
  costPerUnit: z.number().optional(),
  totalValue: z.number().optional(),
  supplier: z.string().optional(),
  leadTime: z.number().optional(),
})

const InventorySummarySchema = z.object({
  totalItems: z.number(),
  criticalCount: z.number(),
  warningCount: z.number(),
  safeCount: z.number(),
  totalValue: z.number().optional(),
  averageVelocity: z.number(),
  turnoverRate: z.number().optional(),
  categoryBreakdown: z.array(
    z.object({
      category: z.string(),
      count: z.number(),
      criticalItems: z.number(),
    })
  ),
})

const InventoryFiltersSchema = z.object({
  availableStatuses: z.array(z.enum(['all', 'safe', 'warning', 'critical'])),
  availableCategories: z.array(z.string()),
  defaultStatusFilter: z.string().default('all'),
  defaultCategoryFilter: z.string().default('all'),
  searchPlaceholder: z.string().default('Search products or SKUs...'),
})

const InventoryAlertsSchema = z.object({
  urgentReorders: z.array(
    z.object({
      itemId: z.string(),
      itemName: z.string(),
      daysLeft: z.number(),
      recommendedOrderQuantity: z.number(),
      priority: z.enum(['immediate', 'urgent', 'soon']),
    })
  ),
  stockouts: z.array(
    z.object({
      itemId: z.string(),
      itemName: z.string(),
      expectedStockoutDate: z.string().datetime(),
      lostSalesRisk: z.number(),
    })
  ),
  overstock: z.array(
    z.object({
      itemId: z.string(),
      itemName: z.string(),
      excessUnits: z.number(),
      carryingCostImpact: z.number(),
    })
  ),
})

export const InventoryPageSchema = z.object({
  items: z.array(InventoryItemSchema),
  summary: InventorySummarySchema,
  filters: InventoryFiltersSchema,
  alerts: InventoryAlertsSchema.optional(),
  predictions: z
    .object({
      nextReorderDates: z.array(
        z.object({
          itemId: z.string(),
          predictedReorderDate: z.string().datetime(),
          confidence: z.number().min(0).max(100),
        })
      ),
      demandForecast: z.array(
        z.object({
          itemId: z.string(),
          forecastPeriod: z.string(),
          predictedDemand: z.number(),
          confidence: z.number().min(0).max(100),
        })
      ),
    })
    .optional(),
  generatedAt: z.string().datetime().optional(),
  dataSource: z.string().optional(),
  refreshInterval: z.number().optional(),
})

export type InventoryPageData = z.infer<typeof InventoryPageSchema>
export type InventoryItem = z.infer<typeof InventoryItemSchema>
export type InventorySummary = z.infer<typeof InventorySummarySchema>
export type InventoryFilters = z.infer<typeof InventoryFiltersSchema>
export type InventoryAlerts = z.infer<typeof InventoryAlertsSchema>
