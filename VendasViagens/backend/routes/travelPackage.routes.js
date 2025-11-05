import express from "express";
import * as travels from"../controllers/pokemon.controller.js";

const router = express.Router();

router.post('/', travelPackages.create);
router.get('/', travelPackages.findAll);
router.get('/:id', travelPackages.findOne);
router.put('/:id', travels.update)
router.delete('/:id', travels.remove)

export default app =>{
    app.use ('/travel-packages', router);
}