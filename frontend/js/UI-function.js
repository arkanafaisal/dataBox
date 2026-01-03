function lockScroll(lock){
  const scrollbarWidth =
    window.innerWidth - document.documentElement.clientWidth;

  if(lock){
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = scrollbarWidth + 'px';
  } else {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }
}

function toggleSignBox(){
    const signUpCard = document.getElementById('sign-up-card');
    const signInBox = document.getElementById('sign-in-card');
    signUpCard.classList.toggle('hidden');
    signInBox.classList.toggle('hidden');
}

function loginBtnHandler(){
    const signLayer = document.getElementById('sign-layer');
    signLayer.classList.remove('hidden');
    lockScroll(true)
}

async function LogoutBtnHandler(){
    try {
        const res = await fetching('auth/logout', 'DELETE')
        addNotification(res.message)
        if(!res){return}
        
        window.location.reload();
    } catch(err) {
        addNotification(err)
    }
}

function showLogoutBtn(ifYes){
    const loginBtn = document.getElementById("login-btn");
    const logoutBtn = document.getElementById("logout-btn");
    if(ifYes){

        loginBtn.classList.add("hidden");
        logoutBtn.classList.remove("hidden");
    } else {
        loginBtn.classList.remove("hidden");
        logoutBtn.classList.add("hidden");
    }
}

function showShareButton(){
    const shareBtn = document.getElementById('share-button')
}

function toggleAccountDetails(){
    const accountCard = document.getElementById('account-card');
    accountCard.classList.toggle('hidden');
}

function changeAccessIcon(newData, el){
    const lockIcon = el.children[0];
    const unlockIcon = el.children[1];

    if(newData === 'private'){
        lockIcon.classList.remove('hidden');
        unlockIcon.classList.add('hidden');
    } else {
        lockIcon.classList.add('hidden');
        unlockIcon.classList.remove('hidden');
    }
}

function copyData(el){
    const text = el.closest('#data-node').querySelector('#data-body').value
    console.log(text)
    navigator.clipboard.writeText(text)
    addNotification('data copied')
}

function addNotification(message) {
    const notificationContainer = document.getElementById('notification-container');
    notificationContainer.innerHTML = ''
    // Create the notification element
    const notification = document.getElementById('notification-node').cloneNode()
    notification.classList.remove('hidden')
    notification.innerText = message;

    // Append it to the notification container
    notificationContainer.appendChild(notification)
    setTimeout(()=>{notification.classList.remove('translate-x-[200%]')}, 50)
    // Automatically dismiss the notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('opacity-100'); // fade out
        notification.classList.add('opacity-0'); // fade out
        setTimeout(() => notification.remove(), 300); // remove after fade out
    }, 3000);
}

function showDashboardSection(){
    const dashboardSection = document.getElementById('dashboard-section')
    dashboardSection.classList.remove('hidden')
}

function removeAccountDetailsButton(){
    const accountDetailsButton = document.getElementById('account-details-button')
    accountDetailsButton.remove()
}

function removeSearchButton(){
    const searchButton = document.getElementById('search-button')
    searchButton.remove()
}

function showPublicDataSection(){
    const publicDataSection = document.getElementById('public-data-section')
    publicDataSection.classList.remove('hidden')
}

function closeAccountWarning(){
    const accountWarning = document.getElementById('account-warning')
    accountWarning.remove()
}

function setShareProfileBtn(username){
    const shareBtn = document.getElementById("share-profile-button")
    shareBtn.classList.remove("hidden")
    const profileLink = "databox.arkanafaisal.my.id/#/profile/" + username
    shareBtn.onclick = async ()=>{
        try{
            await navigator.clipboard.writeText(profileLink)
            addNotification('profile link copied')
        } catch{
            addNotification('failed to copy')
        }
    }
}

function removeAccountEditButton(){
    const el = document.getElementById("profile-edit-button")
    el.remove()
}

function removeHomeSection(){
    document.getElementById("home-section").remove()
}

function searchSection(){
    window.location.href = "#/"
}



function toggleNewDataLayer(isOpen){
    const newDataLayer = document.getElementById('add-data-layer');
    if(isOpen){
        newDataLayer.classList.remove('hidden');
        lockScroll(true)
    } else {
        newDataLayer.classList.add('hidden')
        lockScroll(false);
    }
}

function toggleEditDataLayer(isOpen, el = null){
    const editDataLayer = document.getElementById('edit-data-layer');
    if(!isOpen){
        editDataLayer.classList.add('hidden');
        lockScroll(false)
        return
    }

    const dataNode = el.closest('#data-node')
    const oldData = {
        id: dataNode.dataset.id,
        title: dataNode.querySelector('#data-title').innerText,
        body: dataNode.querySelector('#data-body').value
    }
    
    editDataLayer.querySelector('#edit-data-form').dataset.currentID = oldData.id
    editDataLayer.querySelector('#edit-data-title').value = oldData.title
    editDataLayer.querySelector('#edit-data-body').value = oldData.body
    editDataLayer.classList.remove('hidden')

    lockScroll(true)
}

function toggleEditUsernameLayer(isOpen){
    const editUsernameLayer = document.getElementById('edit-username-layer')
    if(isOpen){
        editUsernameLayer.classList.remove('hidden')
        lockScroll(true)
    } else {
        editUsernameLayer.classList.add('hidden')
        lockScroll(false);
    }
}

function toggleEditPublicKeyLayer(isOpen){
    const editPublicKeyLayer = document.getElementById('edit-public-key-layer')
    if(isOpen){
        editPublicKeyLayer.classList.remove('hidden')
        lockScroll(true)
    } else {
        editPublicKeyLayer.classList.add('hidden')
        lockScroll(false)
    }
}

function toggleEditEmailLayer(isOpen){
    const editEmailLayer = document.getElementById('edit-email-layer')
    if(isOpen){
        editEmailLayer.classList.remove('hidden')
        lockScroll(true)
    } else {
        editEmailLayer.classList.add('hidden')
        lockScroll(false)
    }
}

function toggleEditPasswordLayer(isOpen){
    const editPasswordLayer = document.getElementById('edit-password-layer')
    if(isOpen){
        editPasswordLayer.classList.remove('hidden')
        lockScroll(true)
    } else {
        editPasswordLayer.classList.add('hidden')
        lockScroll(false)
    }
}










function changeDummyAccess(el){
    el.closest("#access-button").children[0].classList.toggle("hidden")
    el.closest("#access-button").children[1].classList.toggle("hidden")
    addNotification("access changed")
}

function openEditDummyDataLayer(el){
    const dataNode = el.closest('#dummy-data-node')
    const oldData = {
        id: dataNode.dataset.id,
        title: dataNode.querySelector('#data-title').innerText,
        body: dataNode.querySelector('#data-body').value
    }
    
    const editDummyDataLayer = document.getElementById('edit-dummy-data-layer')
    editDummyDataLayer.querySelector('#edit-dummy-data-form').dataset.currentID = oldData.id
    editDummyDataLayer.querySelector('#edit-dummy-data-title').value = oldData.title
    editDummyDataLayer.querySelector('#edit-dummy-data-body').value = oldData.body
    editDummyDataLayer.classList.remove('hidden')

    lockScroll(true)
}

function closeEditDummyDataLayer(){
    document.getElementById("edit-dummy-data-layer").classList.add("hidden")
    lockScroll(false)
}

const editDummyDataForm = document.getElementById('edit-dummy-data-form')
editDummyDataForm.addEventListener('submit', async (e)=>{
    e.preventDefault()

    const datas = {
        id: editDummyDataForm.dataset.currentID,
        title: editDummyDataForm.title.value.trim(),
        body:editDummyDataForm.body.value
    }

    if(datas.title.length > 16 || datas.body.length > 1024){
        addNotification('invalid data length')
        return
    }

    try{
        
        addNotification("data changed")
        editDummyDataForm.reset()
        closeEditDummyDataLayer()

        const dataNode = document.getElementById("dummy-data-id-" + datas.id).parentElement
        dataNode.querySelector('#data-title').textContent = datas.title
        dataNode.querySelector('#data-body').value = datas.body
    }catch(err){
        addNotification('error occured, please try again')
        console.log(err)
    }
})

function deleteDummyData(el){
    el.closest("#dummy-data-node").remove()
}


function copyDummyData(el){
    const text = el.closest('#dummy-data-node').querySelector('#data-body').value
    navigator.clipboard.writeText(text)
    addNotification('data copied')
}