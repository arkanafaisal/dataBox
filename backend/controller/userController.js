import crypto from "crypto"
import bcrypt from "bcrypt"

import * as userSchema from '../schema/user-schema.js'
import * as UserModel from '../model/user-model.js'
import * as redisHelper from '../utils/redis-helper.js'

import { response } from "../utils/response.js"; 
import { validate } from '../utils/validate.js';
import { sendMail } from "../utils/email.js";

const userController = {}

userController.getMe = async (req, res)=> {
    try{
        const {ok, data} = await redisHelper.get('cache', `profileData:${req.user.id}`)
        if(ok){return response(res, true, 'profile retrieved', data)}

        const user = await UserModel.getMyProfile({id: req.user.id})
        if(!user){return response(res, false, 'user not found, please do refresh', null, 40101)}

        await redisHelper.set('cache', `profileData:${req.user.id}`, user)

        return response(res, true, 'profile retrieved', user)
    } catch(err) {
        console.log(err)
        return response(res, false, "server error", null, 500)
    }
}

userController.checkUsernameExist = async (req, res) => {
    const {ok, message, value: username} = validate(userSchema.username, req.params.username)
    if(!ok){return response(res, false, message)}

    try {
        const isExist = await UserModel.validateUsername({username})
        if(!isExist) return response(res, false, "user not found")

        return response(res, true, "user found", username)
    } catch(err) {
        console.log(err)
        return response(res, false, "server error", null, 500)
    }
}

userController.editUsername = async (req, res) => {
    const {ok, message, value: userRequest} = validate(userSchema.editUsername, req.body)
    if(!ok){return response(res, false, message)}

    try{
        const user = await UserModel.getUsernamePasswordById({id: req.user.id})
        if(!user){return response(res, false, "user not found, please do refresh", null, 40101)}
        if(user.username === userRequest.newUsername) return response(res, false, "there's nothing to change")

        const isPasswordValid = await bcrypt.compare(userRequest.password, user.password)
        if(!isPasswordValid) return response(res, false, 'wrong password')

        const {affectedRows, changedRows} = await UserModel.updateUsername({username: userRequest.newUsername, id: req.user.id})
        if(affectedRows === 0){return response(res, false, "user not found, please do refresh", null, 40101)}
        if(changedRows === 0){return response(res, false, "there's nothing to change")}

        await redisHelper.del('cache', `profileData:${req.user.id}`)
        await redisHelper.del('cache', `publicData:${req.user.id}`)

        return response(res, true, 'username changed', userRequest.newUsername)
    } catch(err){
        if(err.msg === 'duplicate'){return response(res, false, 'username taken')}
        return response(res, false, 'server error', null, 500)
    }
}

userController.editPublicKey = async (req, res) => {
    const {ok, message, value: newPublicKey} = validate(userSchema.publicKey, req.body.newPublicKey)
    if(!ok){return response(res, false, message)}
    
    try{
        const {affectedRows, changedRows} = await UserModel.updatePublicKey({newPublicKey, id: req.user.id})
        if(affectedRows === 0) return response(res, false, "user not found, please do refresh", null, 40101)
        if(changedRows === 0) return response(res, false, "there's nothing to change")
            
        await redisHelper.del('cache', `profileData:${req.user.id}`)
        await redisHelper.del('cache', `publicData:${req.user.id}`)
        
        return response(res, true, 'public key changed', newPublicKey)
    } catch(err) {
        console.log(err)
        return response(res, false, "server error", null, 500)
    }
}

userController.editEmail = async (req, res) => {
    const {ok, message, value: userRequest} = await validate(userSchema.editEmail, req.body)
    if(!ok){return response(res, false, message)}

    try{
        const isExist = await UserModel.validateEmail({newEmail: userRequest.newEmail})
        if(isExist) return response(res, false, "email already taken")
        
        const user = await UserModel.getEmailPasswordById({id: req.user.id})
        if(!user){return response(res, false, "user not found, please do refresh", null, 40101)}
        if(user.email === userRequest.newEmail) return response(res, false, "there's nothing to change")

        const isPasswordValid = await bcrypt.compare(userRequest.password, user.password)
        if(!isPasswordValid) return response(res, false, "incorrect password")
        

        const token = crypto.randomBytes(32).toString('hex')
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

        const {ok: ok2} = await redisHelper.set('verify_email', tokenHash, {user_id: req.user.id, new_email: userRequest.newEmail})
        if(!ok2){return response(res, false, "failed to generate email verification link, please try again")}

        await sendMail.verifyEmail({newEmail: userRequest.newEmail, token})

        return response(res, true, "verification email has been sent to " + userRequest.newEmail)
    } catch(err){
        console.log(err)
        return response(res, false, "server error", null, 500)
    }
}

userController.verifyEmail = async (req, res) => {
    const {ok, value: token} = validate(userSchema.token, req.query.token)
    if(!ok){return response(res, false, 'invalid or expired link verification')}

    try{
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

        const {ok:ok2, data: tokenPayload} = await redisHelper.get('verify_email', tokenHash)
        if(!ok2){return response(res, false, "invalid or expired link verification")}

        const {changedRows} = await UserModel.updateEmail({newEmail: tokenPayload.new_email, userId: tokenPayload.user_id})
        if(changedRows === 0) return response(res, false, "there's nothing to change")

        await redisHelper.del('cache', `profileData:${tokenPayload.user_id}`)
        await redisHelper.del('verify_email', tokenHash)

        return response(res, true, "success, your account email changed to " + tokenPayload.new_email)
    } catch(err){
        if(err.msg === 'duplicate'){return response(res, false, "email already taken")}
        console.log(err)
        return response(res, false, "server error", null, 500)
    }
}

userController.resetPassword = async (req, res) => {
    try {
        const user = await UserModel.getEmailById({id: req.user.id})
        if(!user){return response(res, false, "user not found, please do refresh", null, 40101)}
        if(!user.email) return response(res, false, "you don't have registered email")

        const token = crypto.randomBytes(32).toString('hex')
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

        const {ok: ok2} = await redisHelper.set('reset_password', tokenHash, {user_id: req.user.id})
        if(!ok2){return response(res, false, "failed to generate reset password link, please try again")}

        await sendMail.resetPassword({email: user.email, token})

        return response(res, true, "verification email has been sent to " + user.email)
    } catch(err) {
        console.log(err)
        return response(res, false, "server error", null, 500)
    }
}

userController.verifyResetPassword = async (req, res) => {
    const {ok, value: token} = validate(userSchema.token, req.query.token)
    if(!ok){return response(res, false, 'invalid or expired link verification')}

    try {
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

        const {ok:ok2, data: tokenPayload} = await redisHelper.get('reset_password', tokenHash)
        if(!ok2){return response(res, false, "invalid or expired link verification")}

        const {ok, message, value: newPassword} = validate(userSchema.password, req.body.newPassword)
        if(!ok){return response(res, false, message)}

        const {changedRows} = await UserModel.updatePassword({newPassword, userId: tokenPayload.user_id})
        if(changedRows === 0) return response(res, false, "there's nothing to change")

        await redisHelper.del('reset_password', tokenHash)

        return response(res, true, "password changed")

    } catch(err) {
        console.log(err)
        return response(res, false, "server error", null, 500)
    }
}
 
export default userController;