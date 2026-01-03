import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config'


const app = express()
app.use(express.json())
app.set('trust proxy', true)
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

app.use(cors({
  origin: process.env.NODE_ENV === "development"? 'http://127.0.0.1:5500' : 'https://databox.arkanafaisal.my.id',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type'],   // opsional, header yg diizinkan
  preflightContinue: false,
  optionsSuccessStatus: 204
}))

const PORT = '3000'
const server = app.listen(PORT, ()=>{console.log(`Server running on port ${PORT}`)})



  

import userRouter from './router/userRouter.js';
import authRouter from './router/authRouter.js';
import dataRouter from './router/dataRouter.js';
app.use('/users', userRouter);
app.use('/auth', authRouter);
app.use('/data', dataRouter);