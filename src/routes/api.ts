import { Router } from 'express';
import { getInstruments } from '../controllers/getInstruments';
import { getTrades } from '../controllers/getTrades';
import { placeOrder } from '../controllers/placeOrder';
import { getPortfolio } from '../controllers/getPortfolio';
import { getOrder } from '../controllers/getOrder';

const router = Router();

router.get('/instruments', getInstruments);
router.post('/orders', placeOrder);
router.get('/orders/:id' , getOrder)
router.get('/portfolio', getPortfolio);
router.get('/trades', getTrades);

export default router;