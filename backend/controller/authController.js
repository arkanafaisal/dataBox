import jwt from 'jsonwebtoken';
import db from '../db.js';
import response from '../response.js';
import bcrypt from "bcrypt"

const authController = {}

authController.register = async (req, res)=>{
    const {username, password} = req.body
    let email = req.body.email
    if(!username || !password){return response(res, false, 'missing fields')}
    if(typeof username !== 'string' || typeof password !== 'string' || (email && typeof email !== 'string')){return response(res, false, 'invalid username or password')}
    if(username.length > 32 || password.length > 255 || (email && email.length > 64)){return response(res, false, 'invalid input length')}
    
    try{
        const [existingUser] = await db.query('SELECT id FROM users WHERE (username = ? OR email = ?)', [username, email])
        if(existingUser.length > 0){return response(res, false, 'username already taken')}

        const hash = await bcrypt.hash(password, 10)
        const [result] = await db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hash]);
        return response(res, true, 'user created')
    } catch(error) {
        console.log(error.code)
        return response(res, false, 'could not create user', null, error.code)
    }
}

authController.login = async (req, res)=>{
    const {usernameOrEmail, password} = req.body;
    if(!usernameOrEmail || !password){return response(res, false, 'missing fields')}
    if(typeof usernameOrEmail !== 'string' || typeof password !== 'string'){return response(res, false, 'invalid username/email or password')}
    if(usernameOrEmail.length > 64 || password.length > 255){return response(res, false, 'invalid input length')}
    try{
        const [result] = await db.query('SELECT id, username, password FROM users WHERE (username = ? OR email = ?)', [usernameOrEmail, usernameOrEmail])
        if(result.length === 0){return response(res, false, 'wrong username, email or password')}
        const ok = await bcrypt.compare(password, result[0].password)
        if(!ok){return response(res, false, 'wrong username, email or password')}
        
        const token = jwt.sign({id: result[0].id, username: result[0].username}, process.env.JWT_SECRET, {expiresIn: '7d'})
        return response(res, true, 'login success', {token})
    } catch(err) {
        return response(res, false, 'could not login', null, err.code)
    }
}


export default authController