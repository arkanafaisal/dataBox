

let hashUsername = ''
async function mainFunction(hashUsername){
    if(hashUsername) {
        showPublicDataSection()
        setPublicDataOwner(hashUsername)
        return
    }
    const token = localStorage.getItem("token")
    if(!token) return showAccountDetailsButton()
    try{
        const res = await fetching('users/me', 'POST', null, true)
        if(!res.success) return addNotification('could not get your data')

        showAccountDetailsButton()
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
    accountDetails[1].innerText = email || "buffer"
    if(!email) accountDetails[1].classList.add('opacity-0')
    accountDetails[2].innerText = publicKey || ''
    setAccountWarning(email, publicKey)
    setShareProfileBtn(username)

    if(email) {
        document.getElementById('profile-email').classList.add('opacity-0', 'pointer-events-none')
        document.getElementById('profile-email').onclick = null
    }
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

    if (hash.startsWith("#/")) {
        if(hash.startsWith("#/profile/")){
            hashUsername = hash.split("/")[2];
        } else {
            hashUsername = hash.split("/")[1];
        }
    } else if(hash === "" || hash === "#") {
            history.replaceState(null, "", location.pathname)
    } else {
        hashUsername = hash.slice(1, hash.length);
    }
    hashUsername = hashUsername.trim()

    mainFunction(hashUsername)
}

window.addEventListener("hashchange", ()=>{window.location.reload()});
window.addEventListener("load", router);

