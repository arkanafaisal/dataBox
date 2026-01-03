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
    const ip = productionIP

    const response = await fetch(ip + endpoint, options)
    const result = await response.json()
    if(!result.success){
        if(result.code && result.code === 429){
            return {success: false, message: "please try again in 1 minute"}
        }
        if(result.code && result.code === 40101){
            const response2 = await fetch([ip] + "auth/refresh", {
                method: "POST",
                credentials: "include",
                headers: {'Content-type': 'application/json'}
            })
            const result2 = await response2.json()
            if(!result2.success){
                if(result2.code && result2.code === 401){
                    return {success:false, message:"please try re-log"}
                    
                }
                return result2
            }
            return await fetching(endpoint, method, body)
        } 
    }



    return result
}