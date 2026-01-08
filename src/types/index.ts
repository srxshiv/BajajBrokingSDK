export interface Instrument {
  symbol: string;
  name: string;
  type: 'EQUITY' | 'DERIVATIVE';
  price: number;
}

export interface Order {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  style: 'MARKET' | 'LIMIT';
  quantity: number;
  price?: number;
  status: 'NEW' | 'PLACED' | 'EXECUTED' | 'CANCELLED';
  timestamp: Date;
}

export interface PortfolioPosition {
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentValue: number;
}