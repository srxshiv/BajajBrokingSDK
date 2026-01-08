import { Request, Response } from 'express';
import { getDB } from '../config/db'; 
import { v4 } from 'uuid';
import { logger } from '../config/logger';

export const placeOrder = async (req: Request, res: Response) => {
    const db = getDB();
    const { symbol, type, style, quantity, price } = req.body;
  
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: "Quantity should be more than 0" });
    }
  
    try {
      const instrument = await db.get('SELECT * FROM instruments WHERE symbol = ?', [symbol]);
      if (!instrument) {
        return res.status(404).json({ error: "instrument not found" });
      }
  
      const user = await db.get('SELECT * FROM users WHERE id = ?', ['shiv_rajput']);
      let userCash = user.cash;
  
      const executionPrice = style === 'MARKET' ? instrument.lastTradedPrice : price;
      if (!executionPrice) {
        return res.status(400).json({ error: "Price is required for LIMIT orders" });
      } 
  
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
  

      const orderId = v4();
      const status = style === 'MARKET' ? 'EXECUTED' : 'PLACED';
      const timestamp = new Date().toISOString();
  
      await db.run(
        `INSERT INTO orders (id, symbol, type, style, quantity, price, status, timestamp) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderId, symbol, type, style, quantity, executionPrice, status, timestamp]
      );
  

      if (status === 'EXECUTED') {
        if (type === 'BUY') {

          await db.run('UPDATE users SET cash = cash - ? WHERE id = ?', [totalCost, 'shiv_rajput']);
          

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

          await db.run('UPDATE users SET cash = cash + ? WHERE id = ?', [totalCost, 'shiv_rajput']);
          

          const holding = await db.get('SELECT * FROM portfolio WHERE symbol = ?', [symbol]);
          const newQty = holding.quantity - quantity;
          
          if (newQty === 0) {
            await db.run('DELETE FROM portfolio WHERE symbol = ?', [symbol]);
          } else {
            await db.run('UPDATE portfolio SET quantity = ? WHERE symbol = ?', [newQty, symbol]);
          }
        }
      }
  
      logger.info(`Order processed: ${orderId} - ${status}`);
      
      const updatedUser = await db.get('SELECT cash FROM users WHERE id = ?', ['shiv_rajput']);
  
      res.status(201).json({
        order: { id: orderId, symbol, status, price: executionPrice },
        message: status === 'EXECUTED' ? 'Order Executed sucessfully' : 'Order Placed',
        remainingCash: updatedUser.cash
      });
  
    } catch (err: any) {
      logger.error(err.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };