import Joi from "joi"

export const username = Joi.string().trim().max(32).pattern(/^[a-zA-Z0-9]+$/)
export const email = Joi.string().trim().lowercase().email().max(64)
export const password = Joi.string().max(255).trim().required()
export const publicKey = Joi.string().trim().max(255).required()

export const token = Joi.string().trim().lowercase().length(64).hex().required()

export const register = Joi.object({
    username: username.required(),
    email: email.allow('', null),
    password
})

export const login = Joi.object({
    identifier: Joi.alternatives().try(
      email,
      username
    ).required(),
    password
})

export const editUsername = Joi.object({
    newUsername: username.required(),
    password
})
export const editEmail = Joi.object({
    newEmail: email.required(),
    password
})