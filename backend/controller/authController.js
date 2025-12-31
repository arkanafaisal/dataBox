import jwt from 'jsonwebtoken';
import db from '../db.js';
import response from '../response.js';
import bcrypt from "bcrypt"
import Joi from 'joi';
import redis from '../redis.js';

const authController = {}
const sameSite = 'none'
const secure = true


authController.register = async (req, res)=>{
    const userSchema = Joi.object({
        username: Joi.string().trim().max(32).pattern(/^[a-zA-Z0-9]+$/).required(),
        email: Joi.string().trim().lowercase().email().max(64).allow('', null),
        password: Joi.string().trim().max(255).required()
    })

    const {error, value} = userSchema.validate(req.body)
    if(error){return response(res, false, error.details[0].message)}

    try{
        const hash = await bcrypt.hash(value.password, 10)
        const [result] = await db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [value.username, value.email, hash])
        if(result.affectedRows === 0){return response(res, false, "register error")}
        return response(res, true, 'user created')
    } catch(error) {
        if (error.code === 'ER_DUP_ENTRY') {return response(res, false, "username or email already taken")}
        console.log(error)
        return response(res, false, 'could not create user')
    }
}

authController.login = async (req, res)=>{
    const inputSchema = {
        password: Joi.string().trim().max(255).required()
    }
    if(req.body.usernameOrEmail.includes('@')){
        inputSchema.usernameOrEmail = Joi.string().trim().lowercase().email().max(64).required()
    } else {
        inputSchema.usernameOrEmail = Joi.string().trim().max(32).pattern(/^[a-zA-Z0-9]+$/).required()
    }

    const {error, value} = Joi.object(inputSchema).validate(req.body)
    if(error){return response(res, false, error.details[0].message)}
    const {usernameOrEmail, password} = value
    

    try{
        const [[user]] = await db.query('SELECT id, username, password FROM users WHERE (username = ? OR email = ?)', [usernameOrEmail, usernameOrEmail])
        if(!user){return response(res, false, 'wrong username, email or password')}
        const ok = await bcrypt.compare(password, user.password)
        if(!ok){return response(res, false, 'wrong username, email or password')}
        
        const accessToken = jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: '10m'})
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            sameSite, //secure
            secure, //true
            path: '/',
            maxAge: 10 * 60 * 1000
        })

        const refreshToken = jwt.sign({id: user.id}, process.env.JWT_REFRESHKEY, {expiresIn: '168h'})
        await redis.set(`databox:tokens:${refreshToken}`, "a", {'EX': (60 * 60 * 168)})
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite, //secure
            secure, //true
            path: '/',
            maxAge: 1000 * 60 * 60 * 168
        })
        return response(res, true, 'login success')
    } catch(err) {
        return response(res, false, 'could not login')
    }
}

authController.logout = async (req, res) => {
    try {
        await redis.del(`databox:tokens:${req.cookies.refreshToken}`)
    } catch(err){
        console.log(err)
        return response(res, false, "logout failed")
    }
    res.clearCookie("refreshToken", {
        httpOnly: true,    
        sameSite, 
        path: '/',     
        secure,
    })
    res.clearCookie("accessToken", {
        httpOnly: true,    
        sameSite, 
        path: '/',     
        secure,
    })
    return response(res, true, "logout success")
}





authController.refresh = async (req, res) => {
    const refreshToken = req.cookies.refreshToken
    if(!refreshToken){return response(res, false, "please login")}
    try {
        const rawData = await redis.get(`databox:tokens:${refreshToken}`)
        if(!rawData){return response(res, false, "please try re-log")}
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESHKEY)
        
        const [[user]] = await db.query('SELECT username FROM users WHERE id = ?', [decoded.id])
        if(!user){
            await redis.del(`databox:tokens:${refreshToken}`)
            res.clearCookie("refreshToken", {
                httpOnly: true,
                sameSite,
                secure, 
                path: "/"
            })
            res.clearCookie("accessToken", {
                httpOnly: true,
                sameSite,
                secure, 
                path: "/"
            })
            return response(res, false, "please try re-log")
        }

        const payload = {id: decoded.id, ...user}

        const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '10m'})
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            sameSite,
            secure,
            path: "/"
        })
        return response(res, true, "new access token created")
    } catch(err) {
        if(err.name === 'TokenExpiredError'){return response(res, false, 'please try re-log')}
        else if(err.name === 'JsonWebTokenError'){return response(res, false, 'please login')}
        else{return response(res, false, 'could not verify token')}
    }
}


export default authController