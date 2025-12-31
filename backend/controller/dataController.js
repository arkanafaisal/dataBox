import Joi from 'joi';
import db from '../db.js';
import response from '../response.js';
import redis from '../redis.js';


const dataController = {};

dataController.addData = async (req, res) => {
    const insertDataSchema = Joi.object({
        title: Joi.string().trim().max(16).required(),
        body: Joi.string().max(1024).required()
    })
    const {error, value} = insertDataSchema.validate(req.body)
    if(error){return response(res, false, error.details[0].message)}
    try{
        const [result] = await db.query('INSERT INTO userData (user_id, title, body) VALUES (?, ?, ?)', [req.user.id, value.title, value.body])
        await redis.del(`databox:cache:userData:${req.user.id}`)

        return response(res, true, 'data added successfully', {id: result.insertId, title: value.title, body: value.body, access:'private'})
    } catch(err) {
        return response(res, false, 'could not add data')
    }
}

dataController.getMyData = async (req, res) => {
    try{
        const rawData = await redis.get(`databox:cache:userData:${req.user.id}`)
        if(rawData){return response(res, true, "retrieved data successfully", JSON.parse(rawData))}
        const [result] = await db.query('SELECT id, title, body, access FROM userData WHERE user_id = ?', [req.user.id])
        await redis.set(`databox:cache:userData:${req.user.id}`, JSON.stringify(result), {"EX": 600})

        return response(res, true,'retrieved data successfully', result)
    } catch(err) {
        return response(res, false, 'could not retrieve data')
    }
}

dataController.deleteData = async (req, res) => {
    const dataIdSchema = Joi.number().integer().positive().required()
    const {error, value} = dataIdSchema.validate(req.params.id)
    if(error){return response(res, false, error.details[0].message)}
    try{
        const [result] = await db.query('DELETE FROM userData WHERE id = ? AND user_id = ?', [value, req.user.id])
        if(result.affectedRows === 0){return response(res, false, 'data not found')}
        await redis.del(`databox:cache:userData:${req.user.id}`)
        await redis.del(`databox:cache:publicData:${req.user.id}`)
        
        return response(res, true, 'data deleted successfully')
    } catch(err) {
        return response(res, false, 'could not delete data')
    }
}

dataController.updateAccess = async (req, res) => {
    const dataIdSchema = Joi.number().integer().positive().required()
    const {error, value} = dataIdSchema.validate(req.params.id)
    if(error){return response(res, false, error.details[0].message)}
    try{
        const [result] = await db.query(`UPDATE userData SET access = IF(access = 'public', 'private', 'public') WHERE id = ? AND user_id = ?`, [value, req.user.id])
        if(result.affectedRows === 0){return response(res, false, 'data not found')}
        await redis.del(`databox:cache:userData:${req.user.id}`)
        
        const [[newDataAccess]] = await db.query('SELECT access FROM userData WHERE id = ? AND user_id = ?', [value, req.user.id])
        if(!newDataAccess){return response(res, false, "data not found")}
        await redis.del(`databox:cache:publicData:${req.user.id}`)
        return response(res, true, 'access updated successfully', newDataAccess.access)
    } catch(err) {
        return response(res, false, 'could not update access')
    }
}

dataController.updateData = async (req, res) => {
    const dataIdSchema = Joi.number().integer().positive().required()
    const {error: dataIdError, value: dataId} = dataIdSchema.validate(req.params.id)
    if(dataIdError){return response(res, false, dataIdError.details[0].message)}

    const updateDataSchema = Joi.object({
        title: Joi.string().trim().max(16).required(),
        body: Joi.string().max(1024).required()
    })
    const {error: updateDataError, value: dataValue} = updateDataSchema.validate(req.body)
    if(updateDataError){return response(res, false, updateDataError.details[0].message)}

    try{
        const [result] = await db.query(`UPDATE userData SET title = ?, body = ? WHERE user_id = ? AND id = ?`, [dataValue.title, dataValue.body, req.user.id, dataId])
        if(result.affectedRows === 0) return response(res, false, 'data not found')
        if(result.changedRows === 0) return response(res, false, "there's nothing to change")
        await redis.del(`databox:cache:userData:${req.user.id}`)
        await redis.del(`databox:cache:publicData:${req.user.id}`)
    
        return response(res, true, 'successfully edit data', {dataId, title: dataValue.title, body: dataValue.body})
        } catch(err){
        return response(res, false, "could not update data")
    }
}

dataController.getPublicData = async (req, res) => {
    const usernameSchema = Joi.string().trim().max(32).required()
    const {error: usernameError, value:username} = usernameSchema.validate(req.params.username)
    if(usernameError){return response(res, false, usernameError.details[0].message)}
    const publicKeySchema = Joi.string().trim().max(255).allow('', null)
    const {error: publicKeyError, value: publicKey} = publicKeySchema.validate(req.body.publicKey)
    if(publicKeyError){return response(res, false, publicKeyError.details[0].message)}
    
    try{
        const [[user]] = await db.query('SELECT id, publicKey FROM users WHERE username = ?', [username])
        if(!user) return response(res, false, 'user is not exist')
        
        if(user.publicKey !== null && publicKey !== user.publicKey) return response(res, false, 'permission denied')
        const rawData = await redis.get(`databox:cache:publicData:${user.id}`)
        if(rawData){return response(res, true, "permission granted", JSON.parse(rawData))}

        const [result2] = await db.query('SELECT title, body FROM userData WHERE user_id = ? AND access = "public" ORDER BY id ASC', [user.id])
        await redis.set(`databox:cache:publicData:${user.id}`, JSON.stringify(result2), {"EX": 600})
        return response(res, true, 'permission granted', result2)
    } catch(err) {
        return response(res, false, 'could not get public data')
    }
}


export default dataController;