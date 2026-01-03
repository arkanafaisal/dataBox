import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
}})

export const sendMail = {
    verifyEmail: async ({newEmail, token}) => {
        const link = `https://databox-server.arkanafaisal.my.id/users/verify-email?token=${token}`
        await transporter.sendMail({
            from: 'databox <no-reply@arkanafaisal.my.id>',
            to: newEmail,
            subject: 'Verify your email',
            text: `Verify email:\n${link}`,
            html: `<p>Click to verify:</p><a href="${link}">Verify Email</a>`
        })
    },
    resetPassword: async ({email, token}) => {
        const link = `https://databox.arkanafaisal.my.id/src/reset-password/?token=${token}`
        await transporter.sendMail({
            from: 'databox <no-reply@arkanafaisal.my.id>',
            to: email,
            subject: 'Reset your password',
            text: `reset password:\n${link}`,
            html: `<p>Click to reset password:</p><a href="${link}">Reset Password</a>`
        })
    }
}

        