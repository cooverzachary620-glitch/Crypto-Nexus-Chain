import { pgTable, text, varchar, real, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Cryptocurrency definitions
export const cryptocurrencies = pgTable("cryptocurrencies", {
  id: varchar("id", { length: 50 }).primaryKey(),
  symbol: varchar("symbol", { length: 20 }).notNull(),
  name: text("name").notNull(),
  currentPrice: real("current_price").notNull(),
  priceChange24h: real("price_change_24h").notNull(),
  priceChangePercentage24h: real("price_change_percentage_24h").notNull(),
  marketCap: real("market_cap").notNull(),
  volume24h: real("volume_24h").notNull(),
  high24h: real("high_24h").notNull(),
  low24h: real("low_24h").notNull(),
  image: text("image"),
});

export const insertCryptoSchema = createInsertSchema(cryptocurrencies);
export type InsertCrypto = z.infer<typeof insertCryptoSchema>;
export type Cryptocurrency = typeof cryptocurrencies.$inferSelect;

// Wallet holdings
export const walletHoldings = pgTable("wallet_holdings", {
  id: varchar("id", { length: 50 }).primaryKey(),
  cryptoId: varchar("crypto_id", { length: 50 }).notNull(),
  symbol: varchar("symbol", { length: 20 }).notNull(),
  name: text("name").notNull(),
  amount: real("amount").notNull(),
  averageBuyPrice: real("average_buy_price").notNull(),
});

export const insertWalletHoldingSchema = createInsertSchema(walletHoldings).omit({ id: true });
export type InsertWalletHolding = z.infer<typeof insertWalletHoldingSchema>;
export type WalletHolding = typeof walletHoldings.$inferSelect;

// Transactions
export const transactions = pgTable("transactions", {
  id: varchar("id", { length: 50 }).primaryKey(),
  type: varchar("type", { length: 20 }).notNull(), // 'buy', 'sell', 'convert'
  fromCryptoId: varchar("from_crypto_id", { length: 50 }),
  fromSymbol: varchar("from_symbol", { length: 20 }),
  fromAmount: real("from_amount"),
  toCryptoId: varchar("to_crypto_id", { length: 50 }),
  toSymbol: varchar("to_symbol", { length: 20 }),
  toAmount: real("to_amount"),
  priceAtTransaction: real("price_at_transaction").notNull(),
  totalValue: real("total_value").notNull(),
  fee: real("fee").notNull(),
  status: varchar("status", { length: 20 }).notNull(), // 'completed', 'pending', 'failed'
  timestamp: timestamp("timestamp").notNull(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true });
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

// User settings
export const userSettings = pgTable("user_settings", {
  id: varchar("id", { length: 50 }).primaryKey(),
  currency: varchar("currency", { length: 10 }).notNull().default("USD"),
  theme: varchar("theme", { length: 20 }).notNull().default("dark"),
  priceAlerts: boolean("price_alerts").notNull().default(true),
  transactionNotifications: boolean("transaction_notifications").notNull().default(true),
  marketUpdates: boolean("market_updates").notNull().default(false),
  twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
});

export const insertSettingsSchema = createInsertSchema(userSettings).omit({ id: true });
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type UserSettings = typeof userSettings.$inferSelect;

// Price history for charts
export interface PricePoint {
  timestamp: number;
  price: number;
}

export interface PriceHistory {
  cryptoId: string;
  interval: string; // '1H', '24H', '7D', '30D', '1Y'
  data: PricePoint[];
}

// Portfolio summary type
export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  holdings: (WalletHolding & { currentValue: number; gainLoss: number; gainLossPercentage: number })[];
}

// Trade request types
export interface TradeRequest {
  cryptoId: string;
  amount: number;
  type: 'buy' | 'sell';
}

export interface ConvertRequest {
  fromCryptoId: string;
  toCryptoId: string;
  fromAmount: number;
}

// Users table (keeping from original)
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
