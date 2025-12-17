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

function toggleAccountDetails(){
    const accountCard = document.getElementById('account-card');
    accountCard.classList.toggle('hidden');
}

function showNewDataLayer(){
    const newDataLayer = document.getElementById('add-data-layer');
    newDataLayer.classList.remove('hidden');
}

function closeNewDataLayer(){
    const newDataLayer = document.getElementById('add-data-layer');
    newDataLayer.classList.add('hidden');
}

function changeAccessIcon(newData, el){
    const lockIcon = el.children[0];
    const unlockIcon = el.children[1];
    console.log(el)

    if(newData === 'private'){
        lockIcon.classList.remove('hidden');
        unlockIcon.classList.add('hidden');
    } else {
        lockIcon.classList.add('hidden');
        unlockIcon.classList.remove('hidden');
    }
}