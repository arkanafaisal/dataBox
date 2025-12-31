import express from 'express';

import userController from '../controller/userController.js';
import jwtVerify from '../middleware/jwtVerify.js';
import rateLimiting from '../middleware/rateLimiting.js';

const userRouter = express.Router();
// userRouter.use('/', (req, res, next)=>{
//     console.log('users endpoint hit')
//     next()
// });

userRouter.post('/me',                      rateLimiting("getData", 1, 30),             jwtVerify,  userController.getMe);
userRouter.get('/search/:username',         rateLimiting("searchUsername", 1, 15),                  userController.checkUsernameExist)


userRouter.patch('/username',               rateLimiting("editUsername", 1, 3),         jwtVerify,  userController.editUsername)
userRouter.patch('/public-key',             rateLimiting("editPublicKey", 1, 5),        jwtVerify,  userController.editPublicKey)

userRouter.patch('/email',                  rateLimiting("EditEmail", 15, 3),           jwtVerify,  userController.editEmail)
userRouter.get('/verify-email',             rateLimiting("verifyEmail", 15, 5),                     userController.verifyEmail)

userRouter.post("/reset-password",          rateLimiting("resetPassword", 15, 3),       jwtVerify,  userController.resetPassword)
userRouter.post("/verify-reset-password",   rateLimiting("verifyResetPassword", 15, 5),             userController.verifyResetPassword)





export default userRouter;