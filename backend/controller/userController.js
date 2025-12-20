import response from "../response.js";
import db from "../db.js";


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
        return response(res, true, 'username changed', {newUsername})
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

export default userController;