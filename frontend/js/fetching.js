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
    const productionIP = "https://databox-server.arkanafaisal.my.id/"

    const response = await fetch(developmentIp + endpoint, options)
    return await response.json()
}