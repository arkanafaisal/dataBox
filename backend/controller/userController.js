import response from "../response.js";
import db from "../db.js";


const userController = {}

userController.getMe = async (req, res)=>{
    const {id, username} = req.user;
    try{
        const [result] = await db.query('SELECT id, username, email FROM users WHERE id = ?', [id]);
        if(result.length === 0){return response(res, false, 'user not found')}
        return response(res, true, 'user retrieved', result[0])
    } catch(err) {
        return response(res, false, 'could not retrieve user', null, err.code)
    }
}

export default userController;