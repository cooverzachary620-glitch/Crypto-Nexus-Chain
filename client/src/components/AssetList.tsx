import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { CryptoIcon, formatCurrency, formatPercentage, formatLargeNumber } from "@/lib/crypto-icons";
import type { Cryptocurrency } from "@shared/schema";
import { Link } from "wouter";

interface AssetListProps {
  assets: Cryptocurrency[];
  isLoading?: boolean;
  onBuy?: (crypto: Cryptocurrency) => void;
  onSell?: (crypto: Cryptocurrency) => void;
  showActions?: boolean;
}

export function AssetList({ assets, isLoading, onBuy, onSell, showActions = true }: AssetListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
          <CardTitle>Markets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-asset-list">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 pb-4">
        <CardTitle>Markets</CardTitle>
        <Link href="/trade">
          <Button variant="outline" size="sm" data-testid="button-view-all-markets">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="divide-y divide-border">
            {/* Header row */}
            <div className="grid grid-cols-12 gap-2 px-6 py-3 text-xs font-medium text-muted-foreground">
              <div className="col-span-4">Asset</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">24h Change</div>
              <div className="col-span-2 text-right hidden sm:block">Market Cap</div>
              {showActions && <div className="col-span-2 text-right">Actions</div>}
            </div>
            {/* Asset rows */}
            {assets.map((asset) => {
              const isPositive = asset.priceChangePercentage24h >= 0;
              return (
                <div
                  key={asset.id}
                  className="grid grid-cols-12 gap-2 px-6 py-4 items-center hover-elevate"
                  data-testid={`row-asset-${asset.symbol.toLowerCase()}`}
                >
                  <div className="col-span-4 flex items-center gap-3">
                    <CryptoIcon symbol={asset.symbol} size="md" />
                    <div className="min-w-0">
                      <p className="font-medium truncate">{asset.name}</p>
                      <p className="text-sm text-muted-foreground">{asset.symbol}</p>
                    </div>
                  </div>
                  <div className="col-span-2 text-right">
                    <p className="font-medium tabular-nums">
                      {formatCurrency(asset.currentPrice)}
                    </p>
                  </div>
                  <div className="col-span-2 text-right">
                    <div
                      className={`inline-flex items-center gap-1 text-sm font-medium ${
                        isPositive ? "text-emerald-500" : "text-red-500"
                      }`}
                    >
                      {isPositive ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {formatPercentage(asset.priceChangePercentage24h)}
                    </div>
                  </div>
                  <div className="col-span-2 text-right hidden sm:block">
                    <p className="text-sm text-muted-foreground tabular-nums">
                      {formatLargeNumber(asset.marketCap)}
                    </p>
                  </div>
                  {showActions && (
                    <div className="col-span-2 flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-emerald-500"
                        onClick={() => onBuy?.(asset)}
                        data-testid={`button-buy-${asset.symbol.toLowerCase()}`}
                      >
                        Buy
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500"
                        onClick={() => onSell?.(asset)}
                        data-testid={`button-sell-${asset.symbol.toLowerCase()}`}
                      >
                        Sell
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
