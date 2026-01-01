import express from 'express';

import jwtVerify from '../middleware/jwtVerify.js';
import dataController from '../controller/dataController.js';
import rateLimiting from '../middleware/rateLimiting.js';

const dataRouter = express.Router();
// dataRouter.use('/', (req, res, next) => {
//     console.log('data endpoint hit');
//     next();
// })

dataRouter.post('/add',                 rateLimiting('addData', 1, 30),         jwtVerify,  dataController.addData)
dataRouter.get('/me',                   rateLimiting('getMyData', 1, 120),      jwtVerify,  dataController.getMyData)
dataRouter.delete('/delete/:id',        rateLimiting('deleteData', 1, 30),      jwtVerify,  dataController.deleteData)
dataRouter.post('/update/access/:id',   rateLimiting('updateAccess', 1, 60),    jwtVerify,  dataController.updateAccess)
dataRouter.patch('/edit/:id',           rateLimiting('updateData', 1, 30),      jwtVerify,  dataController.updateData)
dataRouter.post('/profile/:username',   rateLimiting('getPublicData', 1, 120),              dataController.getPublicData)


export default dataRouter;