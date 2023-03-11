const token = location.search.split('=')[1]
const password = document.querySelector('#password')
const passwordConfirm = document.querySelector('#passwordConfirm')
const submitBtn = document.querySelector('#submitBtn')
const error = document.querySelector('#error')
const form = document.querySelector('#register-form')
const success = document.querySelector('#success')

password.addEventListener('focus', (e) => {
    error.textContent = ''
})

passwordConfirm.addEventListener('focus', (e) => {
    error.textContent = ''
})

submitBtn.addEventListener('click', async (e) => {
    e.preventDefault()
    try {
        const res = await fetch(
            `http://${location.host}/api/v1/auth/resetPassword/${token}`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    password: password.value,
                    passwordConfirm: passwordConfirm.value,
                }),
            }
        )

        const data = await res.json()

        if (data.status !== 'success') {
            if (data.message.startsWith('Invalid input data'))
                error.textContent = data.message.split('.')[1]
            else error.textContent = data.message
            return
        }
        form.classList.add('hidden')
        success.textContent = 'Password Changed Successfully.'
    } catch (err) {
        error.textContent = err.message
    }
})
