import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CryptoIcon, formatCurrency, formatCryptoAmount } from "@/lib/crypto-icons";
import type { Cryptocurrency, WalletHolding } from "@shared/schema";
import { Loader2 } from "lucide-react";

interface TradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialType: "buy" | "sell";
  selectedCrypto?: Cryptocurrency;
  cryptos: Cryptocurrency[];
  holdings: WalletHolding[];
  usdBalance: number;
  onTrade: (type: "buy" | "sell", cryptoId: string, amount: number) => Promise<void>;
}

export function TradeModal({
  open,
  onOpenChange,
  initialType,
  selectedCrypto,
  cryptos,
  holdings,
  usdBalance,
  onTrade,
}: TradeModalProps) {
  const [type, setType] = useState<"buy" | "sell">(initialType);
  const [selectedCryptoId, setSelectedCryptoId] = useState<string>(selectedCrypto?.id || "");
  const [amount, setAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setType(initialType);
  }, [initialType]);

  useEffect(() => {
    if (selectedCrypto) {
      setSelectedCryptoId(selectedCrypto.id);
    }
  }, [selectedCrypto]);

  useEffect(() => {
    setAmount("");
  }, [type, selectedCryptoId]);

  const currentCrypto = cryptos.find((c) => c.id === selectedCryptoId);
  const currentHolding = holdings.find((h) => h.cryptoId === selectedCryptoId);

  const numericAmount = parseFloat(amount) || 0;
  const totalValue = numericAmount * (currentCrypto?.currentPrice || 0);
  const fee = totalValue * 0.001; // 0.1% fee
  const totalWithFee = type === "buy" ? totalValue + fee : totalValue - fee;

  const maxBuyAmount = currentCrypto 
    ? (usdBalance - fee) / currentCrypto.currentPrice 
    : 0;
  const maxSellAmount = currentHolding?.amount || 0;

  const canSubmit =
    numericAmount > 0 &&
    currentCrypto &&
    ((type === "buy" && totalWithFee <= usdBalance) ||
      (type === "sell" && numericAmount <= maxSellAmount));

  const handleSubmit = async () => {
    if (!canSubmit || !currentCrypto) return;
    setIsSubmitting(true);
    try {
      await onTrade(type, selectedCryptoId, numericAmount);
      onOpenChange(false);
      setAmount("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const setMaxAmount = () => {
    if (type === "buy") {
      setAmount(maxBuyAmount.toFixed(8));
    } else {
      setAmount(maxSellAmount.toFixed(8));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="modal-trade">
        <DialogHeader>
          <DialogTitle>Trade Cryptocurrency</DialogTitle>
        </DialogHeader>

        <Tabs value={type} onValueChange={(v) => setType(v as "buy" | "sell")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy" data-testid="tab-buy">Buy</TabsTrigger>
            <TabsTrigger value="sell" data-testid="tab-sell">Sell</TabsTrigger>
          </TabsList>

          <TabsContent value={type} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Select Cryptocurrency</Label>
              <Select value={selectedCryptoId} onValueChange={setSelectedCryptoId}>
                <SelectTrigger data-testid="select-crypto">
                  <SelectValue placeholder="Select a cryptocurrency" />
                </SelectTrigger>
                <SelectContent>
                  {cryptos.map((crypto) => (
                    <SelectItem key={crypto.id} value={crypto.id}>
                      <div className="flex items-center gap-2">
                        <CryptoIcon symbol={crypto.symbol} size="sm" />
                        <span>{crypto.name}</span>
                        <span className="text-muted-foreground">({crypto.symbol})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {currentCrypto && (
              <>
                <div className="rounded-md bg-muted p-3 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Current Price</span>
                    <span className="font-medium tabular-nums">
                      {formatCurrency(currentCrypto.currentPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {type === "buy" ? "USD Balance" : "Available to Sell"}
                    </span>
                    <span className="font-medium tabular-nums">
                      {type === "buy"
                        ? formatCurrency(usdBalance)
                        : `${formatCryptoAmount(maxSellAmount)} ${currentCrypto.symbol}`}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Amount ({currentCrypto.symbol})</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={setMaxAmount}
                      data-testid="button-max-amount"
                    >
                      Max
                    </Button>
                  </div>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    step="0.00000001"
                    min="0"
                    data-testid="input-amount"
                  />
                </div>

                <div className="rounded-md border p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="tabular-nums">{formatCurrency(totalValue)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Fee (0.1%)</span>
                    <span className="tabular-nums">{formatCurrency(fee)}</span>
                  </div>
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>Total</span>
                    <span className="tabular-nums">{formatCurrency(totalWithFee)}</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={!canSubmit || isSubmitting}
                  data-testid="button-confirm-trade"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {type === "buy" ? "Buy" : "Sell"} {currentCrypto.symbol}
                    </>
                  )}
                </Button>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
