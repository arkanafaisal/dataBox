const addDataForm = document.getElementById('add-data-form');
addDataForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    addDataForm.submitBtn.disabled = true

    const title = addDataForm.title.value.trim();
    const body = addDataForm.body.value

    
    try{
        if (!title || !body) return addNotification('all fields are required')
        if(title.length > 16 || body.length > 1024){
            addNotification('invalid data length')
            return
        }

        const res = await fetching('data/add', 'POST', { title, body });
        if(!res.success){return addNotification(res.message)}
        addData(res.data)
        toggleNewDataLayer(false);
        addDataForm.reset();
        addNotification('data added successfully')
    } catch(err){
        addNotification('error occured, please try again')
        console.log(err);
    } finally {
        addDataForm.submitBtn.disabled = false
    }
})

const editDataForm = document.getElementById('edit-data-form')
editDataForm.addEventListener('submit', async (e)=>{
    e.preventDefault()
    editDataForm.submitBtn.disabled = true

    const datas = {
        id: editDataForm.dataset.currentID,
        title: editDataForm.title.value.trim(),
        body:editDataForm.body.value
    }

    
    try{
        if(!datas.title || !datas.body) return addNotification("all fields are required")
        if(datas.title.length > 16 || datas.body.length > 1024) return addNotification('invalid data length')

        const res = await fetching(`data/edit/${datas.id}`, 'PATCH', datas)
        if(!res.success) return addNotification(res.message)
        addNotification(res.message)
        editDataForm.reset()
        toggleEditDataLayer(false)

        const dataNode = document.getElementById("data-id-" + res.data.id).parentElement
        dataNode.querySelector('#data-title').textContent = res.data.title
        dataNode.querySelector('#data-body').value = res.data.body
    }catch(err){
        addNotification('error occured, please try again')
        console.log(err)
    } finally {
        editDataForm.submitBtn.disabled = false
    }
})

const editUsernameForm = document.getElementById('edit-username-form')
editUsernameForm.addEventListener('submit', async (e)=>{
    e.preventDefault()
    editUsernameForm.submitBtn.disabled = true

    const newUsername = editUsernameForm.newUsername.value
    const password = editUsernameForm.password.value

    
    try{
        if(!newUsername || !password) return addNotification('all fields are required')
        if(newUsername.length > 32 || password.length > 255) return addNotification('invalid data length')

        const res = await fetching(`users/username`, 'PATCH', {newUsername, password})
        if(!res.success) return addNotification(res.message)
        addNotification(res.message)
        editUsernameForm.reset()
        toggleEditUsernameLayer(false)

        document.getElementById("profile-username").textContent = res.data
    }catch(err){
        addNotification('error occured, please try again')
        console.log(err)
    } finally {
        editUsernameForm.submitBtn.disabled = false
    }
})

const editEmailForm = document.getElementById('edit-email-form')
editEmailForm.addEventListener('submit', async (e)=>{
    e.preventDefault()
    editEmailForm.submitBtn.disabled = true

    const newEmail = editEmailForm.newEmail.value
    const password = editEmailForm.password.value

    
    try{
        if(!newEmail || !password) return addNotification('all fields are required')
        if(newEmail.length > 32 || password.length > 255) return addNotification('invalid data length')

        const res = await fetching(`users/email`, 'PATCH', {email: newEmail, password})
        if(!res.success) return addNotification(res.message)
        addNotification(res.message)
        editEmailForm.reset()
        toggleEditEmailLayer(false)
    }catch(err){
        addNotification('error occured, please try again')
        console.log(err)
    } finally {
        editEmailForm.submitBtn.disabled = false
    }
})

const editPasswordForm = document.getElementById('edit-password-form')
editPasswordForm.addEventListener('submit', async (e)=>{
    e.preventDefault()
    editPasswordForm.submitBtn.disabled = true

    try{
        const res = await fetching(`users/reset-password`, 'POST', null)
        if(!res.success) return addNotification(res.message)
        addNotification(res.message)
        editPasswordForm.reset()
        toggleEditPasswordLayer(false)
    }catch(err){
        addNotification('error occured, please try again')
        console.log(err)
    } finally {
        editPasswordForm.submitBtn.disabled = false
    }
})

const editPublicKeyForm = document.getElementById('edit-public-key-form')
editPublicKeyForm.addEventListener('submit', async (e)=>{
    e.preventDefault()
    editPublicKeyForm.submitBtn.disabled = true

    const newPublicKey = editPublicKeyForm.newPublicKey.value.trim()

    
    try{
        if(!newPublicKey) return addNotification('all fields are required')
        if(newPublicKey.length > 255) return addNotification('invalid data length')
        
        const res = await fetching(`users/public-key`, 'PATCH', {newPublicKey})
        if(!res.success) return addNotification(res.message)
        addNotification(res.message)
        editPublicKeyForm.reset()
        toggleEditPublicKeyLayer(false)
    
        document.getElementById("profile-public-key").textContent = res.data
    }catch(err){
        addNotification('error occured, please try again')
        console.log(err)
    } finally {
        editPublicKeyForm.submitBtn.disabled = false
    }
})

function setMyData(dataList){
    const dataContainer = document.getElementById("data-container")
    const dataListNode = dataContainer.children[0]

    if(dataList.length === 0) {
        const h2 = document.createElement('h2')
        h2.className = 'text-center text-3xl mt-12'
        h2.textContent = "you don't have any data yet"
        h2.id = 'null-data-text'

        dataContainer.appendChild(h2)
        return
    }
    const fragment = document.createDocumentFragment()
    dataList.forEach((dataItem, index) => {
        const newDataNode = dataListNode.cloneNode(true)
        newDataNode.classList.remove("hidden")
        newDataNode.dataset.id = dataItem.id
        newDataNode.children[0].innerText = index + 1
        newDataNode.children[0].id = "data-id-" + dataItem.id
        newDataNode.children[1].innerText = dataItem.title
        newDataNode.querySelector('#data-body').value = dataItem.body
        if(dataItem.access === 'private') newDataNode.querySelector('#access-button').children[0].classList.remove('hidden')
        else newDataNode.querySelector('#access-button').children[1].classList.remove('hidden')
        fragment.appendChild(newDataNode)
    })
    dataContainer.appendChild(fragment)
}

function addData(dataItem){
    const dataContainer = document.getElementById("data-container")
    if(dataContainer.querySelector('#null-data-text')) dataContainer.children[1].remove()
    const dataListNode = dataContainer.children[0]

    const newDataNode = dataListNode.cloneNode(true)
    newDataNode.classList.remove("hidden")
    newDataNode.dataset.id = dataItem.id
    newDataNode.children[0].innerText = dataContainer.children.length
    newDataNode.children[1].innerText = dataItem.title
    newDataNode.querySelector("#data-body").value = dataItem.body
    if(dataItem.access === 'private') newDataNode.querySelector('#access-button').children[0].classList.remove('hidden')
    else newDataNode.querySelector('#access-button').children[1].classList.remove('hidden')
    dataContainer.appendChild(newDataNode)
}

async function changeAccess(el){
    const dataId = (el.closest('#data-node')).dataset.id

    try{
        const res = await fetching(`data/update/access/${dataId}`, 'POST', null);
        if(!res.success){return addNotification(res.message)}
        changeAccessIcon(res.data, el.closest('#access-button'));
        addNotification('access changed to ' + res.data)
    } catch(err){
        addNotification('error occured, please try again')
        console.log(err);
    }
}

async function deleteData(el){
    const dataNode = el.closest('#data-node')
    const dataId = dataNode.dataset.id;
    
    try{
        const res = await fetching(`data/delete/${dataId}`, 'DELETE', null)
        if(!res.success){return addNotification(res.message)}
        dataNode.remove()
        addNotification('data removed')

        const dataContainer = document.getElementById("data-container")
        if(dataContainer.children.length === 1) {
            const h2 = document.createElement('h2')
            h2.className = 'text-center text-3xl mt-12'
            h2.textContent = "you don't have any data yet"
            h2.id = 'null-data-text'

            dataContainer.appendChild(h2)
            return
        }
    } catch(err){
        addNotification('error occured, please try again')
    }
}
