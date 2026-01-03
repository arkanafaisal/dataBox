import jwt from 'jsonwebtoken';
import { response } from '../utils/response.js';

export default async function verifyToken(req, res, next) {
    const accessToken = req.cookies.accessToken
    if (!accessToken) {return response(res, false, "token invalid", null, 40101)}

    try{
        const decoded = await jwt.verify(accessToken, process.env.JWT_SECRET)
        req.user = decoded
        next();
    } catch(err){
        if(err.name === 'TokenExpiredError'){return response(res, false, 'token expired', null, 40101)}
        else if(err.name === 'JsonWebTokenError'){return response(res, false, 'token invalid', null, 40101)}
        else{return response(res, false, 'could not verify token', null, 40101)}
    }      
}

