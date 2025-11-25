import express from 'express';
import * as purchase from '../services/myServices/Purchase.Service.js';
import { tokenValidated } from '../services/myServices/Auth.js';

const router = express.Router();


router.post('/', tokenValidated, purchase.createPurchaseWithCashOrMiles);


router.get('/', tokenValidated, purchase.findPurchasesWithFilters);


router.get('/:purchaseId', tokenValidated, purchase.findPurchaseById);


router.post('/:purchaseId/cancel', tokenValidated, purchase.cancelPurchase);

export default app => {
    app.use('/purchases', router);
};
