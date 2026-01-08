import { getDB } from '../config/db'; 
import { Request, Response } from 'express';

export const getInstruments = async (req: Request, res: Response) => {
    try {
      const db = getDB();
      const instruments = await db.all('SELECT * FROM instruments');
      res.json(instruments);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch instruments' });
    }
  };
  