

let hashUsername = ''
async function mainFunction(isDashboardSection, hashUsername = null){
    if(!isDashboardSection) {
        removeHomeSection()
        removeAccountDetailsButton()
        removeSearchButton()
        showPublicDataSection()
        if(hashUsername)validateUsername(hashUsername)
        return
    }
    const token = localStorage.getItem("token")
    if(!token) {
        removeAccountEditButton()
        return
    }
    try{
        const res = await fetching('users/me', 'POST', null, true)
        if(!res.success) return addNotification('could not get your data')

        removeHomeSection()
        setAccountDetails(res.data.username, res.data.email, res.data.publicKey)
        addNotification('welcome back '+ res.data.username)
        showLogoutBtn(true)

        showDashboardSection()
        setDataManager()
    } catch(err){
        addNotification('error ocurred, please try reload')
    }
}


function setAccountDetails(username, email, publicKey){
    const accountDetails = document.getElementById("account-details").children
    accountDetails[0].innerText = username
    accountDetails[2].innerText = email || "none"
    if(!email) accountDetails[2].classList.add('opacity-0')
    accountDetails[3].innerText = publicKey || ''
    setAccountWarning(email, publicKey)
    setShareProfileBtn(username)
    return
}

function setAccountWarning(email, publicKey){
    let warningText1 = "You haven't added "
    let warningText2 = ""
    if(!email) {
        warningText1 += "an email "
        warningText2 += "Email helps recover your account. "
    }
    if(!publicKey){
        if(!email) warningText1 += 'or '
        warningText1 += "a public key "
        warningText2 += "Public key protects unlocked data."
    }
    if(!warningText2) return closeAccountWarning()

    const warningText = warningText1 + "yet." + '\n' + warningText2
    const accountWarningText = document.getElementById('account-warning-text')
    accountWarningText.innerText = warningText
    accountWarningText.parentElement.classList.remove('hidden')

}

async function setDataManager(){
    const dataManagerSection = document.getElementById("data-manager-section")

    try{
        const res = await fetching('data/me', 'GET', null, true)
        if(!res.success) return addNotification(res.message)
        setMyData(res.data)
    } catch(err){
        addNotification(err)
        console.log(err)
    }
}


function router() {
    const hash = window.location.hash;

    // if (hash.startsWith("#/")) {
    //     if(hash.startsWith("#/profile/")){
    //         hashUsername = hash.split("/")[2];
    //     } else {
    //         hashUsername = hash.split("/")[1];
    //     }
    // } else if(hash === "" || hash === "#") {
    //         history.replaceState(null, "", location.pathname)
    // } else {
    //     hashUsername = hash.slice(1, hash.length);
    // }
    // hashUsername = hashUsername.trim()

    if(hash === "") {return mainFunction(true)}

    if( !(hash.startsWith("#/")) ) {return window.location.href = "#/"}

    mainFunction(false, hash.split("/")[1])
}

window.addEventListener("hashchange", ()=>{window.location.reload()});
window.addEventListener("load", router);

