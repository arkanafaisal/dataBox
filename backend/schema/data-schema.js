import Joi from 'joi'


export const insert = Joi.object({
    title: Joi.string().trim().max(16).required(),
    body: Joi.string().max(1024).required()
})

export const dataId = Joi.number().integer().positive().required()