import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ConvertWidget } from "@/components/ConvertWidget";
import { CryptoIcon, formatCurrency, formatCryptoAmount } from "@/lib/crypto-icons";
import type { Cryptocurrency, PortfolioSummary } from "@shared/schema";

export default function Convert() {
  const { toast } = useToast();

  const { data: cryptos = [], isLoading: cryptosLoading } = useQuery<Cryptocurrency[]>({
    queryKey: ["/api/cryptocurrencies"],
  });

  const { data: portfolio, isLoading: portfolioLoading } = useQuery<PortfolioSummary>({
    queryKey: ["/api/portfolio"],
  });

  const convertMutation = useMutation({
    mutationFn: async ({ fromCryptoId, toCryptoId, fromAmount }: { fromCryptoId: string; toCryptoId: string; fromAmount: number }) => {
      await apiRequest("POST", "/api/convert", { fromCryptoId, toCryptoId, fromAmount });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["/api/balance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "Conversion Successful",
        description: "Your crypto has been converted.",
      });
    },
    onError: () => {
      toast({
        title: "Conversion Failed",
        description: "There was an error processing your conversion.",
        variant: "destructive",
      });
    },
  });

  const handleConvert = async (fromCryptoId: string, toCryptoId: string, fromAmount: number) => {
    await convertMutation.mutateAsync({ fromCryptoId, toCryptoId, fromAmount });
  };

  const isLoading = cryptosLoading || portfolioLoading;
  const holdings = portfolio?.holdings || [];

  // Get popular trading pairs
  const popularPairs = [
    { from: "BTC", to: "ETH" },
    { from: "ETH", to: "USDT" },
    { from: "BTC", to: "USDT" },
    { from: "SOL", to: "USDT" },
    { from: "BNB", to: "USDT" },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6 p-6" data-testid="page-convert">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">Convert</h1>
            <p className="text-muted-foreground">Swap between cryptocurrencies</p>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6" data-testid="page-convert">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Convert</h1>
          <p className="text-muted-foreground">Swap between cryptocurrencies</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Convert widget */}
        <ConvertWidget
          cryptos={cryptos}
          holdings={holdings}
          onConvert={handleConvert}
        />

        {/* Holdings and popular pairs */}
        <div className="space-y-6">
          {/* Your holdings for quick access */}
          {holdings.length > 0 && (
            <Card data-testid="card-holdings-quick-access">
              <CardHeader>
                <CardTitle>Your Holdings</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {holdings.map((holding) => {
                    const crypto = cryptos.find((c) => c.id === holding.cryptoId);
                    return (
                      <div
                        key={holding.id}
                        className="flex items-center gap-3 px-6 py-3"
                      >
                        <CryptoIcon symbol={holding.symbol} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{holding.name}</p>
                          <p className="text-xs text-muted-foreground">{holding.symbol}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm tabular-nums">
                            {formatCryptoAmount(holding.amount)}
                          </p>
                          <p className="text-xs text-muted-foreground tabular-nums">
                            {formatCurrency(holding.currentValue)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Popular trading pairs */}
          <Card data-testid="card-popular-pairs">
            <CardHeader>
              <CardTitle>Popular Pairs</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {popularPairs.map((pair, index) => {
                  const fromCrypto = cryptos.find((c) => c.symbol === pair.from);
                  const toCrypto = cryptos.find((c) => c.symbol === pair.to);
                  if (!fromCrypto || !toCrypto) return null;

                  const rate = fromCrypto.currentPrice / toCrypto.currentPrice;

                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 px-6 py-3 hover-elevate"
                    >
                      <div className="flex items-center gap-2">
                        <CryptoIcon symbol={pair.from} size="sm" />
                        <span className="font-medium text-sm">{pair.from}</span>
                      </div>
                      <span className="text-muted-foreground">to</span>
                      <div className="flex items-center gap-2">
                        <CryptoIcon symbol={pair.to} size="sm" />
                        <span className="font-medium text-sm">{pair.to}</span>
                      </div>
                      <div className="flex-1 text-right">
                        <p className="text-sm text-muted-foreground tabular-nums">
                          1 {pair.from} = {formatCryptoAmount(rate)} {pair.to}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Empty state for holdings */}
          {holdings.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <CryptoIcon symbol="BTC" size="lg" />
                </div>
                <h3 className="font-medium mb-1">No crypto to convert</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Buy some cryptocurrency first, then you can convert between different coins.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
