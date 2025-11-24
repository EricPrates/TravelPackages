import express from 'express';
import * as auth from '../services/myServices/Auth.js';

const router = express.Router();
router.post('/login', auth.login);
router.get('/google/url', auth.getGoogleUrl);
router.get('/google/callback', auth.handleGoogleCallback);
router.post('/refresh', auth.refreshToken);
export default app => {
    app.use('/auth', router);
}

