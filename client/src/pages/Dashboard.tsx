import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PriceChart } from "@/components/PriceChart";
import { PortfolioStats } from "@/components/PortfolioStats";
import { AssetList } from "@/components/AssetList";
import { TradeModal } from "@/components/TradeModal";
import type { Cryptocurrency, WalletHolding, PortfolioSummary } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
  const [selectedCrypto, setSelectedCrypto] = useState<Cryptocurrency | undefined>();

  const { data: cryptos = [], isLoading: cryptosLoading } = useQuery<Cryptocurrency[]>({
    queryKey: ["/api/cryptocurrencies"],
  });

  const { data: portfolio, isLoading: portfolioLoading } = useQuery<PortfolioSummary>({
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

  // Get the featured crypto for the chart (BTC or first available)
  const featuredCrypto = cryptos.find((c) => c.symbol === "BTC") || cryptos[0];

  return (
    <div className="space-y-6 p-6" data-testid="page-dashboard">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your crypto portfolio</p>
        </div>
      </div>

      <PortfolioStats
        totalValue={portfolio?.totalValue || 0}
        totalCost={portfolio?.totalCost || 0}
        totalGainLoss={portfolio?.totalGainLoss || 0}
        totalGainLossPercentage={portfolio?.totalGainLossPercentage || 0}
        holdingsCount={portfolio?.holdings.length || 0}
        isLoading={portfolioLoading}
      />

      {featuredCrypto && (
        <PriceChart
          symbol={featuredCrypto.symbol}
          name={featuredCrypto.name}
          currentPrice={featuredCrypto.currentPrice}
          priceChange24h={featuredCrypto.priceChange24h}
          priceChangePercentage24h={featuredCrypto.priceChangePercentage24h}
          isLoading={cryptosLoading}
        />
      )}

      <AssetList
        assets={cryptos.slice(0, 10)}
        isLoading={cryptosLoading}
        onBuy={handleBuy}
        onSell={handleSell}
      />

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
