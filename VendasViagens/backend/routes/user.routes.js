import express from "express";
import * as users from"../services/myServices/User.service.js";

const router = express.Router();


router.get('/', users.findAll);
router.get('/:id', users.findOne);
router.put('/:id', users.update);
router.delete('/:id', users.remove);
router.get('/search/:name', users.findOneByName);
router.post('/', users.create);
router.post('/register', users.register);
export default app =>{
    app.use ('/users', router);
}