import express from "express";
import * as travels from '../services/myServices/TravelPackage.service.js';
import { tokenValidated,requireAgent } from '../services/myServices/Auth.js';
const router = express.Router();
//criair pacote base para retornar id e selecionar os componentes
router.post('/', tokenValidated, requireAgent, travels.createBasePackage);
router.get('/', tokenValidated, travels.findAll);
//buscar opcoes de componentes para o pacote
router.get('/:id/options', tokenValidated, requireAgent, travels.fetchOptions);

router.get('/:id', travels.findOne);
router.put('/:id', tokenValidated, requireAgent, travels.update);
router.delete('/:id', tokenValidated, requireAgent, travels.remove);

export default app =>{
    app.use ('/travel-packages', router);
}