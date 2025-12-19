import db from '../db.js';
import response from '../response.js';


const dataController = {};

dataController.addData = async (req, res) => {
    const { title, body } = req.body;
    if(!title || !body){return response(res, 400, false, null, 'please fill all fields')}
    if(title.length > 16 || body.length > 1024){return response(res, 400, false, null, 'invalid input length')}
    if(typeof title !== 'string' || typeof body !== 'string'){return response(res, 400, false, null, 'invalid input type')}
    try{
        const [result] = await db.query('INSERT INTO userData (user_id, title, body) VALUES (?, ?, ?)', [req.user.id, title, body])
        return response(res, true, 'data added successfully', {id: result.insertId, title, body, access:'private'})
    } catch(err) {
        return response(res, false, 'could not add data', null, err.code)
    }
}

dataController.getMyData = async (req, res) => {
    try{
        const [result] = await db.query('SELECT id, title, body, access FROM userData WHERE user_id = ?', [req.user.id])
        return response(res, true,'retrieved data successfully', result)
    } catch(err) {
        return response(res, false, 'could not retrieve data', null, err.code)
    }
}

dataController.deleteData = async (req, res) => {
    const dataId = req.params.id;
    if(!dataId){return response(res, 400, false, null, 'missing data id')}
    try{
        const [result] = await db.query('DELETE FROM userData WHERE id = ? AND user_id = ?', [dataId, req.user.id])
        if(result.affectedRows === 0){return response(res, 404, false, null, 'data not found')}
        return response(res, true, 'data deleted successfully')
    } catch(err) {
        return response(res, false, 'could not delete data', null, err.code)
    }
}

dataController.updateAccess = async (req, res) => {
    const dataId = req.params.id;
    if(!dataId){return response(res, 400, false, null, 'missing data id')}
    try{
        const [result] = await db.query(`UPDATE userData SET access = IF(access = 'public', 'private', 'public') WHERE id = ? AND user_id = ?`, [dataId, req.user.id])
        if(result.affectedRows === 0){return response(res, false, 'data not found')}
        
        const [[newDataAccess]] = await db.query('SELECT access FROM userData WHERE id = ? AND user_id = ?', [dataId, req.user.id])
        return response(res, true, 'access updated successfully', newDataAccess.access)
    } catch(err) {
        return response(res, false, 'could not update access', null, err.code)
    }
}

dataController.updateData = async (req, res) => {
    const id = req.params.id
    const { title, body } = req.body
    if(!id || !title || !body) return response(res, false, 'missing field')
    if(title.length > 16 || body.length > 1024) return response(res, false, 'invalid input length')
    if(typeof title !== 'string' || typeof body !== 'string') return response(res, false, 'invalid input type')

    try{
        const [result] = await db.query(`UPDATE userData SET title = ?, body = ? WHERE user_id = ? AND id = ?`, [title, body, req.user.id, id])
        if(result.affectedRows === 0) return response(res, false, 'data not found')
        if(result.changedRows === 0) return response(res, false, 'theres nothing to change')
        console.log(999)
        return response(res, true, 'successfully edit data', {title, body})
        } catch(err){
        return response(res, false, "could not update data", null, err.code)
    }
}

dataController.getPublicData = async (req, res) => {
    const username  = req.params.username
    const publicKey = req.body.publicKey
    if(!username || !publicKey) return response(res, false, 'missing input')
    if(username.length > 32 || publicKey.length > 255) return response(res, false, 'invalid input length')
    if(typeof username !== 'string' || typeof publicKey !== 'string') return response(res, false, 'invalid input type')
    try{
        const [result1] = await db.query('SELECT id, publicKey FROM users WHERE username = ?', [username])
        if(result1.length === 0) return response(res, false, 'user is not exist')
        if(result1[0].publicKey !== null && result1[0].publicKey !== publicKey) return response(res, false, 'permission denied')
        const [result2] = await db.query('SELECT title, body FROM userData WHERE user_id = ? AND access = "public" ORDER BY id ASC', [result1[0].id])
        return response(res, true, 'permission granted', result2)
    } catch(err) {
        return response(res, false, 'could not get public data')
    }
}


export default dataController;