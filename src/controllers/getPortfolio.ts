import { Request, Response } from 'express';
import { getDB } from '../config/db'; 

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