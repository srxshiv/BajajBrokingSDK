import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import apiRoutes from './routes/api';
import { logger } from './config/logger';
import { setupSwagger } from './config/swagger';
import { initDB } from './config/db'; // Import this
import { Request, Response, NextFunction } from 'express';

const app = express();
const PORT = 3000;

setupSwagger(app);

app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

app.use('/api/v1', apiRoutes);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Unhandled Error: ${err.message}`);
  res.status(500).json({
    error: "Internal Server Error",
    requestId: req.headers['x-request-id'] 
  });
});


initDB().then(() => {
  app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
    logger.info(`Swagger Docs available at http://localhost:${PORT}/docs`);
  });
}).catch(err => {
  console.error("Failed to init DB", err);
});