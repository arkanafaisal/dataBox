const addDataForm = document.getElementById('add-data-form');
addDataForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = addDataForm.title.value.trim();
    const body = addDataForm.body.value.trim();

    try{
        const res = await fetching('data/add', 'POST', { title, body }, true);
        if(!res.success){return alert(res.message)}
        alert('data added successfully');
        
        addData(res.data)
        closeNewDataLayer();
        addDataForm.reset();
    } catch(err){
        console.log(err);
    }
})

function setMyData(dataList){
    const dataContainer = document.getElementById("data-container")
    const dataListNode = dataContainer.children[0]
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
    const dataListNode = dataContainer.children[0]

    const newDataNode = dataListNode.cloneNode(true)
    newDataNode.classList.remove("hidden")
    newDataNode.dataset.id = dataItem.id
    newDataNode.children[0].innerText = dataContainer.children.length + 1
    newDataNode.children[1].innerText = dataItem.title
    newDataNode.children[2].innerText = dataItem.body
    if(dataItem.access === 'private') newDataNode.querySelector('#access-button').children[0].classList.remove('hidden')
    else newDataNode.querySelector('#access-button').children[1].classList.remove('hidden')
    dataContainer.appendChild(newDataNode)
}



async function changeAccess(el){
    const dataId = (el.closest('#dataNode')).dataset.id

    try{
        const res = await fetching(`data/update/access/${dataId}`, 'POST', null, true);
        if(!res.success){return alert(res.message)}
        changeAccessIcon(res.data, el.closest('#access-button'));
    } catch(err){
        console.log(err);
    }
}

async function deleteData(el){
    const dataNode = el.closest('#dataNode')
    const dataId = dataNode.dataset.id;
    
    try{
        const res = await fetching(`data/delete/${dataId}`, 'DELETE', null, true)
        if(!res.success){return alert(res.message)}
        dataNode.remove()
    } catch(err){
        console.log(err)
    }
}