const addDataForm = document.getElementById('add-data-form');
addDataForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = addDataForm.title.value.trim();
    const body = addDataForm.body.value.trim();

    if(title.length > 16 || body.length > 1024){
        addNotification('invalid data length')
        return
    }

    try{
        const res = await fetching('data/add', 'POST', { title, body }, true);
        if(!res.success){return alert(res.message)}
        addData(res.data)
        closeNewDataLayer();
        addDataForm.reset();
        addNotification('data added successfully')
    } catch(err){
        addNotification('error occured, please try again')
        console.log(err);
    }
})

const editDataForm = document.getElementById('edit-data-form')
editDataForm.addEventListener('submit', async (e)=>{
    e.preventDefault()

    const datas = {
        id: editDataForm.dataset.currentID,
        title: editDataForm.title.value.trim(),
        body:editDataForm.body.value.trim()
    }

    if(datas.title.length > 16 || datas.body.length > 1024){
        addNotification('invalid data length')
        return
    }

    try{
        const res = await fetching(`data/edit/${datas.id}`, 'PATCH', datas, true)
        if(!res.success) return addNotification(res.message)
        addNotification(res.message)
        closeEditDataLayer()
        editDataForm.reset()
    }catch(err){
        addNotification('error occured, please try again')
        console.log(err)
    }

    

    console.log(fetchBody)
})

const editUsernameForm = document.getElementById('edit-username-form')
editUsernameForm.addEventListener('submit', async (e)=>{
    e.preventDefault()

    const newUsername = editUsernameForm.newUsername.value
    const password = editUsernameForm.password.value

    if(newUsername.length > 32 || password.length > 255){
        addNotification('invalid data length')
        return
    }

    try{
        const res = await fetching(`users/username`, 'PATCH', {newUsername, password}, true)
        if(!res.success) return addNotification(res.message)
        addNotification(res.message)
        closeEditUsernameLayer()
        editUsernameForm.reset()
    }catch(err){
        addNotification('error occured, please try again')
        console.log(err)
    }

    

    console.log(fetchBody)
})

const editPublicKeyForm = document.getElementById('edit-public-key-form')
editPublicKeyForm.addEventListener('submit', async (e)=>{
    e.preventDefault()

    const newPublicKey = editPublicKeyForm.newPublicKey.value

    if(newPublicKey.length > 255){
        addNotification('invalid data length')
        return
    }

    try{
        const res = await fetching(`users/public-key`, 'PATCH', {newPublicKey}, true)
        if(!res.success) return addNotification(res.message)
        addNotification(res.message)
        closeEditPublicKeyLayer()
        editPublicKeyForm.reset()
    }catch(err){
        addNotification('error occured, please try again')
        console.log(err)
    }

    

    console.log(fetchBody)
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
        newDataNode.children[1].innerText = dataItem.title
        newDataNode.children[2].innerText = dataItem.body
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
    newDataNode.children[2].innerText = dataItem.body
    if(dataItem.access === 'private') newDataNode.querySelector('#access-button').children[0].classList.remove('hidden')
    else newDataNode.querySelector('#access-button').children[1].classList.remove('hidden')
    dataContainer.appendChild(newDataNode)
}

async function changeAccess(el){
    const dataId = (el.closest('#data-node')).dataset.id

    try{
        const res = await fetching(`data/update/access/${dataId}`, 'POST', null, true);
        if(!res.success){return alert(res.message)}
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
        const res = await fetching(`data/delete/${dataId}`, 'DELETE', null, true)
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
