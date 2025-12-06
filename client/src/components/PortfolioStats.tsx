import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Wallet, DollarSign, PieChart, Activity } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/lib/crypto-icons";

interface PortfolioStatsProps {
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  holdingsCount: number;
  isLoading?: boolean;
}

export function PortfolioStats({
  totalValue,
  totalCost,
  totalGainLoss,
  totalGainLossPercentage,
  holdingsCount,
  isLoading,
}: PortfolioStatsProps) {
  const isPositive = totalGainLoss >= 0;

  const stats = [
    {
      label: "Portfolio Value",
      value: formatCurrency(totalValue),
      icon: Wallet,
      color: "text-primary",
      testId: "stat-portfolio-value",
    },
    {
      label: "Total Invested",
      value: formatCurrency(totalCost),
      icon: DollarSign,
      color: "text-muted-foreground",
      testId: "stat-total-invested",
    },
    {
      label: "Total Gain/Loss",
      value: formatCurrency(Math.abs(totalGainLoss)),
      change: formatPercentage(totalGainLossPercentage),
      icon: isPositive ? TrendingUp : TrendingDown,
      color: isPositive ? "text-emerald-500" : "text-red-500",
      testId: "stat-gain-loss",
    },
    {
      label: "Assets Held",
      value: holdingsCount.toString(),
      icon: PieChart,
      color: "text-chart-2",
      testId: "stat-assets-count",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} data-testid={stat.testId}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-2xl font-bold tabular-nums">{stat.value}</span>
              {stat.change && (
                <span className={`text-sm font-medium ${stat.color}`}>
                  {stat.change}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
