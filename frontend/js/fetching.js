async function fetching(endpoint, methood, body = null, isUsingToken = false){
    const options = {
        method: methood,
        headers: {
            'Content-Type': 'application/json'
        }
    }
    if(body) options.body = JSON.stringify(body);
    if(isUsingToken) options.headers.Authorization = localStorage.getItem('token');

    const developmentIP = "http://localhost:3000/"
    const productionIP = "https://databox-server.arkanafaisal.my.id/"

    const response = await fetch(developmentIP + endpoint, options)
    return await response.json()
}