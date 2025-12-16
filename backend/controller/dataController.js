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
        return response(res, true, 'data added successfully')
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
        if(result.affectedRows === 0){return response(res, 404, false, null, 'data not found')}
        console.log(result[0])
        return response(res, true, 'access updated successfully', result[0].access)
    } catch(err) {
        return response(res, false, 'could not update access', null, err.code)
    }
}


export default dataController;