const card = document.getElementById('card')
async function main(){
    const token = new URLSearchParams(window.location.search).get('token')
    if(!token) return alert('token invalid')

    try {
        const res = await fetching("users/verify-reset-password?token=" + token, "POST", null, false)
        if(res.success){
            card.remove()
            alert("something wrong")
            return
        }

        if(res.message !== "missing new password"){
            card.remove()
            alert(res.message)
            return
        }
        alert(555)
    } catch(err) {
        alert(err)
    }
}

main()

const resetPasswordForm = document.getElementById("reset-password-form")
resetPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault()
    resetPasswordForm.submitButton.disabled = true
    const newPassword = resetPasswordForm.newPassword.value.trim()
    const confirmPassword = resetPasswordForm.confirmPassword.value.trim()

    if(confirmPassword !== newPassword) alert('password doesnt match')
    if(!newPassword || !confirmPassword) alert("please fill all the fields")
    if(newPassword.length > 255) alert("invalid password length")

    try {
        const token = new URLSearchParams(window.location.search).get('token')
        const res = await fetching('users/verify-reset-password?token=' + token, "POST", {newPassword}, false)
        resetPasswordForm.submitButton.disabled = false 
        alert(res.message)
        if(!res.success){
            return
        }
        window.location.href = "databox.arkanafaisal.my.id"
    } catch(err) {
        alert(err)
        resetPasswordForm.submitButton.disabled = false
    }
})