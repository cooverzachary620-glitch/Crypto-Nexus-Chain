import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowDownUp, Loader2 } from "lucide-react";
import { CryptoIcon, formatCurrency, formatCryptoAmount } from "@/lib/crypto-icons";
import type { Cryptocurrency, WalletHolding } from "@shared/schema";

interface ConvertWidgetProps {
  cryptos: Cryptocurrency[];
  holdings: WalletHolding[];
  onConvert: (fromCryptoId: string, toCryptoId: string, fromAmount: number) => Promise<void>;
  isLoading?: boolean;
}

export function ConvertWidget({ cryptos, holdings, onConvert, isLoading }: ConvertWidgetProps) {
  const [fromCryptoId, setFromCryptoId] = useState<string>("");
  const [toCryptoId, setToCryptoId] = useState<string>("");
  const [fromAmount, setFromAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fromCrypto = cryptos.find((c) => c.id === fromCryptoId);
  const toCrypto = cryptos.find((c) => c.id === toCryptoId);
  const fromHolding = holdings.find((h) => h.cryptoId === fromCryptoId);

  const numericFromAmount = parseFloat(fromAmount) || 0;
  const exchangeRate = fromCrypto && toCrypto ? fromCrypto.currentPrice / toCrypto.currentPrice : 0;
  const toAmount = numericFromAmount * exchangeRate;
  const fee = toAmount * 0.001; // 0.1% fee
  const finalToAmount = toAmount - fee;

  const maxFromAmount = fromHolding?.amount || 0;
  const canSubmit =
    numericFromAmount > 0 &&
    numericFromAmount <= maxFromAmount &&
    fromCryptoId &&
    toCryptoId &&
    fromCryptoId !== toCryptoId;

  const handleSwap = () => {
    const tempFrom = fromCryptoId;
    setFromCryptoId(toCryptoId);
    setToCryptoId(tempFrom);
    setFromAmount("");
  };

  const handleConvert = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      await onConvert(fromCryptoId, toCryptoId, numericFromAmount);
      setFromAmount("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const setMaxAmount = () => {
    setFromAmount(maxFromAmount.toFixed(8));
  };

  return (
    <Card data-testid="card-convert">
      <CardHeader>
        <CardTitle>Convert Crypto</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* From section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>From</Label>
            {fromHolding && (
              <button
                onClick={setMaxAmount}
                className="text-xs text-muted-foreground hover:text-foreground"
                data-testid="button-convert-max"
              >
                Balance: {formatCryptoAmount(fromHolding.amount)} {fromCrypto?.symbol}
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <Select value={fromCryptoId} onValueChange={setFromCryptoId}>
              <SelectTrigger className="w-[140px]" data-testid="select-from-crypto">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {cryptos.map((crypto) => (
                  <SelectItem key={crypto.id} value={crypto.id}>
                    <div className="flex items-center gap-2">
                      <CryptoIcon symbol={crypto.symbol} size="sm" />
                      <span>{crypto.symbol}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="0.00"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="flex-1"
              data-testid="input-from-amount"
            />
          </div>
        </div>

        {/* Swap button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="icon"
            onClick={handleSwap}
            disabled={!fromCryptoId && !toCryptoId}
            data-testid="button-swap-direction"
          >
            <ArrowDownUp className="h-4 w-4" />
          </Button>
        </div>

        {/* To section */}
        <div className="space-y-2">
          <Label>To</Label>
          <div className="flex gap-2">
            <Select value={toCryptoId} onValueChange={setToCryptoId}>
              <SelectTrigger className="w-[140px]" data-testid="select-to-crypto">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {cryptos.filter((c) => c.id !== fromCryptoId).map((crypto) => (
                  <SelectItem key={crypto.id} value={crypto.id}>
                    <div className="flex items-center gap-2">
                      <CryptoIcon symbol={crypto.symbol} size="sm" />
                      <span>{crypto.symbol}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="0.00"
              value={toAmount > 0 ? toAmount.toFixed(8) : ""}
              disabled
              className="flex-1"
              data-testid="input-to-amount"
            />
          </div>
        </div>

        {/* Exchange rate */}
        {fromCrypto && toCrypto && (
          <div className="rounded-md bg-muted p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Exchange Rate</span>
              <span className="tabular-nums">
                1 {fromCrypto.symbol} = {formatCryptoAmount(exchangeRate)} {toCrypto.symbol}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fee (0.1%)</span>
              <span className="tabular-nums">
                {formatCryptoAmount(fee)} {toCrypto.symbol}
              </span>
            </div>
            <div className="flex justify-between font-medium pt-2 border-t border-border">
              <span>You Receive</span>
              <span className="tabular-nums">
                {formatCryptoAmount(finalToAmount)} {toCrypto.symbol}
              </span>
            </div>
          </div>
        )}

        <Button
          className="w-full"
          size="lg"
          onClick={handleConvert}
          disabled={!canSubmit || isSubmitting}
          data-testid="button-confirm-convert"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Converting...
            </>
          ) : (
            "Convert"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
