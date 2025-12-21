import response from "../response.js";
import db from "../db.js";
import nodemailer from "nodemailer"
import crypto from "crypto"


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

userController.editUsername = async (req, res) => {
    const id = req.user.id
    const {newUsername, password} = req.body

    if(!newUsername || !password) return response(res, false, 'missing input')
    if(newUsername.length > 32 || password.length > 255) return response(res, false, 'invalid input length')
    if(typeof newUsername !== 'string' || typeof password !== 'string') return response(res, false, 'invalid input type')

    try{
        const [[result1]] =  await db.query('SELECT username, password FROM users WHERE id = ?', [id])
        if(result1.username === newUsername) return response(res, false, "there's nothing to change")
        if(result1.password !== password) return response(res, false, 'wrong password')
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
        console.log(existUser)
        
        const [result] = await db.query("SELECT email FROM users WHERE (id = ? AND password = ?)", [id, password])
        if(result.length === 0) return response(res, false, "wrong password")
        if(result[0].email === newEmail) return response(res, false, "there's nothing to change")
        

        const token = crypto.randomBytes(32).toString('hex')
        const tokenHash = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex')
        await db.query(`INSERT INTO user_tokens (user_id, token, type, email, expires_at) VALUES (?, ?, 'verify_email', ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE))`, [id, tokenHash, newEmail])

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
        const [result] = await db.query("SELECT user_id, type, email FROM user_tokens WHERE (token = ? AND expires_at > NOW())", [tokenHash])
        if(result.length === 0) return response(res, false, "invalid or expired link verification")
        if(result[0].type !== "verify_email") return response(res, false, "invalid link type")
        
        const [result2] = await db.query("UPDATE users SET email = ? WHERE id = ?", [result[0].email, result[0].user_id])
        if(result2.affectedRows === 0) return response(res, false, "failed to register email")

        const [result3] = await db.query("DELETE FROM user_tokens WHERE token = ?", [tokenHash])
        return res.send("email verified, please reload")
    } catch(err){
        console.log(err)
        return response(res, false, "could not verify email")
    }
}

export default userController;