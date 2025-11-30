import express from 'express';
import * as purchase from '../services/myServices/Purchase.Service.js';
import { tokenValidated } from '../services/myServices/Auth.js';

const router = express.Router();

// Criar compra
router.post('/', tokenValidated, purchase.createPurchaseWithCashOrMiles);

// Buscar compras com filtros (query params)
// GET /purchases?userId=1&status=CONFIRMED&destination=Rio&from=2024-01-01&to=2024-12-31
router.get('/', tokenValidated, purchase.findPurchasesWithFilters);

// Buscar compra específica
router.get('/:purchaseId', tokenValidated, purchase.findPurchaseById);

// Cancelar compra
router.post('/:purchaseId/cancel', tokenValidated, purchase.cancelPurchase);

export default app => {
    app.use('/purchases', router);
};
