import jwt from 'jsonwebtoken';
import response from '../response.js';

export default async function verifyToken(req, res, next) {
    const accessToken = req.cookies.accessToken
    if (!accessToken) {return response(res, false, "token invalid")}

    try{
        const decoded = await jwt.verify(accessToken, process.env.JWT_SECRET)
        req.user = decoded
        next();
    } catch(err){
        if(err.name === 'TokenExpiredError'){return response(res, false, 'token expired')}
        else if(err.name === 'JsonWebTokenError'){return response(res, false, 'token invalid')}
        else{return response(res, false, 'could not verify token')}
    }      
}

