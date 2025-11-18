import express from 'express';
import * as package_components from '../services/myServices/PackageComponents.service.js';
import { tokenValidated } from '../services/myServices/Auth.js';

const router = express.Router();

router.post('/', tokenValidated, package_components.create);
router.get('/', package_components.findAll);
router.put('/:id', tokenValidated, package_components.update);
router.delete('/:id', tokenValidated, package_components.remove);
router.get('/search/:name', package_components.findOneByName);

export default app => {
    app.use('/package-components', router);
}