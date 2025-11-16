import express from "express";
import * as travels from"../controller/TravelPackage.controller.js";
import { tokenValidated } from "../controller/Auth.controller.js";

const router = express.Router();

router.post('/', tokenValidated, travels.create);
router.get('/', travels.findAll);
router.get('/:id', travels.findOne);
router.put('/:id', travels.update);
router.delete('/:id', travels.remove);

export default app =>{
    app.use ('/travel-packages', router);
} 