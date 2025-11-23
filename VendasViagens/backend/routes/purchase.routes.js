import express from 'express';
import * as purchase from '../services/myServices/Purchase.Service.js';
import { tokenValidated } from '../services/myServices/Auth.js';

const router = express.Router();

router.post('/', tokenValidated, purchase.createPurchaseWithCashOrMiles);
router.get('/user/:userId', tokenValidated, purchase.findPurchasesByUser);
router.post('/:purchaseId/cancel', tokenValidated, purchase.cancelPurchase);

export default app => {
    app.use('/purchases', router);
};
