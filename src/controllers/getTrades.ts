import { Request, Response } from 'express';
import { getDB } from '../config/db'; 

export const getTrades = async (req: Request, res: Response) => {
  const db = getDB();
    const query = req.query.all
    if(query){
      const trades = await db.all(`SELECT * FROM orders ORDER BY timestamp DESC`);
    res.json(trades);
    }
    const trades = await db.all(`SELECT * FROM orders WHERE status = 'EXECUTED' ORDER BY timestamp DESC`);
    res.json(trades);
  };