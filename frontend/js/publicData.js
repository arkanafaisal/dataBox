const publicDataForm = document.getElementById('public-data-form')
publicDataForm.addEventListener('submit', async (e)=>{
    e.preventDefault()

    const publicKey = publicDataForm.publicKeyInput.value.trim()
    if(publicKey.length > 255 || !publicKey) return
    try{
        const res = await fetching(`data/profile/${publicDataForm.dataset.username}`, 'POST', {publicKey}, false)
        if(!res.success) return addNotification(res.message)
    
        addNotification(res.message)
        setPublicData(res.data)



        publicDataForm.remove()
    } catch(err) {
        addNotification(err)
        console.log(err)
    }
})

function setPublicData(datas){
    if(datas.length === 0){
        document.getElementById('null-public-data-text').classList.remove('hidden')
        return
    }
    const publicDataContainer = document.getElementById('public-data-container')
    publicDataContainer.classList.remove('hidden')

    const publicDataNode = document.getElementById('public-data-node')
    const fragment = document.createDocumentFragment()

    datas.forEach(data => {
        const nodeCopy = publicDataNode.cloneNode(true)
        nodeCopy.classList.remove('hidden')
        nodeCopy.querySelector('#public-data-title').innerText = data.title
        nodeCopy.dataset.bodyData = data.body
        fragment.appendChild(nodeCopy)
    })
    publicDataContainer.appendChild(fragment)
}

function copyPublicData(el){
    const parent = el.parentElement
    try{
        navigator.clipboard.writeText(parent.dataset.bodyData)
        addNotification('data copied')
    } catch(err){
        addNotification(err)
    }

}

const searchUsernameForm = document.getElementById('search-username-form')
searchUsernameForm.addEventListener("submit", async (e) => {
    e.preventDefault()
    searchUsernameForm.submitBtn.disabled = true

    const username = searchUsernameForm.username.value.trim()

    try {
        if(!username) return addNotification("missing username")
        if(username.length > 32) {return addNotification("invalid username length")}
        
        const res  = await fetching("users/search/" + username, "GET")
        addNotification(res.message)
        if(!res.success) return

        setPublicDataOwner(res.data)
    } catch(err) {
        return addNotification(err)
    } finally {
        searchUsernameForm.submitBtn.disabled = false
    }
})

function setPublicDataOwner(username){
    document.getElementById('search-username-form').remove()
    
    document.getElementById('public-data-owner').classList.remove("hidden")
    document.getElementById('public-data-owner').innerText = username + "'s public data"
    document.getElementById('public-data-form').classList.remove("hidden")
    document.getElementById('public-data-form').dataset.username = username
}

async function validateUsername(username){
    try {
        const res = await fetching("users/search/" + username, "GET")
        console.log(res)
        addNotification(res.message)

        if(res.success) return setPublicDataOwner(res.data)
    } catch(err) {
        addNotification(err)
    }
}