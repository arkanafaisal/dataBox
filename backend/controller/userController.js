import nodemailer from "nodemailer"
import crypto from "crypto"
import bcrypt from "bcrypt"

import db from "../db.js";
import redis from "../redis.js"
import response from "../response.js"; 

const userController = {}

userController.getMe = async (req, res)=> {
    const {id, username} = req.user;
    try{
        const [result] = await db.query('SELECT username, email, publicKey FROM users WHERE id = ?', [id]);
        if(result.length === 0){return response(res, false, 'user not found')}
        return response(res, true, 'user retrieved', result[0])
    } catch(err) {
        return response(res, false, 'could not retrieve user', null, err.code)
    }
}

userController.getByUsername = async (req, res) => {
    const username = req.params.username
    
    if(!username) return response(res, false, 'missing input')
    if(username.length > 32) return response(res, false, 'invalid input length')
    if(typeof username !== 'string') return response(res, false, 'invalid input type')

    try {
        const [result] = await db.query("SELECT publicKey FROM users WHERE username = ?", [username])
        if(result.length === 0) return response(res, false, "user not found")

        return response(res, true, "user found", username)
    } catch(err) {
        
    }
}



userController.editUsername = async (req, res) => {
    const id = req.user.id
    const {newUsername, password} = req.body

    if(!newUsername || !password) return response(res, false, 'missing input')
    if(newUsername.length > 32 || password.length > 255) return response(res, false, 'invalid input length')
    if(typeof newUsername !== 'string' || typeof password !== 'string') return response(res, false, 'invalid input type')

    try{
        const [[result1]] =  await db.query('SELECT username, password FROM users WHERE id = ?', [id])
        if(result1.username === newUsername) return response(res, false, "there's nothing to change")
        const ok = await bcrypt.compare(password, result1.password)
        if(!ok) return response(res, false, 'wrong password')
        const [result2] = await db.query('UPDATE users SET username = ? WHERE id = ?', [newUsername, id])
        return response(res, true, 'username changed', newUsername)
    } catch(err){
        if(err.code === 'ER_DUP_ENTRY') return response(res, false, 'username taken')
        return response(res, false, 'could not change username')
    }
}

userController.editPublicKey = async (req, res) => {
    const id = req.user.id
    const newPublicKey = req.body.newPublicKey

    if(!newPublicKey) return response(res, false, 'missing input')
    if(newPublicKey.length > 255) return response(res, false, 'invalid input length')
    if(typeof newPublicKey !== 'string') return response(res, false, 'invalid input type')

    try{
        const [result] = await db.query("UPDATE users SET publicKey = ? WHERE id = ?", [newPublicKey, id])
        if(result.affectedRows === 0) return response(res, false, "user not found")
        if(result.changedRows === 0) return response(res, false, "there's nothing to change")
        
        return response(res, true, 'public key changed', newPublicKey)
    } catch(err) {
        console.log(err)
        return response(res, false, "could not change public key")
    }
}

userController.editEmail = async (req, res) => {
    const id = req.user.id
    const {newEmail, password} = req.body
    
    if(!newEmail || !password) return response(res, false, 'missing input')
    if(newEmail.length > 64 || password.length > 255) return response(res, false, 'invalid input length')
    if(typeof newEmail !== 'string' || typeof password !== 'string') return response(res, false, 'invalid input type')

    try{
        const [existUser] = await db.query("SELECT id FROM users WHERE email = ?", [newEmail])
        if(existUser.length !== 0) return response(res, false, "email already taken")
        
        const [result] = await db.query("SELECT email, password FROM users WHERE (id = ?)", [id])
        if(result.length === 0) return response(res, false, "user not exist")
        const ok = await bcrypt.compare(password, result[0].password)
        if(!ok) return response(res, false, "incorrect password")
        if(result[0].email === newEmail) return response(res, false, "there's nothing to change")
        

        const token = crypto.randomBytes(32).toString('hex')
        const tokenHash = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex')

        await redis.set("databox:" + tokenHash, JSON.stringify({ user_id: id, email: newEmail, type: "verify_email" }), { EX: 900 });

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
    const token = req.query.token
    const tokenHash = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex')

    try{
        const data = await redis.get("databox:" + tokenHash);
        if (!data) return response(res, false, "invalid or expired link verification");
        const tokenData = JSON.parse(data);
        if (tokenData.type && tokenData.type !== "verify_email") return response(res, false, "invalid link type");

        const [result2] = await db.query("UPDATE users SET email = ? WHERE id = ?", [tokenData.email, tokenData.user_id])
        if(result2.affectedRows === 0) return response(res, false, "failed to register email")

        await redis.del(tokenHash);
        return res.send("email verified, please reload")
    } catch(err){
        console.log(err)
        return response(res, false, "could not verify email")
    }
}

userController.resetPassword = async (req, res) => {
    const id = req.user.id

    try {
        const [[result]] = await db.query("SELECT email FROM users WHERE id = ?", [id])
        if(!result) return response("you don't have registered email")

        const token = crypto.randomBytes(32).toString('hex')
        const tokenHash = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex')

        await redis.set("databox:" + tokenHash, JSON.stringify({ user_id: id, email: result.email, type:"reset_password"}), { EX: 900 });

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
            to: result.email,
            subject: 'Verify your email',
            text: `Verify email:\n${link}`,
            html: `<p>Click to verify:</p><a href="${link}">Verify Email</a>`
        })

        return response(res, true, "reset password link sent")
    } catch(err) {
        console.log(err)
        return response(res, false, "could not generate reset password link")
    }
}

userController.verifyResetPassword = async (req, res) => {
    const token = req.query.token
    if(!token) return response(res, false, "unauthorized")

    const tokenHash = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex')
    
    try {
        const data = await redis.get("databox:" + tokenHash)
        if(!data) return response(res, false, "invalid or expired token")
        const tokenData = await JSON.parse(data)
        if(tokenData.type && tokenData.type !== "reset_password") return response(res, false, "invalid token type")
        
        const newPassword = req.body.newPassword
        if(!newPassword) return response(res, false, "missing new password")
        if(newPassword.length > 255) return response(res, false, "invalid input length")
        if(typeof newPassword !== "string") return response(res, false, "invalid input type")

        const hash = await bcrypt.hash(newPassword, 10)
        const [result] = await db.query("UPDATE users SET password = ? WHERE id = ?", [hash, tokenData.user_id])
        if(result.affectedRows === 0) return response(res, false, "user doesnt exist")
        if(result.changedRows === 0) return response(res, false, "its your old password")
        
        await redis.del(tokenHash)
        return response(res, true, "password changed")
    } catch(err) {
        console.log(err.code)
        return response(res, false, "could not reset password", null, err.code)
    }
}
 
export default userController;