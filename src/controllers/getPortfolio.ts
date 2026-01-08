import { Request, Response } from 'express';
import { getDB } from '../config/db'; 

export const getPortfolio = async (req: Request, res: Response) => {
    const db = getDB();
    
    const user = await db.get('SELECT cash FROM users WHERE id = ?', ['shiv_rajput']);
    const holdings = await db.all('SELECT * FROM portfolio');
    const instruments = await db.all('SELECT * FROM instruments');

    const portfolioWithValues = holdings.map(holding => {
        const stock = instruments.find(s => s.symbol === holding.symbol);
        const currentPrice = stock ? stock.lastTradedPrice : holding.averagePrice;
        return {
            ...holding,
            currentValue: holding.quantity * currentPrice
        };
    });
  
    const totalValue = portfolioWithValues.reduce((acc, curr) => acc + curr.currentValue, 0);

    res.json({
        cash: user.cash,
        holdings: portfolioWithValues,
        totalPortfolioValue: totalValue
    });
};