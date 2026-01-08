import { Router } from 'express';
import { getInstruments, placeOrder, getPortfolio,getTrades} from '../controllers/tradeController';

const router = Router();

router.get('/instruments', getInstruments);
router.post('/orders', placeOrder);
router.get('/portfolio', getPortfolio);
router.get('/trades', getTrades);

export default router;