import express from 'express';
import cors from 'cors';


const app = express();
app.use(express.json());
app.use(cors({
    origin: '*',
    credentials: true,
}))

const PORT = '3000'
const server = app.listen(PORT, ()=>{console.log(`Server running on port ${PORT}`)})



  

import userRouter from './router/userRouter.js';
import authRouter from './router/authRouter.js';
import dataRouter from './router/dataRouter.js';
app.use('/users', userRouter);
app.use('/auth', authRouter);
app.use('/data', dataRouter);