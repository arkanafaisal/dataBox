import db from "../config/db.js"


export async function insert({userId, title, body}) {
    const [{insertId}] = await db.query('INSERT INTO userData (user_id, title, body) VALUES (?, ?, ?)', [userId, title, body])
    return insertId
}

export async function getMyData({userId}) {
    const [userData] = await db.query('SELECT id, title, body, access FROM userData WHERE user_id = ?', [userId])
    return userData
}

export async function remove({id, userId}) {
    const [{affectedRows}] = await db.query('DELETE FROM userData WHERE id = ? AND user_id = ?', [id, userId])
    return affectedRows
}

export async function updateAccess({id, userId}) {
    const [{affectedRows}] = await db.query(`UPDATE userData SET access = IF(access = 'public', 'private', 'public') WHERE id = ? AND user_id = ?`, [id, userId])
    return affectedRows
}

export async function getDataAccess({id, userId}) {
    const [rows] = await db.query('SELECT access FROM userData WHERE id = ? AND user_id = ?', [id, userId])
    if(rows.length === 0){return null}
    return rows[0].access
}

export async function updateData({title, body, id, userId}) {
    const [{affectedRows, changedRows}] = await db.query(`UPDATE userData SET title = ?, body = ? WHERE id = ? AND user_id = ?`, [title, body, id, userId])
    return {affectedRows, changedRows}
}

export async function getPublicData({userId}) {
    const [publicData] = await db.query('SELECT title, body FROM userData WHERE user_id = ? AND access = "public" ORDER BY id ASC', [userId])
    return publicData
}