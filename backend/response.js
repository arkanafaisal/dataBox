export default function response(response, success, message, data = null, error = null){
    const res = {success, message}
    if(data){res.data = data}
    if(error){res.error = error}
    return response.send(res)
}