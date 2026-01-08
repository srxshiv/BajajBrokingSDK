// src/controllers/tradeController.ts (Updated)

import { Request, Response } from 'express';
import { db } from '../model/store';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../config/logger';
import { Order, PortfolioPosition } from '../types';

export const getInstruments = (req: Request, res: Response) => {
  console.log("request aayi")
  res.json(db.instruments);
};

export const placeOrder = (req: Request, res: Response) => {
  // 1. Extract Data
  const { symbol, type, style, quantity, price } = req.body;

  // 2. Validate Inputs
  if (!quantity || quantity <= 0) {
    return res.status(400).json({ error: "Quantity must be greater than 0" });
  }

  const instrument = db.instruments.find(i => i.symbol === symbol);
  if (!instrument) {
    return res.status(404).json({ error: "Instrument not found" });
  }

  // 3. Determine Execution Price
  // MARKET orders execute at current instrument price. LIMIT orders use the user's price.
  const executionPrice = style === 'MARKET' ? instrument.price : price;

  if (!executionPrice) {
    return res.status(400).json({ error: "Price is required for LIMIT orders" });
  }

  // 4. Validate Funds (Simulation Logic)
  const totalCost = executionPrice * quantity;
  if (type === 'BUY') {
    if (db.userCash < totalCost) {
      return res.status(400).json({ 
        error: "Insufficient Funds", 
        details: `Required: ${totalCost}, Available: ${db.userCash}` 
      });
    }
  } else if (type === 'SELL') {
    const currentHolding = db.userPortfolio.get(symbol);
    if (!currentHolding || currentHolding.quantity < quantity) {
      return res.status(400).json({ error: "Insufficient Holdings to Sell" });
    }
  }

  // 5. Create the Order Object
  const newOrder: Order = {
    id: uuidv4(),
    symbol,
    type,
    style,
    quantity,
    price: executionPrice,
    status: style === 'MARKET' ? 'EXECUTED' : 'PLACED', // Market orders execute instantly
    timestamp: new Date()
  };

  // 6. EXECUTION LOGIC (The "Bonus" Part)
  if (newOrder.status === 'EXECUTED') {
    if (type === 'BUY') {
      // Deduct Cash
      db.userCash -= totalCost;

      // Update Portfolio
      const holding = db.userPortfolio.get(symbol);
      if (holding) {
        // Average Price Calculation: (OldCost + NewCost) / TotalQty
        const oldCost = holding.quantity * holding.averagePrice;
        const newTotalQty = holding.quantity + quantity;
        const newAvgPrice = (oldCost + totalCost) / newTotalQty;
        
        holding.quantity = newTotalQty;
        holding.averagePrice = newAvgPrice;
        holding.currentValue = newTotalQty * instrument.price; 
      } else {
        // New Position
        db.userPortfolio.set(symbol, {
          symbol,
          quantity,
          averagePrice: executionPrice,
          currentValue: totalCost
        });
      }
    } else if (type === 'SELL') {
      // Add Cash
      db.userCash += totalCost;

      // Update Portfolio
      const holding = db.userPortfolio.get(symbol)!; // Validated above
      holding.quantity -= quantity;
      
      // If quantity is 0, remove from portfolio
      if (holding.quantity === 0) {
        db.userPortfolio.delete(symbol);
      } else {
        holding.currentValue = holding.quantity * instrument.price;
      }
    }
  }

  // 7. Save and Return
  db.orders.set(newOrder.id, newOrder);
  
  logger.info(`Order Processed: ${newOrder.id} - ${newOrder.status}`);
  
  // Return the order along with remaining cash for better UX
  res.status(201).json({
    order: newOrder,
    message: newOrder.status === 'EXECUTED' ? 'Order Executed Successfully' : 'Order Placed',
    remainingCash: db.userCash
  });
};

export const getPortfolio = (req: Request, res: Response) => {
    // Recalculate current values based on latest market prices
    const portfolioArray = Array.from(db.userPortfolio.values()).map(position => {
        const instrument = db.instruments.find(i => i.symbol === position.symbol);
        if (instrument) {
            position.currentValue = position.quantity * instrument.price;
        }
        return position;
    });

    res.json({
        cash: db.userCash,
        holdings: portfolioArray,
        totalPortfolioValue: portfolioArray.reduce((acc, curr) => acc + curr.currentValue, 0)
    });
};
export const getTrades = (req: Request, res: Response) => {
  // Filter only 'EXECUTED' orders to simulate a "Trade History"
  const trades = Array.from(db.orders.values())
                      .filter(order => order.status === 'EXECUTED')
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  res.json(trades);
};