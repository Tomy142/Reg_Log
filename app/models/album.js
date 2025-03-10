import db from "../config/db.js";

const createAlbum = async (title, releaseDate, userId) => {
    console.log("Ejecutando INSERT con:", {title, releaseDate, userId});
    const [result] = await db.execute(
        "INSERT INTO albums (title, release_date, user_id) VALUES (?,?,?)",
        [title, releaseDate, userId]
    );
    console.log("Resultado del INSERT:", result);
    return result.insertId;
};

const getAlbumsByUser = async (userId) => {
    const [rows] = await db.execute("SELECT * FROM albums WHERE user_id = ?", [userId]);
    return rows;
};

const searchAlbumsByName = async (userId, searchTerm) => {
    const[rows] = await db.execute(
        "SELECT * FROM albums WHERE user_id = ? AND title LIKE ?",
        [userId,`%${searchTerm}%`]
    );
    return rows;
};

const updateAlbum = async (albumId, userId, title, releaseDate) =>{
    const [result] = await db.execute(
        "UPDATE albums SET title = ?, release_date = ? WHERE id = ? AND user_id = ?",
        [title, releaseDate, albumId, userId]
    );
    return result.affectedRows;
};

const deleteAlbum = async (albumId, userId) =>{
    const [result] = await db.execute(
        "DELETE FROM albums WHERE id = ? AND user_id = ?",
        [albumId, userId]
    );
    return result.affectedRows;
};

const addSongToAlbum = async (albumId, songId, userId)=>{
    const[albumCheck] = await db.execute("SELECT * FROM albums WHERE id = ? AND user_id = ?", [albumId, userId]);
    const[songCheck] = await db.execute("SELECT * FROM music WHERE id = ? AND user_id = ?", [songId, userId]);
    if(albumCheck.length === 0 || songCheck.length === 0) return false;
    const [result] = await db.execute("INSERT IGNORE INTO album_songs (album_id, song_id) VALUES (?, ?)",
        [albumId, songId]
    );
    return result.affectedRows;
};

const removeSongFromAlbum = async (albumId, songId, userId) => {
    const [albumCheck] = await db.execute("SELECT * FROM albums WHERE id = ? AND user_id = ?",[albumId, userId]);
    if(albumCheck.length === 0) return false;
    const [result] = await db.execute(
        "DELETE FROM album_songs WHERE album_id = ?  AND song_id = ?",
        [albumId, songId]
    );
    return result.affectedRows;
};

const getSongsInAlbum = async (albumId, userId) => {
    const [rows] = await db.execute(
        "SELECT m.* FROM music m JOIN album_songs ON m.id = album_songs.song_id WHERE album_songs.album_id = ? AND m.user_id = ?",
        [albumId, userId]
    );
    return rows;
};

export default { createAlbum, getAlbumsByUser, searchAlbumsByName, updateAlbum, deleteAlbum, addSongToAlbum, removeSongFromAlbum, getSongsInAlbum };