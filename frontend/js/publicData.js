const publicDataForm = document.getElementById('public-data-form')
publicDataForm.addEventListener('submit', async (e)=>{
    e.preventDefault()

    const publicKey = publicDataForm.publicKeyInput.value.trim()
    if(publicKey.length > 255 || !publicKey) return
    
    try{
        const res = await fetching(`data/profile/${hashUsername}`, 'POST', {publicKey}, false)
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