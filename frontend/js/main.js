

mainFunction()
async function mainFunction(){
    const token = localStorage.getItem("token")
    if(!token) return
    try{
        const res = await fetching('users/me', 'POST', null, true)
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
        const res = await fetching('data/me', 'GET', null, true)
        console.log(res)
        if(!res.success) return
        setMyData(res.data)
    } catch(err){
        console.log(err)
    }
}



function router() {
    const hash = window.location.hash;
    let username = null

    if (hash.startsWith("#/")) {
        if(hash.startsWith("#/profile/")){
            username = hash.split("/")[2];
        }
        username = hash.split("/")[1];
    } else if(hash === "" || hash === "#") {
            window.location.hash = "";
    } else {
        username = hash.slice(1, hash.length);
    }
    // alert(username)
}

window.addEventListener("hashchange", router);
window.addEventListener("load", router);