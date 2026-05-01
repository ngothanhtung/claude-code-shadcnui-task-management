import { Card, CardContent } from "@/components/ui/card"
import { Users, Star, Target, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

function formatCurrency(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1)}B`
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M`
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(0)}K`
  }
  return amount.toString()
}

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ElementType
  trend?: string
  trendUp?: boolean
}

function StatCard({ title, value, icon: Icon, trend, trendUp }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-muted-foreground">{title}</span>
            <span className="text-2xl font-bold">{value}</span>
            {trend && (
              <span className={cn(
                "text-xs flex items-center gap-1",
                trendUp ? "text-green-600 dark:text-green-400" : "text-red-500"
              )}>
                <TrendingUp className={cn("size-3", !trendUp && "rotate-180")} />
                {trend}
              </span>
            )}
          </div>
          <div className="bg-secondary rounded-lg p-3">
            <Icon className="size-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface CustomerStatCardsProps {
  stats: {
    total: number
    active: number
    vip: number
    prospect: number
    totalRevenue: number
  }
}

export function CustomerStatCards({ stats }: CustomerStatCardsProps) {
  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
      <StatCard
        title="Total Customers"
        value={stats.total}
        icon={Users}
        trend="All time"
        trendUp
      />
      <StatCard
        title="Active Customers"
        value={stats.active}
        icon={Target}
        trend={`${stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% active`}
        trendUp={stats.active > 0}
      />
      <StatCard
        title="VIP Customers"
        value={stats.vip}
        icon={Star}
        trend={`${stats.total > 0 ? Math.round((stats.vip / stats.total) * 100) : 0}% vip`}
        trendUp={stats.vip > 0}
      />
      <StatCard
        title="Total Revenue"
        value={`${formatCurrency(stats.totalRevenue)} đ`}
        icon={TrendingUp}
        trend="From all customers"
        trendUp
      />
    </div>
  )
}