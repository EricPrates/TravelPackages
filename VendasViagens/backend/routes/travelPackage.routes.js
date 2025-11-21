import express from "express";
import * as travels from '../services/myServices/TravelPackage.service.js';
import { tokenValidated,requireAgent } from '../services/myServices/Auth.js';
const router = express.Router();

router.post('/', tokenValidated, requireAgent, travels.createBasePackage);
router.get('/:id/options', tokenValidated, requireAgent, travels.fetchOptions);
router.post('/:id/components', tokenValidated, requireAgent, travels.addPackageComponent);
router.get('/:id', travels.findOne);
router.put('/:id', tokenValidated, requireAgent, travels.update);
router.delete('/:id', tokenValidated, requireAgent, travels.remove);

export default app =>{
    app.use ('/travel-packages', router);
} 