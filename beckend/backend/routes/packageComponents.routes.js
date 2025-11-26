// backend/routes/packageComponents.routes.js

import express from 'express';
import * as factory from '../services/myServices/packageComponents/Factory.Service.js';
import * as baseComponents from '../services/myServices/packageComponents/BaseComponent.Service.js';
import { tokenValidated, requireAgent } from '../services/myServices/Auth.js';

const router = express.Router();

// Criar componente(um por vez)
router.post('/', tokenValidated, requireAgent, factory.createComponent);

// Criar múltiplos componentes (batch)
router.post('/batch', tokenValidated, requireAgent, factory.createComponents);

// Atualizar componente
router.put('/:id', tokenValidated, requireAgent, baseComponents.update);

// Deletar componente
router.delete('/:id', tokenValidated, requireAgent, baseComponents.remove);



export default app => {
    app.use('/package-components', router);
}
