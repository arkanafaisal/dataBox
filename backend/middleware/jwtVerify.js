import jwt from 'jsonwebtoken';
import response from '../response.js';

export default async function verifyToken(req, res, next) {

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'unauthorized' });
    try{
        const decoded = await jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        next();
    } catch(err){
        if(err.name === 'TokenExpiredError'){return response(res, false, 'token expired')}
        else if(err.name === 'JsonWebTokenError'){return response(res, false, 'invalid token')}
        else{return response(res, false, 'could not verify token')}
    }      
}

