import { 
  type User, 
  type InsertUser, 
  type Cryptocurrency, 
  type WalletHolding, 
  type Transaction, 
  type UserSettings,
  type PortfolioSummary,
  type InsertTransaction
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Cryptocurrencies
  getAllCryptos(): Promise<Cryptocurrency[]>;
  getCrypto(id: string): Promise<Cryptocurrency | undefined>;
  
  // Wallet & Portfolio
  getWalletHoldings(): Promise<WalletHolding[]>;
  getWalletHolding(cryptoId: string): Promise<WalletHolding | undefined>;
  updateHolding(cryptoId: string, amount: number, avgPrice: number): Promise<WalletHolding>;
  removeHolding(cryptoId: string): Promise<void>;
  getPortfolio(): Promise<PortfolioSummary>;
  
  // USD Balance
  getUsdBalance(): Promise<number>;
  updateUsdBalance(amount: number): Promise<number>;
  
  // Transactions
  getAllTransactions(): Promise<Transaction[]>;
  createTransaction(tx: InsertTransaction): Promise<Transaction>;
  
  // Settings
  getSettings(): Promise<UserSettings>;
  updateSettings(settings: Partial<UserSettings>): Promise<UserSettings>;
}

// Mock cryptocurrency data
const mockCryptos: Cryptocurrency[] = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin", currentPrice: 43250.82, priceChange24h: 1250.50, priceChangePercentage24h: 2.98, marketCap: 847000000000, volume24h: 28500000000, high24h: 43850.00, low24h: 41950.00, image: null },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", currentPrice: 2285.45, priceChange24h: -45.20, priceChangePercentage24h: -1.94, marketCap: 274500000000, volume24h: 15200000000, high24h: 2350.00, low24h: 2245.00, image: null },
  { id: "tether", symbol: "USDT", name: "Tether", currentPrice: 1.00, priceChange24h: 0.001, priceChangePercentage24h: 0.01, marketCap: 91000000000, volume24h: 52000000000, high24h: 1.001, low24h: 0.999, image: null },
  { id: "binancecoin", symbol: "BNB", name: "BNB", currentPrice: 312.75, priceChange24h: 8.25, priceChangePercentage24h: 2.71, marketCap: 48200000000, volume24h: 1250000000, high24h: 318.00, low24h: 302.50, image: null },
  { id: "solana", symbol: "SOL", name: "Solana", currentPrice: 98.42, priceChange24h: 5.85, priceChangePercentage24h: 6.32, marketCap: 42500000000, volume24h: 2850000000, high24h: 102.50, low24h: 91.20, image: null },
  { id: "ripple", symbol: "XRP", name: "XRP", currentPrice: 0.62, priceChange24h: -0.02, priceChangePercentage24h: -3.12, marketCap: 33800000000, volume24h: 1450000000, high24h: 0.65, low24h: 0.60, image: null },
  { id: "usd-coin", symbol: "USDC", name: "USD Coin", currentPrice: 1.00, priceChange24h: 0.0005, priceChangePercentage24h: 0.05, marketCap: 24500000000, volume24h: 5200000000, high24h: 1.002, low24h: 0.998, image: null },
  { id: "cardano", symbol: "ADA", name: "Cardano", currentPrice: 0.58, priceChange24h: 0.03, priceChangePercentage24h: 5.45, marketCap: 20500000000, volume24h: 685000000, high24h: 0.60, low24h: 0.54, image: null },
  { id: "avalanche-2", symbol: "AVAX", name: "Avalanche", currentPrice: 35.82, priceChange24h: -1.25, priceChangePercentage24h: -3.37, marketCap: 13200000000, volume24h: 520000000, high24h: 37.50, low24h: 34.80, image: null },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin", currentPrice: 0.082, priceChange24h: 0.005, priceChangePercentage24h: 6.49, marketCap: 11700000000, volume24h: 890000000, high24h: 0.088, low24h: 0.076, image: null },
  { id: "polkadot", symbol: "DOT", name: "Polkadot", currentPrice: 7.25, priceChange24h: 0.18, priceChangePercentage24h: 2.55, marketCap: 9200000000, volume24h: 285000000, high24h: 7.45, low24h: 7.02, image: null },
  { id: "matic-network", symbol: "MATIC", name: "Polygon", currentPrice: 0.85, priceChange24h: -0.03, priceChangePercentage24h: -3.41, marketCap: 7900000000, volume24h: 425000000, high24h: 0.89, low24h: 0.82, image: null },
  { id: "chainlink", symbol: "LINK", name: "Chainlink", currentPrice: 14.52, priceChange24h: 0.42, priceChangePercentage24h: 2.98, marketCap: 8100000000, volume24h: 385000000, high24h: 14.85, low24h: 13.95, image: null },
  { id: "litecoin", symbol: "LTC", name: "Litecoin", currentPrice: 72.45, priceChange24h: -2.15, priceChangePercentage24h: -2.88, marketCap: 5350000000, volume24h: 425000000, high24h: 75.20, low24h: 71.50, image: null },
  { id: "uniswap", symbol: "UNI", name: "Uniswap", currentPrice: 6.28, priceChange24h: 0.15, priceChangePercentage24h: 2.45, marketCap: 4750000000, volume24h: 185000000, high24h: 6.45, low24h: 6.08, image: null },
];

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private cryptos: Map<string, Cryptocurrency>;
  private holdings: Map<string, WalletHolding>;
  private transactions: Transaction[];
  private usdBalance: number;
  private settings: UserSettings;

  constructor() {
    this.users = new Map();
    this.cryptos = new Map();
    this.holdings = new Map();
    this.transactions = [];
    this.usdBalance = 10000; // Starting balance
    
    // Initialize default settings
    this.settings = {
      id: "default",
      currency: "USD",
      theme: "dark",
      priceAlerts: true,
      transactionNotifications: true,
      marketUpdates: false,
      twoFactorEnabled: false,
    };
    
    // Initialize cryptos
    mockCryptos.forEach(crypto => {
      this.cryptos.set(crypto.id, crypto);
    });
    
    // Simulate some price changes periodically
    setInterval(() => {
      this.simulatePriceChanges();
    }, 30000); // Every 30 seconds
  }

  private simulatePriceChanges() {
    this.cryptos.forEach((crypto, id) => {
      const changePercent = (Math.random() - 0.5) * 2; // -1% to +1%
      const priceChange = crypto.currentPrice * (changePercent / 100);
      const newPrice = crypto.currentPrice + priceChange;
      
      this.cryptos.set(id, {
        ...crypto,
        currentPrice: newPrice,
        priceChange24h: crypto.priceChange24h + priceChange,
        priceChangePercentage24h: crypto.priceChangePercentage24h + changePercent,
        high24h: Math.max(crypto.high24h, newPrice),
        low24h: Math.min(crypto.low24h, newPrice),
      });
    });
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Cryptocurrencies
  async getAllCryptos(): Promise<Cryptocurrency[]> {
    return Array.from(this.cryptos.values());
  }

  async getCrypto(id: string): Promise<Cryptocurrency | undefined> {
    return this.cryptos.get(id);
  }

  // Wallet & Portfolio
  async getWalletHoldings(): Promise<WalletHolding[]> {
    return Array.from(this.holdings.values());
  }

  async getWalletHolding(cryptoId: string): Promise<WalletHolding | undefined> {
    return this.holdings.get(cryptoId);
  }

  async updateHolding(cryptoId: string, amount: number, avgPrice: number): Promise<WalletHolding> {
    const crypto = await this.getCrypto(cryptoId);
    if (!crypto) {
      throw new Error("Cryptocurrency not found");
    }

    const existing = this.holdings.get(cryptoId);
    
    if (existing) {
      const totalAmount = existing.amount + amount;
      const newAvgPrice = amount > 0 
        ? ((existing.amount * existing.averageBuyPrice) + (amount * avgPrice)) / totalAmount
        : existing.averageBuyPrice;
      
      const updated: WalletHolding = {
        ...existing,
        amount: totalAmount,
        averageBuyPrice: newAvgPrice,
      };
      
      if (totalAmount <= 0) {
        this.holdings.delete(cryptoId);
      } else {
        this.holdings.set(cryptoId, updated);
      }
      
      return updated;
    } else {
      const newHolding: WalletHolding = {
        id: randomUUID(),
        cryptoId,
        symbol: crypto.symbol,
        name: crypto.name,
        amount,
        averageBuyPrice: avgPrice,
      };
      this.holdings.set(cryptoId, newHolding);
      return newHolding;
    }
  }

  async removeHolding(cryptoId: string): Promise<void> {
    this.holdings.delete(cryptoId);
  }

  async getPortfolio(): Promise<PortfolioSummary> {
    const holdings = await this.getWalletHoldings();
    
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
  async getUsdBalance(): Promise<number> {
    return this.usdBalance;
  }

  async updateUsdBalance(amount: number): Promise<number> {
    this.usdBalance += amount;
    return this.usdBalance;
  }

  // Transactions
  async getAllTransactions(): Promise<Transaction[]> {
    return [...this.transactions].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async createTransaction(tx: InsertTransaction): Promise<Transaction> {
    const transaction: Transaction = {
      ...tx,
      id: randomUUID(),
      timestamp: tx.timestamp || new Date(),
    };
    this.transactions.push(transaction);
    return transaction;
  }

  // Settings
  async getSettings(): Promise<UserSettings> {
    return this.settings;
  }

  async updateSettings(updates: Partial<UserSettings>): Promise<UserSettings> {
    this.settings = { ...this.settings, ...updates };
    return this.settings;
  }
}

export const storage = new MemStorage();
