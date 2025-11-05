import express from "express";
import * as users from"../controllers/pokemon.controller.js";

const router = express.Router();

router.post('/', users.create);
router.get('/', users.findAll);
router.get('/:id', users.findOne);
router.put('/:id', users.update);
router.delete('/:id', users.remove);

export default app =>{
    app.use ('/users', router);
}