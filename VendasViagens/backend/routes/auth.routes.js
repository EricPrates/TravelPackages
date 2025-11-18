import express from 'express';
import * as auth from '../services/myServices/Auth.js';

const router = express.Router();
router.post('/login', auth.login);
export default app => {
    app.use('/auth', router);
}

