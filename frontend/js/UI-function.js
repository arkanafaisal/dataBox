function lockScroll(isTrue){
    if(isTrue){
        document.body.classList.add('overflow-hidden')
        return
    }
    document.body.classList.remove('overflow-hidden')
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
}

function LogoutBtnHandler(){
    localStorage.removeItem("token");
    window.location.reload();
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

function openNewDataLayer(){
    const newDataLayer = document.getElementById('add-data-layer');
    newDataLayer.classList.remove('hidden');
}

function closeNewDataLayer(){
    const newDataLayer = document.getElementById('add-data-layer');
    newDataLayer.classList.add('hidden');
}

function openEditDataLayer(el){
    const dataNode = el.closest('#data-node')
    const oldData = {
        id: dataNode.dataset.id,
        title: dataNode.querySelector('#data-title').innerText,
        body: dataNode.querySelector('#data-body').innerText
    }
    
    const editDataLayer = document.getElementById('edit-data-layer')
    editDataLayer.querySelector('#edit-data-form').dataset.currentID = oldData.id
    editDataLayer.querySelector('#edit-data-title').value = oldData.title
    editDataLayer.querySelector('#edit-data-body').value = oldData.body
    editDataLayer.classList.remove('hidden')
}

function closeEditDataLayer(){
    const editDataLayer = document.getElementById('edit-data-layer');
    editDataLayer.classList.add('hidden');
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
    const text = el.closest('#data-node').querySelector('#data-body').innerText
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

function showAccountDetailsButton(){
    const accountDetailsButton = document.getElementById('account-details-button')
    accountDetailsButton.classList.remove('hidden')
}

function showPublicDataSection(){
    const publicDataSection = document.getElementById('public-data-section')
    publicDataSection.classList.remove('hidden')
}

function closeAccountWarning(){
    const accountWarning = document.getElementById('account-warning')
    accountWarning.remove()
}

function setPublicDataOwner(username){
    document.getElementById('public-data-owner').innerText = username + "'s public data"
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

function openEditUsernameLayer(){
    const editUsernameLayer = document.getElementById('edit-username-layer')
    editUsernameLayer.classList.remove('hidden')
}

function closeEditUsernameLayer(){
    const editUsernameLayer = document.getElementById('edit-username-layer')
    editUsernameLayer.classList.add('hidden')
}

function openEditPublicKeyLayer(){
    const editPublicKeyLayer = document.getElementById('edit-public-key-layer')
    editPublicKeyLayer.classList.remove('hidden')
}

function closeEditPublicKeyLayer(){
    const editPublicKeyLayer = document.getElementById('edit-public-key-layer')
    editPublicKeyLayer.classList.add('hidden')
}

function openEditEmailLayer(){
    const editEmailLayer = document.getElementById('edit-email-layer')
    editEmailLayer.classList.remove('hidden')
}

function closeEditEmailLayer(){
    const editEmailLayer = document.getElementById('edit-email-layer')
    editEmailLayer.classList.add('hidden')
}