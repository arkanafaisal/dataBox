

mainFunction()
async function mainFunction(){
    const token = localStorage.getItem("token")
    if(!token) return
    try{
        const res = await fetching('users/me', 'POST', null, token)
        if(!res.success) return
        showLogoutBtn(true)
        setAccountDetails(res.data.username, res.data.email, res.data.passwordLength, res.data.publicKey)
        setDataManager(token)
    } catch(err){
        console.log(err)
    }
}

function setAccountDetails(username, email, passwordLength = 0, publicKey = 99){
    const accountDetails = document.getElementById("account-details").children
    accountDetails[0].innerText = username
    accountDetails[1].innerText = email || 'none'
    accountDetails[2].innerText = "*".repeat(passwordLength) || '***'
    accountDetails[3].innerText = publicKey
    return
}

async function setDataManager(token){
    const dataManagerSection = document.getElementById("data-manager-section")

    try{
        const res = await fetching('data/me', 'GET', null, token)
        if(!res.success) return
        const dataList = res.data
        const dataContainer = document.getElementById("data-container")
        const dataListNode = dataContainer.children[0]
        const fragment = document.createDocumentFragment()
        dataList.forEach((dataItem, index) => {
            const newDataNode = dataListNode.cloneNode(true)
            newDataNode.classList.remove("hidden")
            newDataNode.children[0].innerText = index + 1
            newDataNode.children[1].innerText = dataItem.title
            newDataNode.children[2].innerText = dataItem.body
            fragment.appendChild(newDataNode)
        })
        dataContainer.appendChild(fragment)
    } catch(err){
        console.log(err)
    }
}