import { sql } from 'drizzle-orm';
import { pgTable, text, varchar, real, timestamp, boolean, index, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// USD Balance per user
export const usdBalances = pgTable("usd_balances", {
  userId: varchar("user_id").primaryKey().references(() => users.id),
  balance: real("balance").notNull().default(10000),
});

export type UsdBalance = typeof usdBalances.$inferSelect;

// Cryptocurrency definitions (shared/cached data)
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
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCryptoSchema = createInsertSchema(cryptocurrencies);
export type InsertCrypto = z.infer<typeof insertCryptoSchema>;
export type Cryptocurrency = typeof cryptocurrencies.$inferSelect;

// Wallet holdings (per user)
export const walletHoldings = pgTable("wallet_holdings", {
  id: varchar("id", { length: 50 }).primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  cryptoId: varchar("crypto_id", { length: 50 }).notNull(),
  symbol: varchar("symbol", { length: 20 }).notNull(),
  name: text("name").notNull(),
  amount: real("amount").notNull(),
  averageBuyPrice: real("average_buy_price").notNull(),
});

export const insertWalletHoldingSchema = createInsertSchema(walletHoldings).omit({ id: true });
export type InsertWalletHolding = z.infer<typeof insertWalletHoldingSchema>;
export type WalletHolding = typeof walletHoldings.$inferSelect;

// Transactions (per user)
export const transactions = pgTable("transactions", {
  id: varchar("id", { length: 50 }).primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type", { length: 20 }).notNull(),
  fromCryptoId: varchar("from_crypto_id", { length: 50 }),
  fromSymbol: varchar("from_symbol", { length: 20 }),
  fromAmount: real("from_amount"),
  toCryptoId: varchar("to_crypto_id", { length: 50 }),
  toSymbol: varchar("to_symbol", { length: 20 }),
  toAmount: real("to_amount"),
  priceAtTransaction: real("price_at_transaction").notNull(),
  totalValue: real("total_value").notNull(),
  fee: real("fee").notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  timestamp: timestamp("timestamp").notNull(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true });
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

// User settings (per user)
export const userSettings = pgTable("user_settings", {
  userId: varchar("user_id").primaryKey().references(() => users.id),
  currency: varchar("currency", { length: 10 }).notNull().default("USD"),
  theme: varchar("theme", { length: 20 }).notNull().default("dark"),
  priceAlerts: boolean("price_alerts").notNull().default(true),
  transactionNotifications: boolean("transaction_notifications").notNull().default(true),
  marketUpdates: boolean("market_updates").notNull().default(false),
  twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
});

export const insertSettingsSchema = createInsertSchema(userSettings);
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type UserSettings = typeof userSettings.$inferSelect;

// Price alerts (per user)
export const priceAlerts = pgTable("price_alerts", {
  id: varchar("id", { length: 50 }).primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  cryptoId: varchar("crypto_id", { length: 50 }).notNull(),
  symbol: varchar("symbol", { length: 20 }).notNull(),
  targetPrice: real("target_price").notNull(),
  condition: varchar("condition", { length: 10 }).notNull(), // 'above' or 'below'
  isActive: boolean("is_active").notNull().default(true),
  triggered: boolean("triggered").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPriceAlertSchema = createInsertSchema(priceAlerts).omit({ id: true });
export type InsertPriceAlert = z.infer<typeof insertPriceAlertSchema>;
export type PriceAlert = typeof priceAlerts.$inferSelect;

// Limit orders (per user)
export const limitOrders = pgTable("limit_orders", {
  id: varchar("id", { length: 50 }).primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  cryptoId: varchar("crypto_id", { length: 50 }).notNull(),
  symbol: varchar("symbol", { length: 20 }).notNull(),
  type: varchar("type", { length: 10 }).notNull(), // 'buy' or 'sell'
  orderType: varchar("order_type", { length: 20 }).notNull(), // 'limit', 'stop_loss'
  amount: real("amount").notNull(),
  targetPrice: real("target_price").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // 'pending', 'executed', 'cancelled'
  createdAt: timestamp("created_at").defaultNow(),
  executedAt: timestamp("executed_at"),
});

export const insertLimitOrderSchema = createInsertSchema(limitOrders).omit({ id: true });
export type InsertLimitOrder = z.infer<typeof insertLimitOrderSchema>;
export type LimitOrder = typeof limitOrders.$inferSelect;

// Price history for charts
export interface PricePoint {
  timestamp: number;
  price: number;
}

export interface PriceHistory {
  cryptoId: string;
  interval: string;
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
