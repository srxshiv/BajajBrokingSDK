import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Bajaj Broking api SDK',
    version: '1',
    description: 'Trading SDK Wrapper Assignment',
  },
  servers: [
    { url: 'http://localhost:3000/api/v1', description: 'Local dev server' }
  ],
  paths: {
    '/instruments': {
      get: {
        summary: 'Get all tradable instruments',
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
                  symbol: { type: 'string', example: 'RELIANCE' },
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
        summary: 'Get User Portfolio & Cash',
        responses: { '200': { description: 'Portfolio data' } }
      }
    }
  }
};

export const setupSwagger = (app: Express) => {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  console.log('📄 Swagger Docs available at http://localhost:3000/docs');
};