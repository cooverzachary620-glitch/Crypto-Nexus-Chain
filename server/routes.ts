import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";

const tradeSchema = z.object({
  type: z.enum(["buy", "sell"]),
  cryptoId: z.string(),
  amount: z.number().positive(),
});

const convertSchema = z.object({
  fromCryptoId: z.string(),
  toCryptoId: z.string(),
  fromAmount: z.number().positive(),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Setup authentication
  await setupAuth(app);

  // Auth user endpoint
  app.get("/api/auth/user", (req, res) => {
    if (req.isAuthenticated() && req.user) {
      const claims = (req.user as any).claims;
      if (claims) {
        return res.json({
          id: claims.sub,
          email: claims.email,
          firstName: claims.first_name,
          lastName: claims.last_name,
          profileImageUrl: claims.profile_image_url,
        });
      }
    }
    res.status(401).json({ message: "Not authenticated" });
  });

  // Get all cryptocurrencies (public)
  app.get("/api/cryptocurrencies", async (req, res) => {
    try {
      const cryptos = await storage.getAllCryptos();
      res.json(cryptos);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cryptocurrencies" });
    }
  });

  // Get single cryptocurrency (public)
  app.get("/api/cryptocurrencies/:id", async (req, res) => {
    try {
      const crypto = await storage.getCrypto(req.params.id);
      if (!crypto) {
        return res.status(404).json({ error: "Cryptocurrency not found" });
      }
      res.json(crypto);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cryptocurrency" });
    }
  });

  // Get portfolio summary (protected)
  app.get("/api/portfolio", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const portfolio = await storage.getPortfolio(userId);
      res.json(portfolio);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch portfolio" });
    }
  });

  // Get USD balance (protected)
  app.get("/api/balance", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const balance = await storage.getUsdBalance(userId);
      res.json(balance);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch balance" });
    }
  });

  // Execute trade (buy/sell) (protected)
  app.post("/api/trade", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const parsed = tradeSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid trade data" });
      }

      const { type, cryptoId, amount } = parsed.data;
      const crypto = await storage.getCrypto(cryptoId);
      
      if (!crypto) {
        return res.status(404).json({ error: "Cryptocurrency not found" });
      }

      const totalValue = amount * crypto.currentPrice;
      const fee = totalValue * 0.001; // 0.1% fee

      if (type === "buy") {
        const totalWithFee = totalValue + fee;
        const balance = await storage.getUsdBalance(userId);
        
        if (totalWithFee > balance) {
          return res.status(400).json({ error: "Insufficient funds" });
        }

        // Update balance and holdings
        await storage.updateUsdBalance(userId, -totalWithFee);
        await storage.updateHolding(userId, cryptoId, amount, crypto.currentPrice);

        // Create transaction
        await storage.createTransaction({
          userId,
          type: "buy",
          toCryptoId: cryptoId,
          toSymbol: crypto.symbol,
          toAmount: amount,
          fromCryptoId: null,
          fromSymbol: null,
          fromAmount: null,
          priceAtTransaction: crypto.currentPrice,
          totalValue,
          fee,
          status: "completed",
          timestamp: new Date(),
        });

      } else {
        // Sell
        const holding = await storage.getWalletHolding(userId, cryptoId);
        
        if (!holding || holding.amount < amount) {
          return res.status(400).json({ error: "Insufficient holdings" });
        }

        const totalAfterFee = totalValue - fee;

        // Update balance and holdings
        await storage.updateUsdBalance(userId, totalAfterFee);
        await storage.updateHolding(userId, cryptoId, -amount, 0);

        // Create transaction
        await storage.createTransaction({
          userId,
          type: "sell",
          fromCryptoId: cryptoId,
          fromSymbol: crypto.symbol,
          fromAmount: amount,
          toCryptoId: null,
          toSymbol: null,
          toAmount: null,
          priceAtTransaction: crypto.currentPrice,
          totalValue,
          fee,
          status: "completed",
          timestamp: new Date(),
        });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Trade error:", error);
      res.status(500).json({ error: "Failed to execute trade" });
    }
  });

  // Convert crypto (protected)
  app.post("/api/convert", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const parsed = convertSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid conversion data" });
      }

      const { fromCryptoId, toCryptoId, fromAmount } = parsed.data;
      
      const fromCrypto = await storage.getCrypto(fromCryptoId);
      const toCrypto = await storage.getCrypto(toCryptoId);
      
      if (!fromCrypto || !toCrypto) {
        return res.status(404).json({ error: "Cryptocurrency not found" });
      }

      const holding = await storage.getWalletHolding(userId, fromCryptoId);
      
      if (!holding || holding.amount < fromAmount) {
        return res.status(400).json({ error: "Insufficient holdings" });
      }

      const fromValue = fromAmount * fromCrypto.currentPrice;
      const exchangeRate = fromCrypto.currentPrice / toCrypto.currentPrice;
      const toAmount = fromAmount * exchangeRate;
      const fee = toAmount * 0.001; // 0.1% fee
      const finalToAmount = toAmount - fee;

      // Update holdings
      await storage.updateHolding(userId, fromCryptoId, -fromAmount, 0);
      await storage.updateHolding(userId, toCryptoId, finalToAmount, toCrypto.currentPrice);

      // Create transaction (fee is in toCrypto units, convert to USD for storage)
      const feeInUsd = fee * toCrypto.currentPrice;
      await storage.createTransaction({
        userId,
        type: "convert",
        fromCryptoId,
        fromSymbol: fromCrypto.symbol,
        fromAmount,
        toCryptoId,
        toSymbol: toCrypto.symbol,
        toAmount: finalToAmount,
        priceAtTransaction: exchangeRate,
        totalValue: fromValue,
        fee: feeInUsd,
        status: "completed",
        timestamp: new Date(),
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Convert error:", error);
      res.status(500).json({ error: "Failed to execute conversion" });
    }
  });

  // Get all transactions (protected)
  app.get("/api/transactions", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const transactions = await storage.getAllTransactions(userId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  // Get settings (protected)
  app.get("/api/settings", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const settings = await storage.getSettings(userId);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  // Update settings (protected)
  app.patch("/api/settings", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const settings = await storage.updateSettings(userId, req.body);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  return httpServer;
}
