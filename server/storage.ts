import { 
  type User, 
  type UpsertUser,
  type Cryptocurrency, 
  type WalletHolding, 
  type Transaction, 
  type UserSettings,
  type PortfolioSummary,
  type InsertTransaction,
  type PriceAlert,
  type InsertPriceAlert,
  type LimitOrder,
  type InsertLimitOrder,
  users,
  usdBalances,
  cryptocurrencies,
  walletHoldings,
  transactions,
  userSettings,
  priceAlerts,
  limitOrders
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Cryptocurrencies
  getAllCryptos(): Promise<Cryptocurrency[]>;
  getCrypto(id: string): Promise<Cryptocurrency | undefined>;
  upsertCrypto(crypto: Cryptocurrency): Promise<void>;
  
  // Wallet & Portfolio (per user)
  getWalletHoldings(userId: string): Promise<WalletHolding[]>;
  getWalletHolding(userId: string, cryptoId: string): Promise<WalletHolding | undefined>;
  updateHolding(userId: string, cryptoId: string, amount: number, avgPrice: number): Promise<WalletHolding>;
  removeHolding(userId: string, cryptoId: string): Promise<void>;
  getPortfolio(userId: string): Promise<PortfolioSummary>;
  
  // USD Balance (per user)
  getUsdBalance(userId: string): Promise<number>;
  updateUsdBalance(userId: string, amount: number): Promise<number>;
  
  // Transactions (per user)
  getAllTransactions(userId: string): Promise<Transaction[]>;
  createTransaction(tx: InsertTransaction): Promise<Transaction>;
  
  // Settings (per user)
  getSettings(userId: string): Promise<UserSettings>;
  updateSettings(userId: string, settings: Partial<UserSettings>): Promise<UserSettings>;
  
  // Price Alerts (per user)
  getPriceAlerts(userId: string): Promise<PriceAlert[]>;
  createPriceAlert(alert: InsertPriceAlert): Promise<PriceAlert>;
  deletePriceAlert(userId: string, alertId: string): Promise<void>;
  updatePriceAlert(alertId: string, updates: Partial<PriceAlert>): Promise<void>;
  
  // Limit Orders (per user)
  getLimitOrders(userId: string): Promise<LimitOrder[]>;
  createLimitOrder(order: InsertLimitOrder): Promise<LimitOrder>;
  cancelLimitOrder(userId: string, orderId: string): Promise<void>;
  executeLimitOrder(orderId: string): Promise<void>;
}

// Mock cryptocurrency data for initial seeding
const mockCryptos: Cryptocurrency[] = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin", currentPrice: 43250.82, priceChange24h: 1250.50, priceChangePercentage24h: 2.98, marketCap: 847000000000, volume24h: 28500000000, high24h: 43850.00, low24h: 41950.00, image: null, updatedAt: new Date() },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", currentPrice: 2285.45, priceChange24h: -45.20, priceChangePercentage24h: -1.94, marketCap: 274500000000, volume24h: 15200000000, high24h: 2350.00, low24h: 2245.00, image: null, updatedAt: new Date() },
  { id: "tether", symbol: "USDT", name: "Tether", currentPrice: 1.00, priceChange24h: 0.001, priceChangePercentage24h: 0.01, marketCap: 91000000000, volume24h: 52000000000, high24h: 1.001, low24h: 0.999, image: null, updatedAt: new Date() },
  { id: "binancecoin", symbol: "BNB", name: "BNB", currentPrice: 312.75, priceChange24h: 8.25, priceChangePercentage24h: 2.71, marketCap: 48200000000, volume24h: 1250000000, high24h: 318.00, low24h: 302.50, image: null, updatedAt: new Date() },
  { id: "solana", symbol: "SOL", name: "Solana", currentPrice: 98.42, priceChange24h: 5.85, priceChangePercentage24h: 6.32, marketCap: 42500000000, volume24h: 2850000000, high24h: 102.50, low24h: 91.20, image: null, updatedAt: new Date() },
  { id: "ripple", symbol: "XRP", name: "XRP", currentPrice: 0.62, priceChange24h: -0.02, priceChangePercentage24h: -3.12, marketCap: 33800000000, volume24h: 1450000000, high24h: 0.65, low24h: 0.60, image: null, updatedAt: new Date() },
  { id: "usd-coin", symbol: "USDC", name: "USD Coin", currentPrice: 1.00, priceChange24h: 0.0005, priceChangePercentage24h: 0.05, marketCap: 24500000000, volume24h: 5200000000, high24h: 1.002, low24h: 0.998, image: null, updatedAt: new Date() },
  { id: "cardano", symbol: "ADA", name: "Cardano", currentPrice: 0.58, priceChange24h: 0.03, priceChangePercentage24h: 5.45, marketCap: 20500000000, volume24h: 685000000, high24h: 0.60, low24h: 0.54, image: null, updatedAt: new Date() },
  { id: "avalanche-2", symbol: "AVAX", name: "Avalanche", currentPrice: 35.82, priceChange24h: -1.25, priceChangePercentage24h: -3.37, marketCap: 13200000000, volume24h: 520000000, high24h: 37.50, low24h: 34.80, image: null, updatedAt: new Date() },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin", currentPrice: 0.082, priceChange24h: 0.005, priceChangePercentage24h: 6.49, marketCap: 11700000000, volume24h: 890000000, high24h: 0.088, low24h: 0.076, image: null, updatedAt: new Date() },
  { id: "polkadot", symbol: "DOT", name: "Polkadot", currentPrice: 7.25, priceChange24h: 0.18, priceChangePercentage24h: 2.55, marketCap: 9200000000, volume24h: 285000000, high24h: 7.45, low24h: 7.02, image: null, updatedAt: new Date() },
  { id: "matic-network", symbol: "MATIC", name: "Polygon", currentPrice: 0.85, priceChange24h: -0.03, priceChangePercentage24h: -3.41, marketCap: 7900000000, volume24h: 425000000, high24h: 0.89, low24h: 0.82, image: null, updatedAt: new Date() },
  { id: "chainlink", symbol: "LINK", name: "Chainlink", currentPrice: 14.52, priceChange24h: 0.42, priceChangePercentage24h: 2.98, marketCap: 8100000000, volume24h: 385000000, high24h: 14.85, low24h: 13.95, image: null, updatedAt: new Date() },
  { id: "litecoin", symbol: "LTC", name: "Litecoin", currentPrice: 72.45, priceChange24h: -2.15, priceChangePercentage24h: -2.88, marketCap: 5350000000, volume24h: 425000000, high24h: 75.20, low24h: 71.50, image: null, updatedAt: new Date() },
  { id: "uniswap", symbol: "UNI", name: "Uniswap", currentPrice: 6.28, priceChange24h: 0.15, priceChangePercentage24h: 2.45, marketCap: 4750000000, volume24h: 185000000, high24h: 6.45, low24h: 6.08, image: null, updatedAt: new Date() },
];

export class DatabaseStorage implements IStorage {
  private cryptoCache: Map<string, Cryptocurrency> = new Map();
  private lastCacheUpdate: number = 0;
  private cacheLifetime = 30000; // 30 seconds

  constructor() {
    this.initializeCryptos();
  }

  private async initializeCryptos() {
    try {
      const existing = await db.select().from(cryptocurrencies);
      if (existing.length === 0) {
        for (const crypto of mockCryptos) {
          await db.insert(cryptocurrencies).values(crypto).onConflictDoNothing();
        }
      }
      await this.refreshCryptoCache();
    } catch (error) {
      console.error("Failed to initialize cryptos:", error);
      // Fallback to mock data in cache
      mockCryptos.forEach(c => this.cryptoCache.set(c.id, c));
    }
  }

  private async refreshCryptoCache() {
    const now = Date.now();
    if (now - this.lastCacheUpdate < this.cacheLifetime && this.cryptoCache.size > 0) {
      return;
    }
    
    try {
      const cryptos = await db.select().from(cryptocurrencies);
      this.cryptoCache.clear();
      cryptos.forEach(c => this.cryptoCache.set(c.id, c));
      this.lastCacheUpdate = now;
    } catch (error) {
      console.error("Failed to refresh crypto cache:", error);
    }
  }

  // Users (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    
    // Initialize user's USD balance if not exists
    await db.insert(usdBalances).values({ userId: user.id, balance: 10000 }).onConflictDoNothing();
    
    return user;
  }

  // Cryptocurrencies
  async getAllCryptos(): Promise<Cryptocurrency[]> {
    await this.refreshCryptoCache();
    return Array.from(this.cryptoCache.values());
  }

  async getCrypto(id: string): Promise<Cryptocurrency | undefined> {
    await this.refreshCryptoCache();
    return this.cryptoCache.get(id);
  }

  async upsertCrypto(crypto: Cryptocurrency): Promise<void> {
    await db.insert(cryptocurrencies).values(crypto).onConflictDoUpdate({
      target: cryptocurrencies.id,
      set: { ...crypto, updatedAt: new Date() },
    });
    this.cryptoCache.set(crypto.id, crypto);
  }

  // Wallet Holdings
  async getWalletHoldings(userId: string): Promise<WalletHolding[]> {
    return await db.select().from(walletHoldings).where(eq(walletHoldings.userId, userId));
  }

  async getWalletHolding(userId: string, cryptoId: string): Promise<WalletHolding | undefined> {
    const [holding] = await db.select().from(walletHoldings)
      .where(and(eq(walletHoldings.userId, userId), eq(walletHoldings.cryptoId, cryptoId)));
    return holding;
  }

  async updateHolding(userId: string, cryptoId: string, amount: number, avgPrice: number): Promise<WalletHolding> {
    const crypto = await this.getCrypto(cryptoId);
    if (!crypto) {
      throw new Error("Cryptocurrency not found");
    }

    const existing = await this.getWalletHolding(userId, cryptoId);
    
    if (existing) {
      const totalAmount = existing.amount + amount;
      const newAvgPrice = amount > 0 
        ? ((existing.amount * existing.averageBuyPrice) + (amount * avgPrice)) / totalAmount
        : existing.averageBuyPrice;
      
      if (totalAmount <= 0) {
        await db.delete(walletHoldings).where(eq(walletHoldings.id, existing.id));
        return { ...existing, amount: 0 };
      }
      
      const [updated] = await db.update(walletHoldings)
        .set({ amount: totalAmount, averageBuyPrice: newAvgPrice })
        .where(eq(walletHoldings.id, existing.id))
        .returning();
      return updated;
    } else {
      const [newHolding] = await db.insert(walletHoldings).values({
        id: randomUUID(),
        userId,
        cryptoId,
        symbol: crypto.symbol,
        name: crypto.name,
        amount,
        averageBuyPrice: avgPrice,
      }).returning();
      return newHolding;
    }
  }

  async removeHolding(userId: string, cryptoId: string): Promise<void> {
    await db.delete(walletHoldings)
      .where(and(eq(walletHoldings.userId, userId), eq(walletHoldings.cryptoId, cryptoId)));
  }

  async getPortfolio(userId: string): Promise<PortfolioSummary> {
    const holdings = await this.getWalletHoldings(userId);
    
    let totalValue = 0;
    let totalCost = 0;
    
    const enrichedHoldings = await Promise.all(
      holdings.map(async (holding) => {
        const crypto = await this.getCrypto(holding.cryptoId);
        const currentPrice = crypto?.currentPrice || 0;
        const currentValue = holding.amount * currentPrice;
        const cost = holding.amount * holding.averageBuyPrice;
        const gainLoss = currentValue - cost;
        const gainLossPercentage = cost > 0 ? (gainLoss / cost) * 100 : 0;
        
        totalValue += currentValue;
        totalCost += cost;
        
        return {
          ...holding,
          currentValue,
          gainLoss,
          gainLossPercentage,
        };
      })
    );
    
    const totalGainLoss = totalValue - totalCost;
    const totalGainLossPercentage = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;
    
    return {
      totalValue,
      totalCost,
      totalGainLoss,
      totalGainLossPercentage,
      holdings: enrichedHoldings,
    };
  }

  // USD Balance
  async getUsdBalance(userId: string): Promise<number> {
    const [balance] = await db.select().from(usdBalances).where(eq(usdBalances.userId, userId));
    if (!balance) {
      // Create default balance
      await db.insert(usdBalances).values({ userId, balance: 10000 });
      return 10000;
    }
    return balance.balance;
  }

  async updateUsdBalance(userId: string, amount: number): Promise<number> {
    const current = await this.getUsdBalance(userId);
    const newBalance = current + amount;
    await db.update(usdBalances).set({ balance: newBalance }).where(eq(usdBalances.userId, userId));
    return newBalance;
  }

  // Transactions
  async getAllTransactions(userId: string): Promise<Transaction[]> {
    return await db.select().from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.timestamp));
  }

  async createTransaction(tx: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db.insert(transactions).values({
      ...tx,
      id: randomUUID(),
    }).returning();
    return transaction;
  }

  // Settings
  async getSettings(userId: string): Promise<UserSettings> {
    const [settings] = await db.select().from(userSettings).where(eq(userSettings.userId, userId));
    if (!settings) {
      const [newSettings] = await db.insert(userSettings).values({
        userId,
        currency: "USD",
        theme: "dark",
        priceAlerts: true,
        transactionNotifications: true,
        marketUpdates: false,
        twoFactorEnabled: false,
      }).returning();
      return newSettings;
    }
    return settings;
  }

  async updateSettings(userId: string, updates: Partial<UserSettings>): Promise<UserSettings> {
    const existing = await this.getSettings(userId);
    const [updated] = await db.update(userSettings)
      .set(updates)
      .where(eq(userSettings.userId, userId))
      .returning();
    return updated || existing;
  }

  // Price Alerts
  async getPriceAlerts(userId: string): Promise<PriceAlert[]> {
    return await db.select().from(priceAlerts)
      .where(eq(priceAlerts.userId, userId))
      .orderBy(desc(priceAlerts.createdAt));
  }

  async createPriceAlert(alert: InsertPriceAlert): Promise<PriceAlert> {
    const [newAlert] = await db.insert(priceAlerts).values({
      ...alert,
      id: randomUUID(),
    }).returning();
    return newAlert;
  }

  async deletePriceAlert(userId: string, alertId: string): Promise<void> {
    await db.delete(priceAlerts)
      .where(and(eq(priceAlerts.id, alertId), eq(priceAlerts.userId, userId)));
  }

  async updatePriceAlert(alertId: string, updates: Partial<PriceAlert>): Promise<void> {
    await db.update(priceAlerts).set(updates).where(eq(priceAlerts.id, alertId));
  }

  // Limit Orders
  async getLimitOrders(userId: string): Promise<LimitOrder[]> {
    return await db.select().from(limitOrders)
      .where(eq(limitOrders.userId, userId))
      .orderBy(desc(limitOrders.createdAt));
  }

  async createLimitOrder(order: InsertLimitOrder): Promise<LimitOrder> {
    const [newOrder] = await db.insert(limitOrders).values({
      ...order,
      id: randomUUID(),
    }).returning();
    return newOrder;
  }

  async cancelLimitOrder(userId: string, orderId: string): Promise<void> {
    await db.update(limitOrders)
      .set({ status: "cancelled" })
      .where(and(eq(limitOrders.id, orderId), eq(limitOrders.userId, userId)));
  }

  async executeLimitOrder(orderId: string): Promise<void> {
    await db.update(limitOrders)
      .set({ status: "executed", executedAt: new Date() })
      .where(eq(limitOrders.id, orderId));
  }
}

export const storage = new DatabaseStorage();
