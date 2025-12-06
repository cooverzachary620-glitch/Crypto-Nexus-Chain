import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/lib/crypto-icons";
import type { PricePoint } from "@shared/schema";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface PriceChartProps {
  symbol: string;
  name: string;
  currentPrice: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  priceHistory?: PricePoint[];
  isLoading?: boolean;
}

const intervals = ["1H", "24H", "7D", "30D", "1Y"] as const;

export function PriceChart({
  symbol,
  name,
  currentPrice,
  priceChange24h,
  priceChangePercentage24h,
  priceHistory,
  isLoading,
}: PriceChartProps) {
  const [selectedInterval, setSelectedInterval] = useState<string>("24H");
  const isPositive = priceChangePercentage24h >= 0;

  const chartData = useMemo(() => {
    if (!priceHistory || priceHistory.length === 0) {
      // Generate mock data if no history provided
      const now = Date.now();
      const data: { time: string; price: number }[] = [];
      const basePrice = currentPrice;
      
      for (let i = 24; i >= 0; i--) {
        const variation = (Math.random() - 0.5) * basePrice * 0.05;
        data.push({
          time: new Date(now - i * 60 * 60 * 1000).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          price: basePrice + variation * (i / 24),
        });
      }
      return data;
    }

    return priceHistory.map((point) => ({
      time: new Date(point.timestamp).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      price: point.price,
    }));
  }, [priceHistory, currentPrice]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-price-chart">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 pb-2">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-xl">
            {name} ({symbol})
          </CardTitle>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold tabular-nums" data-testid="text-current-price">
              {formatCurrency(currentPrice)}
            </span>
            <span
              className={`flex items-center gap-1 text-sm font-medium ${
                isPositive ? "text-emerald-500" : "text-red-500"
              }`}
              data-testid="text-price-change"
            >
              {isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {formatPercentage(priceChangePercentage24h)}
            </span>
          </div>
        </div>
        <div className="flex gap-1">
          {intervals.map((interval) => (
            <Button
              key={interval}
              variant={selectedInterval === interval ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedInterval(interval)}
              data-testid={`button-interval-${interval.toLowerCase()}`}
            >
              {interval}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={isPositive ? "#10b981" : "#ef4444"}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={isPositive ? "#10b981" : "#ef4444"}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickMargin={8}
              />
              <YAxis
                domain={["dataMin - 100", "dataMax + 100"]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
                width={70}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
                formatter={(value: number) => [formatCurrency(value), "Price"]}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={isPositive ? "#10b981" : "#ef4444"}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPrice)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
