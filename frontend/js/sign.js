const signUpForm = document.getElementById("sign-up-form")

signUpForm.addEventListener("submit", async (e) => {
    e.preventDefault()
    const errMessage = signUpForm.querySelector("#error-message")
    signUpForm.submitBtn.disabled = true

    
    try{
        const { usernameInput, emailInput, passwordInput, confirmPasswordInput } = signUpForm
        const username = usernameInput.value.trim(), email = emailInput.value.trim() || null, password = passwordInput.value.trim(), confirmPassword = confirmPasswordInput.value.trim()
        if(!username || !password || !confirmPassword) {return errMessage.textContent = "All fields are required"}
        if(username.length > 32 || (email && email.length > 64) || password.length > 128 || confirmPassword.length > 128){return errMessage.textContent = 'invalid input length'}
        if(password !== confirmPassword) {return errMessage.textContent = "Passwords don't match"}
        
        const payload = {username, email, password}
        const res = await fetching('auth/register', 'POST', payload)
        if(!res.success){
            errMessage.textContent = res.message
            return
        }
        addNotification(res.message)
        toggleSignBox()
    } catch(err){
        errMessage.textContent = err.code
    } finally {
        signUpForm.submitBtn.disabled = false
    }
})





const signInForm = document.getElementById("sign-in-form")
signInForm.addEventListener("submit", async (e) => {
    e.preventDefault()
    const errMessage = signInForm.querySelector("#error-message")
    signInForm.submitBtn.disabled = true

    try{
        const usernameOrEmail = signInForm.usernameOrEmailInput.value.trim()
        const password = signInForm.passwordInput.value.trim()
        if(!usernameOrEmail || !password) {return errMessage.textContent = "All fields are required"}
        if(usernameOrEmail.length > 64 || password.length > 128){return errMessage.textContent = 'invalid input length'}
        
        const payload = {usernameOrEmail, password}
        const res = await fetching('auth/login', 'POST', payload)
        if(!res.success){
            errMessage.textContent = res.message
            return
        }
        localStorage.setItem("token", "Bearer " + res.data.token)
        window.location.reload()
    } catch(err){
        errMessage.textContent = err.code
    } finally {
        signInForm.submitBtn.disabled = false
    }
})