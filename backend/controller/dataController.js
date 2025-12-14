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
        return response(res, 200, true, 'data added successfully')
    } catch(err) {
        return response(res, 500, false, null, 'could not add data', err.code)
    }
}

dataController.getMyData = async (req, res) => {
    try{
        const [result] = await db.query('SELECT id, title, body, access FROM userData WHERE user_id = ?', [req.user.id])
        return response(res, 200, true, result)
    } catch(err) {
        return response(res, 500, false, null, 'could not retrieve data', err.code)
    }
}


export default dataController;