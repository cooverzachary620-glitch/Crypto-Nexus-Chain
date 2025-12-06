import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { CryptoIcon, formatCurrency, formatPercentage, formatLargeNumber, formatCryptoAmount } from "@/lib/crypto-icons";
import { TradeModal } from "@/components/TradeModal";
import type { Cryptocurrency, PortfolioSummary } from "@shared/schema";

export default function Trade() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
  const [selectedCrypto, setSelectedCrypto] = useState<Cryptocurrency | undefined>();

  const { data: cryptos = [], isLoading: cryptosLoading } = useQuery<Cryptocurrency[]>({
    queryKey: ["/api/cryptocurrencies"],
  });

  const { data: portfolio } = useQuery<PortfolioSummary>({
    queryKey: ["/api/portfolio"],
  });

  const { data: usdBalance = 10000 } = useQuery<number>({
    queryKey: ["/api/balance"],
  });

  const tradeMutation = useMutation({
    mutationFn: async ({ type, cryptoId, amount }: { type: "buy" | "sell"; cryptoId: string; amount: number }) => {
      await apiRequest("POST", "/api/trade", { type, cryptoId, amount });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["/api/balance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "Trade Successful",
        description: "Your trade has been completed.",
      });
    },
    onError: () => {
      toast({
        title: "Trade Failed",
        description: "There was an error processing your trade.",
        variant: "destructive",
      });
    },
  });

  const filteredCryptos = cryptos.filter(
    (crypto) =>
      crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const gainers = [...cryptos]
    .filter((c) => c.priceChangePercentage24h > 0)
    .sort((a, b) => b.priceChangePercentage24h - a.priceChangePercentage24h)
    .slice(0, 5);

  const losers = [...cryptos]
    .filter((c) => c.priceChangePercentage24h < 0)
    .sort((a, b) => a.priceChangePercentage24h - b.priceChangePercentage24h)
    .slice(0, 5);

  const handleBuy = (crypto: Cryptocurrency) => {
    setSelectedCrypto(crypto);
    setTradeType("buy");
    setTradeModalOpen(true);
  };

  const handleSell = (crypto: Cryptocurrency) => {
    setSelectedCrypto(crypto);
    setTradeType("sell");
    setTradeModalOpen(true);
  };

  const handleTrade = async (type: "buy" | "sell", cryptoId: string, amount: number) => {
    await tradeMutation.mutateAsync({ type, cryptoId, amount });
  };

  if (cryptosLoading) {
    return (
      <div className="space-y-6 p-6" data-testid="page-trade">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">Trade</h1>
            <p className="text-muted-foreground">Buy and sell cryptocurrencies</p>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6" data-testid="page-trade">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Trade</h1>
          <p className="text-muted-foreground">Buy and sell cryptocurrencies</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Available:</span>
          <span className="font-medium tabular-nums" data-testid="text-available-balance">
            {formatCurrency(usdBalance)}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main trading list */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 pb-4">
              <CardTitle>All Cryptocurrencies</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-[200px] pl-9"
                  data-testid="input-search-crypto"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <div className="divide-y divide-border">
                  {/* Header row */}
                  <div className="grid grid-cols-12 gap-2 px-6 py-3 text-xs font-medium text-muted-foreground sticky top-0 bg-card z-10">
                    <div className="col-span-4">Asset</div>
                    <div className="col-span-2 text-right">Price</div>
                    <div className="col-span-2 text-right">24h Change</div>
                    <div className="col-span-2 text-right hidden sm:block">Volume</div>
                    <div className="col-span-2 text-right">Actions</div>
                  </div>
                  {/* Asset rows */}
                  {filteredCryptos.map((crypto) => {
                    const isPositive = crypto.priceChangePercentage24h >= 0;
                    return (
                      <div
                        key={crypto.id}
                        className="grid grid-cols-12 gap-2 px-6 py-4 items-center hover-elevate"
                        data-testid={`row-trade-${crypto.symbol.toLowerCase()}`}
                      >
                        <div className="col-span-4 flex items-center gap-3">
                          <CryptoIcon symbol={crypto.symbol} size="md" />
                          <div className="min-w-0">
                            <p className="font-medium truncate">{crypto.name}</p>
                            <p className="text-sm text-muted-foreground">{crypto.symbol}</p>
                          </div>
                        </div>
                        <div className="col-span-2 text-right">
                          <p className="font-medium tabular-nums">{formatCurrency(crypto.currentPrice)}</p>
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
                            {formatPercentage(crypto.priceChangePercentage24h)}
                          </div>
                        </div>
                        <div className="col-span-2 text-right hidden sm:block">
                          <p className="text-sm text-muted-foreground tabular-nums">
                            {formatLargeNumber(crypto.volume24h)}
                          </p>
                        </div>
                        <div className="col-span-2 flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-emerald-500"
                            onClick={() => handleBuy(crypto)}
                            data-testid={`button-buy-${crypto.symbol.toLowerCase()}`}
                          >
                            Buy
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500"
                            onClick={() => handleSell(crypto)}
                            data-testid={`button-sell-${crypto.symbol.toLowerCase()}`}
                          >
                            Sell
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Market movers sidebar */}
        <div className="space-y-6">
          <Tabs defaultValue="gainers">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="gainers" data-testid="tab-gainers">
                <TrendingUp className="h-4 w-4 mr-2 text-emerald-500" />
                Gainers
              </TabsTrigger>
              <TabsTrigger value="losers" data-testid="tab-losers">
                <TrendingDown className="h-4 w-4 mr-2 text-red-500" />
                Losers
              </TabsTrigger>
            </TabsList>
            <TabsContent value="gainers" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {gainers.map((crypto) => (
                      <div
                        key={crypto.id}
                        className="flex items-center gap-3 p-4 hover-elevate cursor-pointer"
                        onClick={() => handleBuy(crypto)}
                      >
                        <CryptoIcon symbol={crypto.symbol} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{crypto.name}</p>
                          <p className="text-xs text-muted-foreground">{crypto.symbol}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm tabular-nums">
                            {formatCurrency(crypto.currentPrice)}
                          </p>
                          <p className="text-xs text-emerald-500 tabular-nums">
                            {formatPercentage(crypto.priceChangePercentage24h)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="losers" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {losers.map((crypto) => (
                      <div
                        key={crypto.id}
                        className="flex items-center gap-3 p-4 hover-elevate cursor-pointer"
                        onClick={() => handleBuy(crypto)}
                      >
                        <CryptoIcon symbol={crypto.symbol} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{crypto.name}</p>
                          <p className="text-xs text-muted-foreground">{crypto.symbol}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm tabular-nums">
                            {formatCurrency(crypto.currentPrice)}
                          </p>
                          <p className="text-xs text-red-500 tabular-nums">
                            {formatPercentage(crypto.priceChangePercentage24h)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <TradeModal
        open={tradeModalOpen}
        onOpenChange={setTradeModalOpen}
        initialType={tradeType}
        selectedCrypto={selectedCrypto}
        cryptos={cryptos}
        holdings={portfolio?.holdings || []}
        usdBalance={usdBalance}
        onTrade={handleTrade}
      />
    </div>
  );
}
