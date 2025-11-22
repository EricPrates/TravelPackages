import express from 'express';
import * as wallet from '../services/myServices/Wallet.service.js';
import { tokenValidated } from '../services/myServices/Auth.js';

const router = express.Router();

router.post('/add-funds', tokenValidated, wallet.cashDeposit);
router.post('/redeem-miles', tokenValidated, wallet.milesDeposit);
router.get('/balance/:userId', tokenValidated, wallet.getBalance);
router.get('/statements/:userId', tokenValidated, wallet.getStatements);


export default app =>{
    app.use ('/wallet', router);
}