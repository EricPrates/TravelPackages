import express from "express";
import * as users from"../services/myServices/User.service.js";
import { tokenValidated } from '../services/myServices/Auth.js';

const router = express.Router();

// Rotas específicas ANTES das genéricas
router.get('/search', users.findOneByName); // Usa query param: /users/search?name=João
router.post('/register', users.create);      // Registro público

// Rotas genéricas
router.get('/', tokenValidated, users.findAll);
router.get('/:id', tokenValidated, users.findOne);
router.put('/:id', tokenValidated, users.update);
router.delete('/:id', tokenValidated, users.remove);
router.post('/', users.create);

export default app =>{
    app.use ('/users', router);
}