import express from "express";
import * as travels from"../controller/TravelPackage.controller.js";
import { tokenValidated,requireAgent } from "../controller/Auth.controller.js";

const router = express.Router();

router.post('/', tokenValidated, requireAgent, travels.create);
router.get('/', travels.findAll);
router.get('/:id', travels.findOne);
router.put('/:id', tokenValidated, requireAgent, travels.update);
router.delete('/:id', tokenValidated, requireAgent, travels.remove);

export default app =>{
    app.use ('/travel-packages', router);
} 