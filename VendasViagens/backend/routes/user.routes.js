import express from "express";
import * as users from"../services/myServices/User.service.js";

const router = express.Router();


router.post('/register', users.register);
router.get('/search/:name', users.findOneByName);
router.get('/', users.findAll);
router.get('/:id', users.findOne);
router.put('/:id', users.update);
router.delete('/:id', users.remove);
export default app =>{
    app.use ('/users', router);
}