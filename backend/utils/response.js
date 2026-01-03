export function response(response, success, message, data = null, code = null){
    const res = {success, message}
    if(data){res.data = data}
    if(code){res.code = code}
    return response.send(res)
}