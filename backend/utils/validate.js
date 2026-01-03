export function validate(schema, body){
    const { error, value } = schema.validate(body, { abortEarly: true })

    if(error){
        const d = error.details[0]
        const field = d.path.join('.')

        let message = 'Invalid input'
        switch (true) {
            case d.type === 'any.required':
                message = `${field} is required`
                break
            case d.type === 'string.empty':
                message = `${field} cannot be empty`
                break
            case d.type === 'number.base':
                message = `${field} must be a number`
                break
            case d.type.startsWith('string.pattern'):
                message = `${field} format is invalid`
                break
            case d.type === 'alternatives.match':
                message = `${field} format is invalid`
                break
            default:
                message = `${field} is invalid`
        }


        return { ok:false, message }
    }

    return { ok:true, value }
}
