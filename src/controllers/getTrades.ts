import { Request, Response } from 'express';
import { getDB } from '../config/db'; 

export const getTrades = async (req: Request, res: Response) => {
    const db = getDB();
    const trades = await db.all(`SELECT * FROM orders WHERE status = 'EXECUTED' ORDER BY timestamp DESC`);
    res.json(trades);
  };