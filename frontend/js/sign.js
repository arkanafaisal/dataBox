const signUpForm = document.getElementById("sign-up-form")

signUpForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const { usernameInput, emailInput, passwordInput, confirmPasswordInput } = signUpForm
    const username = usernameInput.value.trim(), email = emailInput.value.trim() || null, password = passwordInput.value.trim(), confirmPassword = confirmPasswordInput.value.trim()
    if(!username || !password || !confirmPassword) {return alert("All fields are required")}
    if(username.length > 32 || (email && email.length > 64) || password.length > 128 || confirmPassword.length > 128){return alert('invalid input length')}
    if(password !== confirmPassword) {return alert("Passwords don't match")}
    
    try{
        const payload = {username, email, password}
        const res = await fetching('auth/register', 'POST', payload)
        alert(res.message)
        if(!res.success){return}
        toggleSignBox()
    } catch(err){
        alert(err.code)
    }
})





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