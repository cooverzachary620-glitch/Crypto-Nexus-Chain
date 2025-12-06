import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
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
  
  // Get all cryptocurrencies
  app.get("/api/cryptocurrencies", async (req, res) => {
    try {
      const cryptos = await storage.getAllCryptos();
      res.json(cryptos);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cryptocurrencies" });
    }
  });

  // Get single cryptocurrency
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

  // Get portfolio summary
  app.get("/api/portfolio", async (req, res) => {
    try {
      const portfolio = await storage.getPortfolio();
      res.json(portfolio);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch portfolio" });
    }
  });

  // Get USD balance
  app.get("/api/balance", async (req, res) => {
    try {
      const balance = await storage.getUsdBalance();
      res.json(balance);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch balance" });
    }
  });

  // Execute trade (buy/sell)
  app.post("/api/trade", async (req, res) => {
    try {
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
        const balance = await storage.getUsdBalance();
        
        if (totalWithFee > balance) {
          return res.status(400).json({ error: "Insufficient funds" });
        }

        // Update balance and holdings
        await storage.updateUsdBalance(-totalWithFee);
        await storage.updateHolding(cryptoId, amount, crypto.currentPrice);

        // Create transaction
        await storage.createTransaction({
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
        const holding = await storage.getWalletHolding(cryptoId);
        
        if (!holding || holding.amount < amount) {
          return res.status(400).json({ error: "Insufficient holdings" });
        }

        const totalAfterFee = totalValue - fee;

        // Update balance and holdings
        await storage.updateUsdBalance(totalAfterFee);
        await storage.updateHolding(cryptoId, -amount, 0);

        // Create transaction
        await storage.createTransaction({
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

  // Convert crypto
  app.post("/api/convert", async (req, res) => {
    try {
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

      const holding = await storage.getWalletHolding(fromCryptoId);
      
      if (!holding || holding.amount < fromAmount) {
        return res.status(400).json({ error: "Insufficient holdings" });
      }

      const fromValue = fromAmount * fromCrypto.currentPrice;
      const exchangeRate = fromCrypto.currentPrice / toCrypto.currentPrice;
      const toAmount = fromAmount * exchangeRate;
      const fee = toAmount * 0.001; // 0.1% fee
      const finalToAmount = toAmount - fee;

      // Update holdings
      await storage.updateHolding(fromCryptoId, -fromAmount, 0);
      await storage.updateHolding(toCryptoId, finalToAmount, toCrypto.currentPrice);

      // Create transaction (fee is in toCrypto units, convert to USD for storage)
      const feeInUsd = fee * toCrypto.currentPrice;
      await storage.createTransaction({
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

  // Get all transactions
  app.get("/api/transactions", async (req, res) => {
    try {
      const transactions = await storage.getAllTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  // Get settings
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  // Update settings
  app.patch("/api/settings", async (req, res) => {
    try {
      const settings = await storage.updateSettings(req.body);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  return httpServer;
}
