import express from 'express';
import * as package_components from '../services/myServices/packageComponents/BaseComponent.Service.js';
import { tokenValidated } from '../services/myServices/Auth.js';
import { requireAgent } from '../services/myServices/Auth.js';
const router = express.Router();

router.post('/', tokenValidated, requireAgent, package_components.create);

router.put('/:id', tokenValidated, requireAgent, package_components.update);
router.delete('/:id', tokenValidated, requireAgent, package_components.remove);


export default app => {
    app.use('/package-components', router);
}