import { useQuery } from "@tanstack/react-query";
import { TransactionHistory } from "@/components/TransactionHistory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDownLeft, ArrowUpRight, RefreshCw, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/crypto-icons";
import type { Transaction } from "@shared/schema";

export default function History() {
  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  // Calculate summary stats
  const stats = transactions.reduce(
    (acc, tx) => {
      if (tx.type === "buy") {
        acc.totalBought += tx.totalValue;
        acc.buyCount++;
      } else if (tx.type === "sell") {
        acc.totalSold += tx.totalValue;
        acc.sellCount++;
      } else if (tx.type === "convert") {
        acc.convertCount++;
      }
      return acc;
    },
    { totalBought: 0, totalSold: 0, buyCount: 0, sellCount: 0, convertCount: 0 }
  );

  const summaryCards = [
    {
      label: "Total Bought",
      value: formatCurrency(stats.totalBought),
      count: `${stats.buyCount} transactions`,
      icon: ArrowDownLeft,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      testId: "stat-total-bought",
    },
    {
      label: "Total Sold",
      value: formatCurrency(stats.totalSold),
      count: `${stats.sellCount} transactions`,
      icon: ArrowUpRight,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      testId: "stat-total-sold",
    },
    {
      label: "Net Position",
      value: formatCurrency(stats.totalBought - stats.totalSold),
      count: `${transactions.length} total`,
      icon: TrendingUp,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      testId: "stat-net-position",
    },
    {
      label: "Conversions",
      value: stats.convertCount.toString(),
      count: "swaps",
      icon: RefreshCw,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      testId: "stat-conversions",
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6 p-6" data-testid="page-history">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">History</h1>
            <p className="text-muted-foreground">Your transaction history</p>
          </div>
        </div>
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
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6" data-testid="page-history">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">History</h1>
          <p className="text-muted-foreground">Your transaction history</p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((stat) => (
          <Card key={stat.label} data-testid={stat.testId}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <div className={`rounded-full p-2 ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold tabular-nums">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Transaction list */}
      <TransactionHistory transactions={transactions} showFilters={true} />
    </div>
  );
}
