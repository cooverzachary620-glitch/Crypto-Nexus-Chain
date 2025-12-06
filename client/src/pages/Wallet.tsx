import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowUpRight, ArrowDownLeft, RefreshCw, Wallet as WalletIcon, TrendingUp, TrendingDown } from "lucide-react";
import { CryptoIcon, formatCurrency, formatCryptoAmount, formatPercentage } from "@/lib/crypto-icons";
import { Link } from "wouter";
import type { PortfolioSummary } from "@shared/schema";

export default function Wallet() {
  const { data: portfolio, isLoading } = useQuery<PortfolioSummary>({
    queryKey: ["/api/portfolio"],
  });

  const { data: usdBalance = 10000, isLoading: balanceLoading } = useQuery<number>({
    queryKey: ["/api/balance"],
  });

  if (isLoading || balanceLoading) {
    return (
      <div className="space-y-6 p-6" data-testid="page-wallet">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">Wallet</h1>
            <p className="text-muted-foreground">Manage your crypto holdings</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const holdings = portfolio?.holdings || [];
  const hasHoldings = holdings.length > 0;

  return (
    <div className="space-y-6 p-6" data-testid="page-wallet">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Wallet</h1>
          <p className="text-muted-foreground">Manage your crypto holdings</p>
        </div>
        <div className="flex gap-2">
          <Link href="/trade">
            <Button data-testid="button-go-to-trade">
              <ArrowDownLeft className="h-4 w-4 mr-2" />
              Trade
            </Button>
          </Link>
          <Link href="/convert">
            <Button variant="outline" data-testid="button-go-to-convert">
              <RefreshCw className="h-4 w-4 mr-2" />
              Convert
            </Button>
          </Link>
        </div>
      </div>

      {/* USD Balance Card */}
      <Card data-testid="card-usd-balance">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
              <WalletIcon className="h-7 w-7 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Available USD Balance</p>
              <p className="text-3xl font-bold tabular-nums" data-testid="text-usd-balance">
                {formatCurrency(usdBalance)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Summary */}
      {hasHoldings && (
        <Card data-testid="card-portfolio-summary">
          <CardHeader>
            <CardTitle>Portfolio Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold tabular-nums">
                  {formatCurrency(portfolio?.totalValue || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Invested</p>
                <p className="text-2xl font-bold tabular-nums">
                  {formatCurrency(portfolio?.totalCost || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Gain/Loss</p>
                <p
                  className={`text-2xl font-bold tabular-nums flex items-center gap-2 ${
                    (portfolio?.totalGainLoss || 0) >= 0 ? "text-emerald-500" : "text-red-500"
                  }`}
                >
                  {(portfolio?.totalGainLoss || 0) >= 0 ? (
                    <TrendingUp className="h-5 w-5" />
                  ) : (
                    <TrendingDown className="h-5 w-5" />
                  )}
                  {formatCurrency(Math.abs(portfolio?.totalGainLoss || 0))}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Return</p>
                <p
                  className={`text-2xl font-bold tabular-nums ${
                    (portfolio?.totalGainLossPercentage || 0) >= 0 ? "text-emerald-500" : "text-red-500"
                  }`}
                >
                  {formatPercentage(portfolio?.totalGainLossPercentage || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Holdings Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Your Holdings</h2>
        {!hasHoldings ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <WalletIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-1">No holdings yet</h3>
              <p className="text-sm text-muted-foreground max-w-xs mb-4">
                Start building your portfolio by purchasing some cryptocurrency.
              </p>
              <Link href="/trade">
                <Button data-testid="button-start-trading">Start Trading</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {holdings.map((holding) => {
              const isPositive = holding.gainLossPercentage >= 0;
              const portfolioPercentage =
                ((holding.currentValue / (portfolio?.totalValue || 1)) * 100).toFixed(1);

              return (
                <Card key={holding.id} className="overflow-visible" data-testid={`card-holding-${holding.symbol.toLowerCase()}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <CryptoIcon symbol={holding.symbol} size="lg" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{holding.name}</p>
                        <p className="text-sm text-muted-foreground">{holding.symbol}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Portfolio</p>
                        <p className="text-sm font-medium">{portfolioPercentage}%</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Balance</p>
                        <p className="text-xl font-bold tabular-nums">
                          {formatCryptoAmount(holding.amount)} {holding.symbol}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Value</p>
                          <p className="font-medium tabular-nums">
                            {formatCurrency(holding.currentValue)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Gain/Loss</p>
                          <p
                            className={`font-medium tabular-nums flex items-center gap-1 justify-end ${
                              isPositive ? "text-emerald-500" : "text-red-500"
                            }`}
                          >
                            {isPositive ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            {formatPercentage(holding.gainLossPercentage)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Link href="/trade" className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          Trade
                        </Button>
                      </Link>
                      <Link href="/convert" className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          Convert
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
