import express from "express";
import * as users from"../controller/User.controller.js";

const router = express.Router();


router.get('/', users.findAll);
router.get('/:id', users.findOne);
router.put('/:id', users.update);
router.delete('/:id', users.remove);
router.get('/search/:name', users.findOneByName);
export default app =>{
    app.use ('/users', router);
}