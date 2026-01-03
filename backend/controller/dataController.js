import * as dataSchema from '../schema/data-schema.js'
import * as userSchema from '../schema/user-schema.js'
import * as DataModel from '../model/data-model.js'
import * as UserModel from '../model/user-model.js'
import * as redisHelper from '../utils/redis-helper.js'

import { response } from '../utils/response.js';
import { validate } from '../utils/validate.js';


const dataController = {};

dataController.addData = async (req, res) => {
    const {ok, message, value: userRequest} = validate(dataSchema.insert, req.body)
    if(!ok){return response(res, false, message)}

    try{
        const insertId = await DataModel.insert({userId: req.user.id, ...userRequest})
        if(!insertId){return response(res, false, "failed to add the data")}
        await redisHelper.del('cache', `userData:${req.user.id}`)

        return response(res, true, 'data added successfully', {id: insertId, ...userRequest, access:'private'})
    } catch(err) {
        console.log(err)
        return response(res, false, 'server error', null, 500)
    }
}

dataController.getMyData = async (req, res) => {
    try{
        const {ok, data: cachedUserData} = await redisHelper.get('cache', `userData:${req.user.id}`)
        if(ok){return response(res, true, 'retrieved your data', cachedUserData)}

        const userData = await DataModel.getMyData({userId: req.user.id})
        await redisHelper.set('cache', `userData:${req.user.id}`, userData)

        return response(res, true, 'retrieved your data', userData)
    } catch(err) {
        console.log(err)
        return response(res, false, 'server error', null, 500)
    }
}

dataController.deleteData = async (req, res) => {
    const {ok, message, value: id} = validate(dataSchema.dataId, req.params.id)
    if(!ok){return response(res, false, message)}

    try{
        const affectedRows = await DataModel.remove({id, userId: req.user.id})
        if(affectedRows === 0){return response(res, false, 'data not found, please refresh', null, 40101)}
        
        await redisHelper.del('cache', `userData:${req.user.id}`)
        await redisHelper.del('cache', `publicData:${req.user.id}`)
        
        return response(res, true, 'data deleted successfully')
    } catch(err) {
        console.log(err)
        return response(res, false, 'server error', null, 500)
    }
}

dataController.updateAccess = async (req, res) => {
    const {ok, message, value: id} = validate(dataSchema.dataId, req.params.id)
    if(!ok){return response(res, false, message)}

    try{
        const affectedRows = await DataModel.updateAccess({id, userId: req.user.id})
        if(affectedRows === 0){return response(res, false, 'data not found, please refresh', null, 401)}
        
        await redisHelper.del('cache', `userData:${req.user.id}`)
        await redisHelper.del('cache', `publicData:${req.user.id}`)
        
        const access = await DataModel.getDataAccess({id, userId: req.user.id})
        if(!access){return response(res, true, "access updated but please do refresh", null, 401)}

        return response(res, true, 'access updated successfully', access)
    } catch(err) {
        console.log(err)
        return response(res, false, 'server error', null, 500)
    }
}

dataController.updateData = async (req, res) => {
    const {ok, message, value: id} = validate(dataSchema.dataId, req.params.id)
    if(!ok){return response(res, false, message)}

    const {ok: ok2, message: message2, value: userRequest} = validate(dataSchema.insert, req.body)
    if(!ok2){return response(res, false, message2)}

    try{
        const {affectedRows, changedRows} = await DataModel.updateData({...userRequest, id, userId: req.user.id})
        if(affectedRows === 0) return response(res, false, 'data not found', false, 40101)
        if(changedRows === 0) return response(res, false, "there's nothing to change")
            
        await redisHelper.del('cache', `userData:${req.user.id}`)
        await redisHelper.del('cache', `publicData:${req.user.id}`)
    
        return response(res, true, 'successfully edit data', {id, ...userRequest})
        } catch(err){
        console.log(err)
        return response(res, false, 'server error', null, 500)
    }
}

dataController.getPublicData = async (req, res) => {
    const {ok, message, value: username} = validate(userSchema.username, req.params.username)
    if(!ok){return response(res, false, message)}
    const {ok: ok2, message: message2, value: inputPublicKey} = validate(userSchema.publicKey, req.body.publicKey)
    if(!ok2){return response(res, false, message2)}
    
    try{
        const {id, publicKey} = await UserModel.getUserByUsername({username})
        if(!id){return response(res, false, "user not found")}

        if(publicKey !== null && publicKey !== inputPublicKey) return response(res, false, 'permission denied')

        const {ok, data: cachedPublicData} = await redisHelper.get('cache', `publicData:${id}`)
        if(ok){return response(res, true, 'permission granted', cachedPublicData)}

        const publicData = await DataModel.getPublicData({userId: id})
        await redisHelper.set('cache', `publicData:${id}`, publicData)

        return response(res, true, 'permission granted', publicData)
    } catch(err) {
        console.log(err)
        return response(res, false, 'server error', null, 500)
    }
}


export default dataController;