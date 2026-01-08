import {placeOrder} from '../src/controllers/placeOrder'
import { getDB } from '../src/config/db';
import { Request, Response } from 'express';

jest.mock('../src/config/db');

describe('placeOrder', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockDb: any;

  beforeEach(() => {

    jest.clearAllMocks();

    mockRequest = {
      body: {}
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(), 
      json: jest.fn()
    };


    mockDb = {
      get: jest.fn(),
      run: jest.fn()
    };
    (getDB as jest.Mock).mockReturnValue(mockDb);
  });

  test('should successfully execute a MARKET BUY order', async () => {

    mockRequest.body = {
      symbol: 'TCS',
      type: 'BUY',
      style: 'MARKET',
      quantity: 10
    };


    mockDb.get
      .mockResolvedValueOnce({ symbol: 'TCS', lastTradedPrice: 2500 }) 
      .mockResolvedValueOnce({ id: 'shiv_rajput', cash: 50000 }); 


    await placeOrder(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(201);
    
    expect(mockDb.run).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO orders'),
      expect.any(Array)
    );

    expect(mockDb.run).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE users SET cash'),
      [25000, 'shiv_rajput']
    );
  });


  test('should return 400 if user has insufficient funds', async () => {
    mockRequest.body = {
      symbol: 'TCS',
      type: 'BUY',
      style: 'MARKET',
      quantity: 10
    };

    mockDb.get
      .mockResolvedValueOnce({ symbol: 'TCS', lastTradedPrice: 2500 }) 
      .mockResolvedValueOnce({ id: 'shiv_rajput', cash: 100 }); 

    await placeOrder(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: "Insufficient Funds" });
    
    expect(mockDb.run).not.toHaveBeenCalled();
  });
});