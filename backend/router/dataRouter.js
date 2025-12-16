import express from 'express';
import jwtVerify from '../middleware/jwtVerify.js';
import dataController from '../controller/dataController.js';

const dataRouter = express.Router();
dataRouter.use('/', (req, res, next) => {
    console.log('data endpoint hit');
    next();
})

dataRouter.post('/add', jwtVerify, dataController.addData)
dataRouter.get('/me', jwtVerify, dataController.getMyData)
dataRouter.delete('/delete/id', jwtVerify, dataController.deleteData)
dataRouter.post('/update/access/id', jwtVerify, dataController.updateAccess)

export default dataRouter;