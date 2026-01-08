import axios, { AxiosInstance } from 'axios';
import { Instrument, Order, PortfolioPosition } from '../types';

export class BajajBrokingSDK {
  private client: AxiosInstance;

  constructor(baseURL: string = 'http://localhost:3000/api/v1') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async getInstruments(): Promise<Instrument[]> {
    try {
      const response = await this.client.get<Instrument[]>('/instruments');
      return response.data;
    } catch (error) {
      this.handleError(error);
      return []; 
    }
  }

  async placeOrder(
    symbol: string, 
    type: 'BUY' | 'SELL', 
    quantity: number, 
    style: 'MARKET' | 'LIMIT' = 'MARKET',
    price?: number
  ): Promise<Order> {
    try {
      const payload = { symbol, type, quantity, style, price };
      const response = await this.client.post<{ order: Order, message: string }>('/orders', payload);
      console.log(response.data.message)
      return response.data.order;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async getPortfolio(): Promise<{ cash: number, holdings: PortfolioPosition[] , totalPortfolioValue: number }> {
    try {
      const response = await this.client.get('/portfolio');
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async getOrder(orderId: string): Promise<Order> {
    try {
      const response = await this.client.get<Order>(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }


  private handleError(error: any) {
    if (axios.isAxiosError(error)) {

        if (error.response) {
            console.error("Server Error Data:", error.response.data);
            const errorMsg = error.response.data?.error || JSON.stringify(error.response.data);
            throw new Error(`SDK Error [${error.response.status}]: ${errorMsg}`);
        } 

        else if (error.request) {
            throw new Error(" No response received from server.");
        }
    }
    throw new Error(`SDK Error: ${error.message}`);}
}
