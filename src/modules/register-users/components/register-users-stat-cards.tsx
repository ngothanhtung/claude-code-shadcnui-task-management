"use client"

import { Card, CardContent } from "@/components/ui/card"
import { CalendarClock, Mail, MessageSquareText, Phone } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ElementType
  bgColor: string
  iconColor: string
  subtitle?: string
}

function StatCard({
  title,
  value,
  icon: Icon,
  bgColor,
  iconColor,
  subtitle,
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-muted-foreground">
              {title}
            </span>
            <span className="text-2xl font-bold">{value}</span>
            {subtitle && (
              <span className="text-xs text-muted-foreground">{subtitle}</span>
            )}
          </div>
          <div className={cn("rounded-lg p-3", bgColor)}>
            <Icon className={cn("size-6", iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface RegisterUsersStatCardsProps {
  stats: {
    total: number
    today: number
    withPhone: number
    withMessage: number
  }
}

export function RegisterUsersStatCards({ stats }: RegisterUsersStatCardsProps) {
  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
      <StatCard
        title="Total Registrations"
        value={stats.total}
        icon={Mail}
        bgColor="bg-secondary"
        iconColor=""
        subtitle="All time"
      />
      <StatCard
        title="Today"
        value={stats.today}
        icon={CalendarClock}
        bgColor="bg-blue-100 dark:bg-blue-950"
        iconColor="text-blue-600 dark:text-blue-400"
        subtitle="Created today"
      />
      <StatCard
        title="With Phone"
        value={stats.withPhone}
        icon={Phone}
        bgColor="bg-green-100 dark:bg-green-950"
        iconColor="text-green-600 dark:text-green-400"
        subtitle={`${stats.total > 0 ? Math.round((stats.withPhone / stats.total) * 100) : 0}% provided`}
      />
      <StatCard
        title="With Message"
        value={stats.withMessage}
        icon={MessageSquareText}
        bgColor="bg-yellow-100 dark:bg-yellow-950"
        iconColor="text-yellow-600 dark:text-yellow-400"
        subtitle={`${stats.total > 0 ? Math.round((stats.withMessage / stats.total) * 100) : 0}% provided`}
      />
    </div>
  )
}
