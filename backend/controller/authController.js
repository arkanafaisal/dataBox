import jwt from 'jsonwebtoken';
import {randomUUID} from 'crypto'

import * as userSchema from '../schema/user-schema.js'
import * as UserModel from '../model/user-model.js'
import * as redisHelper from '../utils/redis-helper.js'

import { response } from '../utils/response.js';
import { validate } from '../utils/validate.js';

const authController = {}
const sameSite = process.env.NODE_ENV === "development"? 'none' : 'Lax'

const cookieOptions = {
    accessToken: {
        httpOnly: true,
        sameSite,
        secure: true,
        path: '/',
        maxAge: 10* 60 * 1000
    },
    refreshToken: {
        httpOnly: true,
        sameSite,
        secure: true,
        path: '/',
        maxAge: 168 * 60 * 60 * 1000
    }
}


authController.register = async (req, res)=>{
    const {ok, message, value: userRequest} = validate(userSchema.register, req.body)
    if(!ok){return response(res, false, message)}

    try{
        const insertId = await UserModel.register(userRequest)
        if(!insertId){return response(res, false, "register failed")}
        return response(res, true, 'register success')
    } catch(err) {
        if(err.msg === "duplicate"){return response(res, false, "username or email is already taken")}
        console.log(err)
        return response(res, false, 'server error', null, 500)
    }
}

authController.login = async (req, res)=>{
    const {ok, message, value: userRequest} = validate(userSchema.login, req.body)
    if(!ok){return response(res, false, message)}

    try{
        const user = await UserModel.authenticateUser(userRequest)
        if(!user){return response(res, false, 'wrong username, email or password')}
        
        const accessToken = jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: '10m'})
        const refreshToken = randomUUID()

        const {ok: ok2} = await redisHelper.set('tokens', refreshToken, user.id)
        if(!ok2){return response(res, false, 'login failed')}

        res.cookie('accessToken', accessToken, cookieOptions.accessToken)
        res.cookie('refreshToken', refreshToken, cookieOptions.refreshToken)

        return response(res, true, 'login success')
    } catch(err) {
        console.log(err)
        return response(res, false, 'server error', null, 500)
    }
}

authController.logout = async (req, res) => {
    const refreshToken = req.cookies.refreshToken
    if(refreshToken){
        (async () => {
            for(let i = 0; i < 3; i++){
                const {ok} = await redisHelper.del('tokens', refreshToken)
                if(ok) break
                await new Promise(r => setTimeout(r, 500))
            }
        })()
    }

    res.clearCookie("refreshToken", cookieOptions.refreshToken)
    res.clearCookie("accessToken", cookieOptions.accessToken)
    


    return response(res, true, "logout success")
}





authController.refresh = async (req, res) => {
    const refreshToken = req.cookies.refreshToken
    if(!refreshToken){return response(res, false, "please login", null, 401)}
    try {
        const {ok, data: userId} = await redisHelper.get('tokens', refreshToken)
        if(!ok){return response(res, false, "user not found, please try re-log", null, 401)}
        
        const isExist = await UserModel.validateUserId({id: userId})
        if(!isExist){
            (async () => {
                for(let i = 0; i < 3; i++){
                    const {ok} = await redisHelper.del('tokens', refreshToken)
                    if(ok) break
                    await new Promise(r => setTimeout(r, 500))
                }
            })()

            res.clearCookie("refreshToken", cookieOptions.refreshToken)
            res.clearCookie("accessToken", cookieOptions.accessToken)

            return response(res, false, "user not found, please try re-log", null, 401)

        }

        const accessToken = jwt.sign({id: userId}, process.env.JWT_SECRET, {expiresIn: '10m'})
        res.cookie("accessToken", accessToken, cookieOptions.accessToken)

        return response(res, true, "new access token created")
    } catch(err) {
        console.log(err)
        return response(res, false, 'could not verify token, please try re-log', null, 401)
    }
}


export default authController