import express from "express";
import * as users from"../controller/User.controller.js";

const router = express.Router();


router.get('/', users.findAll);


export default app =>{
    app.use ('/users', router);
}