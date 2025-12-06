import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpRight, ArrowDownLeft, RefreshCw, Search, Filter } from "lucide-react";
import { CryptoIcon, formatCurrency, formatCryptoAmount } from "@/lib/crypto-icons";
import type { Transaction } from "@shared/schema";

interface TransactionHistoryProps {
  transactions: Transaction[];
  isLoading?: boolean;
  showFilters?: boolean;
}

export function TransactionHistory({
  transactions,
  isLoading,
  showFilters = true,
}: TransactionHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filteredTransactions = transactions.filter((tx) => {
    const matchesType = typeFilter === "all" || tx.type === typeFilter;
    const matchesSearch =
      !searchQuery ||
      tx.fromSymbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.toSymbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "buy":
        return <ArrowDownLeft className="h-4 w-4 text-emerald-500" />;
      case "sell":
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case "convert":
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      buy: "default",
      sell: "destructive",
      convert: "secondary",
    };
    return (
      <Badge variant={variants[type] || "outline"} className="capitalize">
        {type}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: "default",
      pending: "secondary",
      failed: "destructive",
    };
    return (
      <Badge variant={variants[status] || "outline"} className="capitalize">
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
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
    );
  }

  return (
    <Card data-testid="card-transaction-history">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
        <CardTitle>Transaction History</CardTitle>
        {showFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[150px] pl-9"
                data-testid="input-search-transactions"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[120px]" data-testid="select-type-filter">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="buy">Buy</SelectItem>
                <SelectItem value="sell">Sell</SelectItem>
                <SelectItem value="convert">Convert</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-6">
            <div className="rounded-full bg-muted p-4 mb-4">
              <RefreshCw className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-1">No transactions yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Your transaction history will appear here once you start trading.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[500px]">
            <div className="divide-y divide-border">
              {filteredTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center gap-4 p-4 hover-elevate"
                  data-testid={`row-transaction-${tx.id}`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    {getTypeIcon(tx.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getTypeBadge(tx.type)}
                      {tx.type === "convert" ? (
                        <span className="text-sm font-medium">
                          {tx.fromSymbol} to {tx.toSymbol}
                        </span>
                      ) : (
                        <span className="text-sm font-medium">{tx.toSymbol || tx.fromSymbol}</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(tx.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium tabular-nums">
                      {tx.type === "convert"
                        ? `${formatCryptoAmount(tx.fromAmount || 0)} ${tx.fromSymbol}`
                        : formatCurrency(tx.totalValue)}
                    </p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {tx.type === "convert"
                        ? `${formatCryptoAmount(tx.toAmount || 0)} ${tx.toSymbol}`
                        : `${formatCryptoAmount(tx.toAmount || tx.fromAmount || 0)} ${tx.toSymbol || tx.fromSymbol}`}
                    </p>
                  </div>
                  <div>{getStatusBadge(tx.status)}</div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
