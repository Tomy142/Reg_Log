import db from "../config/db.js";

const createMusic = async (title, filePath, userId)=>{
    const [result] = await db.execute(
        "INSERT INTO music (title, file_path, user_id) VALUES (?,?,?)",
        [title, filePath, userId]
    );
    return result.insertId;
};

const getMusicByUser = async (userId)=>{
    const[rows] = await db.execute("SELECT * FROM music WHERE user_id = ?", [userId]);
    return rows;
};

const searchMusicByName = async (userId, searchTerm) =>{
    const [rows] = await db.execute(
        "SELECT * FROM music WHERE user_id = ? AND title LIKE ?",
        [userId,`%${searchTerm}%`]
    );
    return rows;
};

const updateMusic = async (songId, userId, title, releaseDate)=>{
    const[result] = await db.execute(
        "UPDATE music SET title = ?, created_at = ? WHERE id = ? AND user_id = ?",
        [title, releaseDate, songId, userId]
    );
    return result.affectedRows;
};

const deleteMusic = async (songId, userId) =>{
    const[result] = await db.execute(
        "DELETE FROM music WHERE id = ? AND user_id = ?",
        [songId, userId]
    );
    return result.affectedRows;
};

export default {createMusic, getMusicByUser, searchMusicByName, updateMusic, deleteMusic };