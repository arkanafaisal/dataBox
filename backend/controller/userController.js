import nodemailer from "nodemailer"
import crypto from "crypto"
import bcrypt from "bcrypt"

import db from "../db.js";
import redis from "../redis.js"
import response from "../response.js"; 
import Joi from "joi";

const userController = {}

userController.getMe = async (req, res)=> {
    const {id} = req.user;
    try{
        const rawData = await redis.get(`databox:cache:profileData:${id}`)
        if(rawData){return response(res, true, "user retrieved", JSON.parse(rawData))}
        const [[user]] = await db.query('SELECT username, email, publicKey FROM users WHERE id = ?', [id]);
        if(!user){return response(res, false, 'user not found')}
        await redis.set(`databox:cache:profileData:${id}`, JSON.stringify(user), {"EX": (60 * 60 * 24)})

        return response(res, true, 'user retrieved', user)
    } catch(err) {
        return response(res, false, 'could not retrieve user', null, err.code)
    }
}

userController.checkUsernameExist = async (req, res) => {
    const {error, value: username} = Joi.string().trim().max(32).required().validate(req.params.username)
    if(error){return response(res, false, error.details[0].message)}

    try {
        const [[user]] = await db.query("SELECT 1 FROM users WHERE username = ?", [username])
        if(!user) return response(res, false, "user not found")

        return response(res, true, "user found", username)
    } catch(err) {
        console.log(err)
        return response(res, false, "server error")
    }
}

userController.editUsername = async (req, res) => {
    const id = req.user.id

    const editUsernameSchema = Joi.object({
        newUsername: Joi.string().trim().max(32).pattern(/^[a-zA-Z0-9]+$/).required(),
        password: Joi.string().trim().max(255).required()
    })
    const {error, value} = editUsernameSchema.validate(req.body)
    if(error){return response(res, false, error.details[0].message)}
    const {newUsername, password} = value

    try{
        const [[user]] =  await db.query('SELECT username, password FROM users WHERE id = ?', [id])
        if(!user){return response(res, false, "user not found")}
        if(user.username === newUsername) return response(res, false, "there's nothing to change")

        const ok = await bcrypt.compare(password, user.password)
        if(!ok) return response(res, false, 'wrong password')
        const [result2] = await db.query('UPDATE users SET username = ? WHERE id = ?', [newUsername, id])
        if(result2.affectedRows === 0){return response(res, false, "update failed")}
        await redis.del(`databox:cache:profileData:${id}`)
        await redis.del(`databox:cache:publicData:${id}`)

        return response(res, true, 'username changed', newUsername)
    } catch(err){
        if(err.code === 'ER_DUP_ENTRY') return response(res, false, 'username taken')
        return response(res, false, 'could not change username')
    }
}

userController.editPublicKey = async (req, res) => {
    const id = req.user.id
    const {error, value: newPublicKey} = Joi.string().trim().max(255).required().validate(req.body.newPublicKey)
    if(error){return response(res, false, error.details[0].message)}
    
    try{
        const [result] = await db.query("UPDATE users SET publicKey = ? WHERE id = ?", [newPublicKey, id])
        if(result.affectedRows === 0) return response(res, false, "user not found")
        if(result.changedRows === 0) return response(res, false, "there's nothing to change")
        await redis.del(`databox:cache:profileData:${id}`)
        
        return response(res, true, 'public key changed', newPublicKey)
    } catch(err) {
        console.log(err)
        return response(res, false, "could not change public key")
    }
}

userController.editEmail = async (req, res) => {
    const id = req.user.id
    const editEmailSchema = Joi.object({
        newEmail: Joi.string().trim().lowercase().email().max(64).required(),
        password: Joi.string().max(255).trim().required()
    })
    const {error, value} = editEmailSchema.validate(req.body)
    if(error){return response(res, false, error.details[0].message)}
    const {newEmail, password} = value

    try{
        const [[existUser]] = await db.query("SELECT id FROM users WHERE email = ?", [newEmail])
        if(existUser) return response(res, false, "email already taken")
        
        const [[user]] = await db.query("SELECT email, password FROM users WHERE (id = ?)", [id])
        if(!user){return response(res, false, "user not exist")}
        if(user.email === newEmail) return response(res, false, "there's nothing to change")
        const ok = await bcrypt.compare(password, user.password)
        if(!ok) return response(res, false, "incorrect password")
        

        const token = crypto.randomBytes(32).toString('hex')
        const tokenHash = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex')

        await redis.set(`databox:verify_email:${tokenHash}`, JSON.stringify({ user_id: id, email: newEmail }), { EX: 900 });

        const link = `https://databox-server.arkanafaisal.my.id/users/verify-email?token=${token}`
        const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }})
        await transporter.sendMail({
            from: 'databox <no-reply@arkanafaisal.my.id>',
            to: newEmail,
            subject: 'Verify your email',
            text: `Verify email:\n${link}`,
            html: `<p>Click to verify:</p><a href="${link}">Verify Email</a>`
        })

        return response(res, true, "verification email has been sent to " + newEmail)
    } catch(err){
        console.log(err)
        return response(res, false, "could not add email")
    }
}

userController.verifyEmail = async (req, res) => {
    const {error, value: token} = Joi.string().trim().lowercase().length(64).hex().required().validate(req.query.token)
    if(error){return response(res, false, 'invalid or expired token')}

    const tokenHash = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex')

    try{
        const data = await redis.get(`databox:verify_email:${tokenHash}`);
        if (!data) return response(res, false, "invalid or expired link verification");
        const tokenData = JSON.parse(data)

        const [result] = await db.query("UPDATE users SET email = ? WHERE id = ?", [tokenData.email, tokenData.user_id])
        if(result.affectedRows === 0) return response(res, false, "failed to register email")

        await redis.del(`databox:verify_email:${tokenHash}`)
        await redis.del(`databox:cache:profileData:${tokenData.user_id}`)

        return response(res, true, "email verified, please reload")
    } catch(err){
        if(err.code === "ER_DUP_ENTRY"){return response(res, false, "email already taken")}
        console.log(err)
        return response(res, false, "could not verify email")
    }
}

userController.resetPassword = async (req, res) => {
    const id = req.user.id

    try {
        const [[user]] = await db.query("SELECT email FROM users WHERE id = ?", [id])
        if(!user || (user && !user.email)) return response(res, false, "you don't have registered email")

        const token = crypto.randomBytes(32).toString('hex')
        const tokenHash = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex')

        await redis.set(`databox:reset_password:${tokenHash}`, JSON.stringify({ user_id: id}), { EX: 900 });

        const link = `https://databox.arkanafaisal.my.id/src/reset-password/?token=${token}`
        const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }})
        await transporter.sendMail({
            from: 'databox <no-reply@arkanafaisal.my.id>',
            to: user.email,
            subject: 'Reset your password',
            text: `reset password:\n${link}`,
            html: `<p>Click to reset password:</p><a href="${link}">Reset Password</a>`
        })

        return response(res, true, "reset password link sent")
    } catch(err) {
        console.log(err)
        return response(res, false, "could not generate reset password link")
    }
}

userController.verifyResetPassword = async (req, res) => {
    const {error: tokenError, value: token} = Joi.string().trim().lowercase().length(64).hex().required().validate(req.query.token)
    if(tokenError){return response(res, false, 'invalid or expired token')}

    const tokenHash = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex')
    
    try {
        const data = await redis.get(`databox:reset_password:${tokenHash}`)
        if(!data) return response(res, false, "invalid or expired token")
        const tokenData = JSON.parse(data)
        
        const {error: newPasswordError, value: newPassword} = Joi.string().trim().max(255).required().validate(req.body.newPassword)
        if(newPasswordError){return response(res, false, newPasswordError.details[0].message)}

        const hash = await bcrypt.hash(newPassword, 10)
        const [result] = await db.query("UPDATE users SET password = ? WHERE id = ?", [hash, tokenData.user_id])
        if(result.affectedRows === 0) return response(res, false, "user doesnt exist")
        
        await redis.del(`databox:reset_password:${tokenHash}`)
        return response(res, true, "password changed")
    } catch(err) {
        console.log(err.code)
        return response(res, false, "could not reset password")
    }
}
 
export default userController;