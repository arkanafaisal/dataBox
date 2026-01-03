import db from "../config/db.js"
import bcrypt from 'bcrypt'

export async function register({username, email, password}) {
    try {

        const hash = await bcrypt.hash(password, 10)
        const [{insertId}] = await db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hash])
        return insertId
    } catch(err) {
        if(err.code === 'ER_DUP_ENTRY'){throw new Error('duplicate')}
        throw err
    }
}

export async function authenticateUser({identifier, password}){
    const [[user]] = await db.query('SELECT id, username, password FROM users WHERE (username = ? OR email = ?)', [identifier, identifier])
    if(!user){return null}

    const ok = await bcrypt.compare(password, user.password)
    if(!ok){return null}
    return user
}

export async function validateUserId({id}){
    const [[row]] = await db.query('SELECT 1 FROM users WHERE id = ?', [id])
    return !!row
}

export async function validateUsername({username}) {
    const [[row]] = await db.query("SELECT 1 FROM users WHERE username = ?", [username])
    return !!row
}

export async function getUserByUsername({username}) {
    const [rows] = await db.query('SELECT id, publicKey FROM users WHERE username = ?', [username])
    if(rows.length === 0){return {id: 0, publicKey: null}}
    const {id, publicKey} = rows[0]
    return {id, publicKey}
}

export async function getMyProfile({id}) {
    const [[user]] = await db.query('SELECT username, email, publicKey FROM users WHERE id = ?', [id])
    return user
}

export async function getUsernamePasswordById({id}) {
    const [[user]] =  await db.query('SELECT username, password FROM users WHERE id = ?', [id])
    return user
}
export async function getEmailPasswordById({id}) {
    const [[user]] = await db.query("SELECT email, password FROM users WHERE id = ?", [id])
    return user
}

export async function updateUsername({newUsername, id}) {
    try {
        const [{affectedRows, changedRows}] = await db.query('UPDATE users SET username = ? WHERE id = ?', [newUsername, id])
        return {affectedRows, changedRows}
    } catch(err) {
        if(err.code === 'ER_DUP_ENTRY'){throw new Error('duplicate')}
        throw err
    }
}

export async function updatePublicKey({newPublicKey, id}) {
    const [{affectedRows, changedRows}] = await db.query("UPDATE users SET publicKey = ? WHERE id = ?", [newPublicKey, id])
    return {affectedRows, changedRows}
}

export async function validateEmail({newEmail}) {
    const [[row]] = await db.query("SELECT 1 FROM users WHERE email = ?", [newEmail])
    return !!row
}

export async function updateEmail({newEmail, userId}) {
    try {
        const [{changedRows}] = await db.query("UPDATE users SET email = ? WHERE id = ?", [newEmail, userId])
        return changedRows
    } catch(err) {
        if(err.code === "ER_DUP_ENTRY"){throw new Error('duplicate')}
        throw err
    }
}
export async function updatePassword({newPassword, userId}) {
    const hash = await bcrypt.hash(newPassword, 10)
    const [{changedRows}] = await db.query("UPDATE users SET password = ? WHERE id = ?", [hash, userId])
    return changedRows
}

export async function getEmailById(id) {
    const [[user]] = await db.query("SELECT email FROM users WHERE id = ?", [id])
    return user
}