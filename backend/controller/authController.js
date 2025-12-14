import jwt from 'jsonwebtoken';
import db from '../db.js';
import response from '../response.js';


const authController = {}

authController.register = async (req, res)=>{
    const {username, password} = req.body;
    if(!username || !password){return response(res, false, 'missing fields')}
    if(typeof username !== 'string' || typeof password !== 'string'){return response(res, false, 'invalid username or password')}
    if(username.length > 32 || password.length > 255){return response(res, false, 'invalid input length')}
    
    try{
        const [existingUser] = await db.query('SELECT id FROM users WHERE username = ?', [username])
        if(existingUser.length > 0){return response(res, false, 'username already taken')}
        const [result] = await db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, password]);
        return response(res, true, 'user created')
    } catch(error) {
        return response(res, false, 'could not create user', null, error.code)
    }
}

authController.login = async (req, res)=>{
    const {usernameOrEmail, password} = req.body;
    if(!usernameOrEmail || !password){return response(res, false, 'missing fields')}
    if(typeof usernameOrEmail !== 'string' || typeof password !== 'string'){return response(res, false, 'invalid username/email or password')}
    if(usernameOrEmail.length > 64 || password.length > 255){return response(res, false, 'invalid input length')}
    try{
        const [result] = await db.query('SELECT id, username FROM users WHERE (username = ? OR email = ?) AND password = ?', [usernameOrEmail, usernameOrEmail, password]);
        if(result.length === 0){return response(res, false, 'invalid credentials')}

        const token = jwt.sign({id: result[0].id, username: result[0].username}, process.env.JWT_SECRET, {expiresIn: '7d'})
        return response(res, true, 'signed in', {token})
    } catch(err) {
        return response(res, false, 'could not sign in', null, err.code)
    }
}


export default authController