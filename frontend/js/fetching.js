async function fetching(endpoint, method, body = null){
    const options = {
        method: method,
        credentials:"include",
        headers: {
            'Content-Type': 'application/json',
        }
    }
    if(body) options.body = JSON.stringify(body)


    const developmentIP = "http://127.0.0.1:3000/"
    const productionIP = "https://databox-server.arkanafaisal.my.id/"

    const response = await fetch(productionIP + endpoint, options)
    const result = await response.json()
    if(!result.success){
        if(result.message === "token expired" || result.message === "token invalid"){
            const response2 = await fetch([productionIP] + "auth/refresh", {
                method: "POST",
                credentials: "include",
                headers: {'Content-type': 'application/json'}
            })
            const result2 = await response2.json()
            if(!result2.success){
                if(result2.message === 'refresh token invalid'){
                    return {success:false, message:"please try re-log"}
                    
                }
                return {success:false}
            }
            return await fetching(endpoint, method, body)
        } else if(result.code && result.code === 429){
            return {success: false, message: "please try again in 1 minute"}
        }
    }



    return result
}