const addDataForm = document.getElementById('add-data-form');
addDataForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = addDataForm.title.value.trim();
    const body = addDataForm.body.value.trim();
    const token = localStorage.getItem("token");

    try{
        const res = await fetching('data/add', 'POST', { title, body }, token);
        if(!res.success){return alert(res.message)}
        alert('data added successfully');
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
        fragment.appendChild(newDataNode)
    })
    dataContainer.appendChild(fragment)
}



async function changeAccess(el){
    const dataNode = el.closest('#dataNode')
    const dataId = dataNode.dataset.id;
    const token = localStorage.getItem("token");

    try{
        const res = await fetching(`data/update/access/${dataId}`, 'POST', null, token);
        if(!res.success){return alert(res.message)}
        changeAccessIcon(res.data, el);
    } catch(err){
        console.log(err);
    }
}