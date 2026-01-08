import axios, { AxiosInstance, AxiosError } from 'axios';
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

  /**
   * Fetch all available tradable instruments
   */
  async getInstruments(): Promise<Instrument[]> {
    try {
      const response = await this.client.get<Instrument[]>('/instruments');
      return response.data;
    } catch (error) {
      this.handleError(error);
      return []; // Unreachable due to error throwing
    }
  }

  /**
   * Place a new BUY or SELL order
   */
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
      return response.data.order;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Get the current User Portfolio (Cash + Holdings)
   */
  async getPortfolio(): Promise<{ cash: number, holdings: PortfolioPosition[] }> {
    try {
      const response = await this.client.get('/portfolio');
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Get the status of a specific Order
   */
  async getOrder(orderId: string): Promise<Order> {
    try {
      const response = await this.client.get<Order>(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Internal Error Handler to format API errors nicely
   */
  private handleError(error: any) {
    if (axios.isAxiosError(error)) {
        // 1. Server responded with a status code (4xx, 5xx)
        if (error.response) {
            console.error("Server Error Data:", error.response.data); // Debug log
            const errorMsg = error.response.data?.error || JSON.stringify(error.response.data);
            throw new Error(`SDK Error [${error.response.status}]: ${errorMsg}`);
        } 
        // 2. Request was made but no response (Network Error, Server Down)
        else if (error.request) {
            throw new Error("SDK Error: No response received from server. Is it running?");
        }
    }
    // 3. Something else happened
    throw new Error(`SDK Error: ${error.message}`);}
}
