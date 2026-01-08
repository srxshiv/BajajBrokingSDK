import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Bajaj Broking api',
    version: '1',
    description: 'bajaj placement assignment - Trading SDK',
  },
  servers: [
    { url: 'http://localhost:3000/api/v1', description: 'Local dev server' }
  ],
  paths: {
    '/instruments': {
      get: {
        summary: 'Get all the instruments',
        responses: { '200': { description: 'List of instruments' } }
      }
    },
    '/orders': {
      post: {
        summary: 'Place a new order',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  symbol: { type: 'string', example: 'BAJAJ' },
                  type: { type: 'string', enum: ['BUY', 'SELL'] },
                  style: { type: 'string', enum: ['MARKET', 'LIMIT'] },
                  quantity: { type: 'number', example: 10 },
                  price: { type: 'number', example: 2500 }
                }
              }
            }
          }
        },
        responses: { '201': { description: 'Order Created' } }
      }
    },
    '/portfolio': {
      get: {
        summary: "Get User Portfolio- all holdings and total portfolio value and Cash ",
        responses: { '200': { description: 'Portfolio data' } }
      }
    },
    '/trades':{
      get : {
        summary: "get all the executed trades user has made , can add query parameter 'all=something' to get all trades even non executed ones" ,
        responses: {'200': {description :'excuted trades'}}
      }
    },
    '/orders/{id}':{
      get : {
        summary : "get status of a particular order with order id" ,
        parameters :[
          {
            name: 'id',        
            in: 'path',        
            required: true,    
            schema: {
              type: 'string',
              example: '7aec6fcc-fceb-4591-9e40-c79e2004f2f3'
            },
            description: 'unique Order ID'
          }
        ] ,
        responses: {'200':{description : 'order'}}
      }
    }
  }
};

export const setupSwagger = (app: Express) => {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};