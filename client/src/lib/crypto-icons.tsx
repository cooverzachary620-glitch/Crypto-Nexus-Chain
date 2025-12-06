// Crypto icon mapping with colors
export const cryptoIcons: Record<string, { bg: string; text: string }> = {
  BTC: { bg: "bg-orange-500", text: "text-white" },
  ETH: { bg: "bg-indigo-500", text: "text-white" },
  USDT: { bg: "bg-emerald-500", text: "text-white" },
  BNB: { bg: "bg-yellow-500", text: "text-black" },
  SOL: { bg: "bg-gradient-to-br from-purple-500 to-cyan-400", text: "text-white" },
  XRP: { bg: "bg-gray-700", text: "text-white" },
  USDC: { bg: "bg-blue-500", text: "text-white" },
  ADA: { bg: "bg-blue-600", text: "text-white" },
  AVAX: { bg: "bg-red-500", text: "text-white" },
  DOGE: { bg: "bg-amber-400", text: "text-black" },
  DOT: { bg: "bg-pink-500", text: "text-white" },
  MATIC: { bg: "bg-purple-600", text: "text-white" },
  LINK: { bg: "bg-blue-400", text: "text-white" },
  LTC: { bg: "bg-gray-400", text: "text-black" },
  UNI: { bg: "bg-pink-400", text: "text-white" },
};

export function CryptoIcon({ symbol, size = "md" }: { symbol: string; size?: "sm" | "md" | "lg" }) {
  const iconStyle = cryptoIcons[symbol.toUpperCase()] || { bg: "bg-gray-500", text: "text-white" };
  
  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-12 w-12 text-base",
  };

  return (
    <div 
      className={`flex items-center justify-center rounded-full font-bold ${iconStyle.bg} ${iconStyle.text} ${sizeClasses[size]}`}
      data-testid={`icon-crypto-${symbol.toLowerCase()}`}
    >
      {symbol.substring(0, 2).toUpperCase()}
    </div>
  );
}

export function formatCurrency(value: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatCryptoAmount(value: number, decimals: number = 6): string {
  if (value === 0) return "0";
  if (Math.abs(value) < 0.000001) {
    return value.toExponential(2);
  }
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

export function formatPercentage(value: number): string {
  const prefix = value >= 0 ? "+" : "";
  return `${prefix}${value.toFixed(2)}%`;
}

export function formatLargeNumber(value: number): string {
  if (value >= 1e12) {
    return `$${(value / 1e12).toFixed(2)}T`;
  }
  if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(2)}B`;
  }
  if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(2)}M`;
  }
  return formatCurrency(value);
}
