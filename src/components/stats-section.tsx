import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Users, Clock, Star } from "lucide-react"

export function StatsSection() {
  const stats = [
    {
      icon: Users,
      value: "10,000+",
      label: "Businesses Served",
      description: "Small businesses trust our forecasts",
    },
    {
      icon: TrendingUp,
      value: "95%",
      label: "Accuracy Rate",
      description: "Industry-leading prediction accuracy",
    },
    {
      icon: Clock,
      value: "< 2 min",
      label: "Processing Time",
      description: "Fast results when you need them",
    },
    {
      icon: Star,
      value: "4.9/5",
      label: "Customer Rating",
      description: "Highly rated by our users",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 group">
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="text-2xl font-bold text-primary">{stat.value}</div>
              <div className="font-medium">{stat.label}</div>
              <div className="text-sm text-muted-foreground text-center">{stat.description}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
