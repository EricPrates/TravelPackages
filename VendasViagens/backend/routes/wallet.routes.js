import express from 'express';
import * as wallet from '../services/myServices/Wallet.service.js';
import { tokenValidated } from '../services/myServices/Auth.js';

const router = express.Router();

router.post('/add-funds', tokenValidated, wallet.cashDeposit);
router.post('/add-miles-promo', tokenValidated, wallet.addMilesPromo);

router.get('/balance', tokenValidated, wallet.getBalance);
router.get('/statement', tokenValidated, wallet.getWalletStatement);
router.get('/:userId', tokenValidated, wallet.getWalletByUserId);

export default app =>{
    app.use ('/wallet', router);
}