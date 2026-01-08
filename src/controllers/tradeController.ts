import { Request, Response } from 'express';
import { getDB } from '../config/db'; // Use the new DB accessor
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../config/logger';

export const getInstruments = async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const instruments = await db.all('SELECT * FROM instruments');
    res.json(instruments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch instruments' });
  }
};

export const placeOrder = async (req: Request, res: Response) => {
  const db = getDB();
  const { symbol, type, style, quantity, price } = req.body;

  // 1. Validate Inputs
  if (!quantity || quantity <= 0) {
    return res.status(400).json({ error: "Quantity must be greater than 0" });
  }

  try {
    // 2. Fetch Instrument & User Cash
    const instrument = await db.get('SELECT * FROM instruments WHERE symbol = ?', [symbol]);
    if (!instrument) {
      return res.status(404).json({ error: "Instrument not found" });
    }

    const user = await db.get('SELECT * FROM users WHERE id = ?', ['default_user']);
    let userCash = user.cash;

    // 3. Determine Execution Price
    const executionPrice = style === 'MARKET' ? instrument.price : price;
    if (!executionPrice) {
      return res.status(400).json({ error: "Price is required for LIMIT orders" });
    }

    // 4. Validate Funds / Holdings
    const totalCost = executionPrice * quantity;
    
    if (type === 'BUY') {
      if (userCash < totalCost) {
        return res.status(400).json({ error: "Insufficient Funds" });
      }
    } else if (type === 'SELL') {
      const holding = await db.get('SELECT * FROM portfolio WHERE symbol = ?', [symbol]);
      if (!holding || holding.quantity < quantity) {
        return res.status(400).json({ error: "Insufficient Holdings to Sell" });
      }
    }

    // 5. Create Order
    const orderId = uuidv4();
    const status = style === 'MARKET' ? 'EXECUTED' : 'PLACED';
    const timestamp = new Date().toISOString();

    await db.run(
      `INSERT INTO orders (id, symbol, type, style, quantity, price, status, timestamp) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderId, symbol, type, style, quantity, executionPrice, status, timestamp]
    );

    // 6. EXECUTION LOGIC (Transaction)
    if (status === 'EXECUTED') {
      if (type === 'BUY') {
        // Deduct Cash
        await db.run('UPDATE users SET cash = cash - ? WHERE id = ?', [totalCost, 'default_user']);
        
        // Update/Insert Portfolio
        const holding = await db.get('SELECT * FROM portfolio WHERE symbol = ?', [symbol]);
        if (holding) {
          const newQty = holding.quantity + quantity;
          const newAvg = ((holding.quantity * holding.averagePrice) + totalCost) / newQty;
          await db.run('UPDATE portfolio SET quantity = ?, averagePrice = ? WHERE symbol = ?', 
            [newQty, newAvg, symbol]);
        } else {
          await db.run('INSERT INTO portfolio (symbol, quantity, averagePrice) VALUES (?, ?, ?)', 
            [symbol, quantity, executionPrice]);
        }
      } else if (type === 'SELL') {
        // Add Cash
        await db.run('UPDATE users SET cash = cash + ? WHERE id = ?', [totalCost, 'default_user']);
        
        // Update Portfolio
        const holding = await db.get('SELECT * FROM portfolio WHERE symbol = ?', [symbol]);
        const newQty = holding.quantity - quantity;
        
        if (newQty === 0) {
          await db.run('DELETE FROM portfolio WHERE symbol = ?', [symbol]);
        } else {
          await db.run('UPDATE portfolio SET quantity = ? WHERE symbol = ?', [newQty, symbol]);
        }
      }
    }

    logger.info(`Order Processed: ${orderId} - ${status}`);
    
    // Fetch updated cash for response
    const updatedUser = await db.get('SELECT cash FROM users WHERE id = ?', ['default_user']);

    res.status(201).json({
      order: { id: orderId, symbol, status, price: executionPrice },
      message: status === 'EXECUTED' ? 'Order Executed Successfully' : 'Order Placed',
      remainingCash: updatedUser.cash
    });

  } catch (err: any) {
    logger.error(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getPortfolio = async (req: Request, res: Response) => {
    const db = getDB();
    
    const user = await db.get('SELECT cash FROM users WHERE id = ?', ['default_user']);
    const holdings = await db.all('SELECT * FROM portfolio');
    const instruments = await db.all('SELECT * FROM instruments');

    // Map current values
    const portfolioWithValues = holdings.map(h => {
        const inst = instruments.find(i => i.symbol === h.symbol);
        const currentPrice = inst ? inst.price : h.averagePrice;
        return {
            ...h,
            currentValue: h.quantity * currentPrice
        };
    });

    const totalValue = portfolioWithValues.reduce((acc, curr) => acc + curr.currentValue, 0);

    res.json({
        cash: user.cash,
        holdings: portfolioWithValues,
        totalPortfolioValue: totalValue
    });
};

export const getTrades = async (req: Request, res: Response) => {
  const db = getDB();
  const trades = await db.all(`SELECT * FROM orders WHERE status = 'EXECUTED' ORDER BY timestamp DESC`);
  res.json(trades);
};