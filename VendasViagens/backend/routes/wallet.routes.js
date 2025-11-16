import express from 'express';
import * as wallet from '../controller/Wallet.controller.js';
import { tokenValidated } from '../controller/Auth.controller.js';

const router = express.Router();

router.post('/add-funds', tokenValidated, wallet.cashDeposit);
router.post('/redeem-miles', tokenValidated, wallet.milesDeposit);
router.get('/balance', tokenValidated, wallet.getBalance);
router.get('/statements', tokenValidated, wallet.getStatements);


export default app =>{
    app.use ('/wallet', router);
}