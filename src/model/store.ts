import { Instrument, Order, PortfolioPosition } from "../types";

export const db = {
  instruments: [
    { symbol: 'RELIANCE', name: 'Reliance Industries', type: 'EQUITY', price: 2500 },
    { symbol: 'TCS', name: 'Tata Consultancy Svcs', type: 'EQUITY', price: 3400 },
    { symbol: 'INFY', name: 'Infosys', type: 'EQUITY', price: 1600 },
  ] as Instrument[],
  
  orders: new Map<string, Order>(),
  
  userPortfolio: new Map<string, PortfolioPosition>(),
  userCash: 100000 
};