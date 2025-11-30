import express from 'express';
import * as dashboard from '../services/myServices/Dashboard.service.js';
import { tokenValidated } from '../services/myServices/Auth.js';

const router = express.Router();

router.get('/', tokenValidated, dashboard.getUserDashboard);

export default app => {
    app.use('/dashboard', router);
};
