async function fetching(endpoint, methood, body = null, token = null){
    const options = {
        method: methood,
        headers: {
            'Content-Type': 'application/json'
        }
    }
    if(body) options.body = JSON.stringify(body);
    if(token) options.headers.Authorization = token;

    const developmentIp = "http://localhost:3000/"
    const productionIP = "http://157.15.40.35:3000/"

    const response = await fetch(developmentIp + endpoint, options)
    return await response.json()
}