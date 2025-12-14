import express from 'express';

import userController from '../controller/userController.js';
import jwtVerify from '../middleware/jwtVerify.js';

const userRouter = express.Router();
userRouter.use('/', (req, res, next)=>{
    console.log('users endpoint hit')
    next()
});

userRouter.post('/me', jwtVerify, userController.getMe);



export default userRouter;