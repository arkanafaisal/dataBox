const signInForm = document.getElementById("sign-in-form")


signInForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const usernameOrEmail = signInForm.usernameOrEmailInput.value.trim()
    const password = signInForm.passwordInput.value.trim()
    if(!usernameOrEmail || !password) {return alert("All fields are required")}
    if(usernameOrEmail.length > 64 || password.length > 128){return alert('invalid input length')}
    try{
        const payload = {usernameOrEmail, password}
        const res = await fetching('auth/login', 'POST', payload)
        if(!res.success){return}
        localStorage.setItem("token", "Bearer " + res.data.token)
        window.location.reload()
    } catch(err){
        alert(err.code)
    }
})