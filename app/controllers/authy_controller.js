import userModel from "../models/user.js";
import db from "../config/db.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import musicModel from "../models/music.js";
import albumModel from "../models/album.js";
import { uploadProfile } from "../config/multer.js";


const register =async(req, res)=>{
    const {user, password, confirm_password, email, role} = req.body;
    try{

        if(password!== confirm_password)
        {
            return res.render("register", {error: "Las contraseñas no coinciden."});
        }

        const validRoles =["listener", "artist", "band"];
        if(!validRoles.includes(role)){
            return res.render("register", {error: "Rol inválido."});
        }

        const existingUser = await userModel.findUserByEmail(email);
        if (existingUser){
            return res.render("register",{error: "El email ya está registrado."});
        } 
        const [userCheck] = await db.execute("SELECT * FROM users WHERE username = ?",[user]);
        if(userCheck.length >0){
            return res.render("register", {error: "El nombre de usuario ya está registrado."});
        }

        const userId = await userModel.createUser(user, password, email, role);
        res.redirect("/login"); 
    }catch(error){
        console.error(error);
        res.render("register", {error: "Error al registrar usuario. Intenta de nuevo."});
    }
};

const login = async (req, res) =>{
    const {username, password} = req.body;
    try{
        const user = await userModel.findUserByUsername(username);
        if(!user || !(await bcrypt.compare(password, user.password))){
            return res.render("login", {error:"Usuario y/o contraseña incorrectos."});
        }
        console.log("Credenciales correctas, generando token");
        const token= jwt.sign(
            {id: user.id, username: user.username, role:user.role},
            process.env.JWT_SECRET,
            {expiresIn: "1h"}
        );
        res.cookie("token", token,{httpOnly:true,secure: false});
        res.redirect("/dashboard");
    }catch(error){
        console.error(error);
        res.render("login", {error:"Usuario y/o contraseña incorrectos."});
    }
}

const dashboard = async (req, res)=>{
    const userId = req.user.id;
    try{
        if (req.user.role === 'listener'){
            res.render("dashboard", {user: req.user});
        } else {
            const songsRaw = await musicModel.getMusicByUser(userId);
            const songs = songsRaw.map(song =>({
                ...song,
                created_at: song.created_at.toISOString().split('T')[0]
            }));
    
            const albumsRaw = await albumModel.getAlbumsByUser(userId);
            const albums = await Promise.all(albumsRaw.map(async (album) =>{
                const albumSongsRaw = await albumModel.getSongsInAlbum(album.id, userId);
                const albumSongs = albumSongsRaw.map(song =>({
                    ...song,
                    created_at: song.created_at.toISOString().split('T')[0]
                }));
                return {...album, songs: albumSongs};
            }));
    
            res.render("dashboard", {songs, albums, user: req.user});
        }
    }catch(error){
        console.error("Error al cargar el dashboard:", error);
        res.render("dashboard",{
            songs: [],
            albums: [],
            user: req.user,
            error: "Error al cargar el dashboard: " + error.message
        });
    }
};

const logout =(req, res)=>{
    res.clearCookie("token");
    res.redirect("/");
}

const addMusic = async(req, res) =>{
    const{song_name, release_date}= req.body;
    const file = req.file;
    try{
        if(!file){
            return res.render("add_M", {error: "Debes subir un archivo."});
        }
        const userId = req.user.id;
        const filePath =`/uploads/${file.filename}`;
        await musicModel.createMusic(song_name, filePath, userId);
        res.render("add_M", {success: "Canción subida con éxito"});
    }catch(error){
        console.error("Error al añadir musica:", error.message);
        if(error.code === "LIMIT_FILE_SIZE"){
            res.render("add_M", { error: " El archivo excede el limite de 10 MB."});
        }
        res.render("add_M", { error: error.message});
    }  
};

const addAlbum = async(req, res)=>{
    const{ album_name, release_date} = req.body;
    try{
        if(!album_name || !release_date){
            return res.render("add_M", { error: "Debes completar todos los campos."});
        }
        const userId = req.user.id;
        console.log("Creando álbum para usuario ID:", userId);
        console.log("Datos del álbum:", {album_name, release_date});
        const albumId = await albumModel.createAlbum(album_name, release_date, userId);
        console.log("Álbum creado con ID:", albumId);
        res.render("add_M", {success: "Álbum creado correctamente"});
    }catch(error){
        console.error("Error al crear album:", error);
        res.render("add_M", { error: "Error al crear el álbum " + error.message});
    }
};

const editContent = async (req, res) => {
    const userId = req.user.id;
    try {
        // Obtener todas las canciones del usuario para el <select> y formatear created_at
        const allSongsRaw = await musicModel.getMusicByUser(userId);
        const allSongs = allSongsRaw.map(song => ({
            ...song,
            created_at: song.created_at.toISOString().split('T')[0]
        }));

        if (req.method === "POST") {
            const { action, song_id, song_name, song_date, album_id, album_name, album_date } = req.body;
            if (action === "search") {
                const searchTerm = req.body.search_name;
                const songsRaw = await musicModel.searchMusicByName(userId, searchTerm);
                const songs = songsRaw.map(song => ({
                    ...song,
                    created_at: song.created_at.toISOString().split('T')[0]
                }));
                const albumsRaw = await albumModel.searchAlbumsByName(userId, searchTerm);
                const albumsWithSongs = await Promise.all(albumsRaw.map(async (album) => {
                    const albumSongsRaw = await albumModel.getSongsInAlbum(album.id, userId);
                    const albumSongs = albumSongsRaw.map(song => ({
                        ...song,
                        created_at: song.created_at.toISOString().split('T')[0]
                    }));
                    return { ...album, songs: albumSongs };
                }));
                return res.render("edit_content", { songs, albums: albumsWithSongs, allSongs, user: req.user });
            }

            if (action === "update_song" && song_id) {
                await musicModel.updateMusic(song_id, userId, song_name, song_date);
                const songsRaw = await musicModel.getMusicByUser(userId);
                const songs = songsRaw.map(song => ({
                    ...song,
                    created_at: song.created_at.toISOString().split('T')[0]
                }));
                const albumsRaw = await albumModel.getAlbumsByUser(userId);
                const albumsWithSongs = await Promise.all(albumsRaw.map(async (album) => {
                    const albumSongsRaw = await albumModel.getSongsInAlbum(album.id, userId);
                    const albumSongs = albumSongsRaw.map(song => ({
                        ...song,
                        created_at: song.created_at.toISOString().split('T')[0]
                    }));
                    return { ...album, songs: albumSongs };
                }));
                return res.render("edit_content", {
                    songs,
                    albums: albumsWithSongs,
                    allSongs,
                    user: req.user,
                    success: "Canción actualizada correctamente."
                });
            }

            if (action === "delete_song" && song_id) {
                const deletedRows = await musicModel.deleteMusic(song_id, userId);
                const songs = await musicModel.getMusicByUser(userId);
                const albums = await albumModel.getAlbumsByUser(userId);
                const albumsWithSongs = await Promise.all(albums.map(async (album) => {
                    const albumSongs = await albumModel.getSongsInAlbum(album.id, userId);
                    return { ...album, songs: albumSongs };
                }));
                if (deletedRows > 0) {
                    return res.render("edit_content", {
                        songs,
                        albums: albumsWithSongs,
                        allSongs,
                        user: req.user,
                        success: "Canción eliminada correctamente."
                    });
                } else {
                    return res.render("edit_content", {
                        songs,
                        albums: albumsWithSongs,
                        allSongs,
                        user: req.user,
                        error: "No se pudo eliminar la canción. Puede que no exista o no tengas permiso."
                    });
                }
            }

            if (action === "update_album" && album_id) {
                await albumModel.updateAlbum(album_id, userId, album_name, album_date);
                const songsRaw = await musicModel.getMusicByUser(userId);
                const songs = songsRaw.map(song => ({
                    ...song,
                    created_at: song.created_at.toISOString().split('T')[0]
                }));
                const albumsRaw = await albumModel.getAlbumsByUser(userId);
                const albumsWithSongs = await Promise.all(albumsRaw.map(async (album) => {
                    const albumSongsRaw = await albumModel.getSongsInAlbum(album.id, userId);
                    const albumSongs = albumSongsRaw.map(song => ({
                        ...song,
                        created_at: song.created_at.toISOString().split('T')[0]
                    }));
                    return { ...album, songs: albumSongs };
                }));
                return res.render("edit_content", {
                    songs,
                    albums: albumsWithSongs,
                    allSongs,
                    user: req.user,
                    success: "Álbum actualizado correctamente."
                });
            }

            if (action === "delete_album" && album_id) {
                await albumModel.deleteAlbum(album_id, userId);
                const songsRaw = await musicModel.getMusicByUser(userId);
                const songs = songsRaw.map(song => ({
                    ...song,
                    created_at: song.created_at.toISOString().split('T')[0]
                }));
                const albumsRaw = await albumModel.getAlbumsByUser(userId);
                const albumsWithSongs = await Promise.all(albumsRaw.map(async (album) => {
                    const albumSongsRaw = await albumModel.getSongsInAlbum(album.id, userId);
                    const albumSongs = albumSongsRaw.map(song => ({
                        ...song,
                        created_at: song.created_at.toISOString().split('T')[0]
                    }));
                    return { ...album, songs: albumSongs };
                }));
                return res.render("edit_content", {
                    songs,
                    albums: albumsWithSongs,
                    allSongs,
                    user: req.user,
                    success: "Álbum eliminado correctamente"
                });
            }

            if (action === "add_song_to_album" && album_id && song_id) {
                const success = await albumModel.addSongToAlbum(album_id, song_id, userId);
                const songsRaw = await musicModel.getMusicByUser(userId);
                const songs = songsRaw.map(song => ({
                    ...song,
                    created_at: song.created_at.toISOString().split('T')[0]
                }));
                const albumsRaw = await albumModel.getAlbumsByUser(userId);
                const albumsWithSongs = await Promise.all(albumsRaw.map(async (album) => {
                    const albumSongsRaw = await albumModel.getSongsInAlbum(album.id, userId);
                    const albumSongs = albumSongsRaw.map(song => ({
                        ...song,
                        created_at: song.created_at.toISOString().split('T')[0]
                    }));
                    return { ...album, songs: albumSongs };
                }));
                return res.render("edit_content", {
                    songs,
                    albums: albumsWithSongs,
                    allSongs,
                    user: req.user,
                    success: success ? "Canción agregada al álbum." : "Error al agregar canción al álbum."
                });
            }

            if (action === "remove_song_from_album" && album_id && song_id) {
                const success = await albumModel.removeSongFromAlbum(album_id, song_id, userId);
                const songsRaw = await musicModel.getMusicByUser(userId);
                const songs = songsRaw.map(song => ({
                    ...song,
                    created_at: song.created_at.toISOString().split('T')[0]
                }));
                const albumsRaw = await albumModel.getAlbumsByUser(userId);
                const albumsWithSongs = await Promise.all(albumsRaw.map(async (album) => {
                    const albumSongsRaw = await albumModel.getSongsInAlbum(album.id, userId);
                    const albumSongs = albumSongsRaw.map(song => ({
                        ...song,
                        created_at: song.created_at.toISOString().split('T')[0]
                    }));
                    return { ...album, songs: albumSongs };
                }));
                return res.render("edit_content", {
                    songs,
                    albums: albumsWithSongs,
                    allSongs,
                    user: req.user,
                    success: success ? "Canción desvinculada del álbum." : "Error al desvincular canción."
                });
            }
        } else {
            const songsRaw = await musicModel.getMusicByUser(userId);
            const songs = songsRaw.map(song => ({
                ...song,
                created_at: song.created_at.toISOString().split('T')[0]
            }));
            const albumsRaw = await albumModel.getAlbumsByUser(userId);
            const albumsWithSongs = await Promise.all(albumsRaw.map(async (album) => {
                const albumSongsRaw = await albumModel.getSongsInAlbum(album.id, userId);
                const albumSongs = albumSongsRaw.map(song => ({
                    ...song,
                    created_at: song.created_at.toISOString().split('T')[0]
                }));
                return { ...album, songs: albumSongs };
            }));
            res.render("edit_content", { songs, albums: albumsWithSongs, allSongs, user: req.user });
        }
    } catch (error) {
        console.error("Error al editar contenido:", error);
        res.render("edit_content", {
            songs: [],
            albums: [],
            allSongs: [],
            user: req.user,
            error: "Error al editar contenido: " + error.message
        });
    }
};

const updateProfile = async (req, res) =>{
    const userId = req.user.id;
    const { instagram, facebook, twitter, youtube, cbu_cvu} = req.body;
    const file = req.file;

    try {
        if (req.user.role !== 'artist' && req.user.role !== 'band') {
            return res.render("profile", { error: "Solo artistas y bandas pueden editar su perfil."});
        }

        console.log("Datos recibidos - req.body:", req.body);
        console.log("Archivo recibido - req.file:", req.file);

        const profileData = {
            instagram_link: instagram || null,
            facebook_link: facebook || null,
            twitter_link: twitter || null,
            youtube_link: youtube || null,
            cvu_cbu: cbu_cvu || null,
            profile_picture: file && file.filename ?  `/uploads/${file.filename}` : null
        };

        console.log("profileData antes de iterar:", profileData);

        if (!profileData || typeof profileData !== 'object' || Array.isArray(profileData)){
            throw new Error("profileData no es un objeto válido: " + JSON.stringify(profileData));
        }

        const updates = [];
        const values = [];
        for(const [key, value] of Object.entries(profileData)) {
            if (value !== null){
                updates.push(`${key} = ?`);
                values.push(value);
            }
        }

        if(updates.length > 0) {
            values.push(userId);
            await db.execute(
                `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
                values
            );
        }

        const updateUser = await userModel.findUserByUsername(req.user.username);
        res.render("profile", { user: updateUser, success: "Perfil actualizado correctamente."});
    } catch (error) {
        console.error("Error al actualizar perfil:", error);
        res.render("profile", { user: req.user, error: "Error al actualizar el perfil: " + error.message});
    }
};


const publicProfile = async (req, res) =>{
    const { username } = req.params;
    try {
        const user = await userModel.findUserByUsername(username);
        if(!user || (user.role !== 'artist' && user.role !== 'band')){
            return res.status(404).render("404", { error: "Perfil no encontrado."});
        }

        const songsRaw = await musicModel.getMusicByUser(user.id);
        const songs = songsRaw.map(song =>({
            ...song,
            created_at: song.created_at.toISOString().split('T')[0]
        }));

        const albumsRaw = await albumModel.getAlbumsByUser(user.id);
        const albums = await Promise.all(albumsRaw.map(async (album) =>{
            const albumSongsRaw = await albumModel.getSongsInAlbum(album.id, user.id);
            const albumSongs = albumSongsRaw.map(song => ({
                ...song,
                created_at: song.created_at.toISOString().split('T')[0]
            }));
            return {...album, songs: albumSongs};
        }));

        res.render("profile_public", {user, songs, albums});
    } catch (error) {
        console.error("Error al cargar perfil público:", error);
        res.render("profile_public", {
            user: null,
            songs: [],
            albums: [],
            error: "Error al cargar el perfil: " + error.message
        });
    }
};

const profile = async (req, res) => {
    try{
        const user = await userModel.findUserByUsername(req.user.username);
        res.render("profile", { user });
    } catch (error) {
        console.error("Error al cargar el perfil: ", error);
        res.render("profile", { error: "Error al cargar el perfil: " + error.message})
    }
};

const search = async (req, res) =>{
    const { query } = req.query;
    try{
        if (!query || query.trim() === ""){
            return res.json({
                songs: [],
                albums: [],
                artists: [],
                bands: [],
                error: "Ingrese un término de búsqueda."
            });
        }
        const searchTerm = `%${query.trim()}%`;

        const [songsRaw] = await db.execute(
            `SELECT m.*, u.username
            FROM music m
            JOIN users u ON m.user_id = u.id
            WHERE m.title LIKE ? AND (u.role = 'artist' OR u.role = 'band')`,
            [searchTerm]
        );
        const songs = songsRaw.map(song => ({
            ...song,
            created_at: song.created_at.toISOString().split('T')[0]
        }));

        const [albumsRaw] = await db.execute(
            `SELECT a.*, u.username
            FROM albums a
            JOIN users u ON a.user_id = u.id
            WHERE a.title LIKE ? AND (u.role = 'artist' OR u.role = 'band')`,
            [searchTerm]
        );
        const albums = albumsRaw.map(album =>({
            ...album,
            release_date: album.release_date.toISOString().split('T')[0]
        }));

        const [artistsRaw] = await db.execute(
            "SELECT username, profile_picture FROM users WHERE role = 'artist' AND username LIKE ?",
            [searchTerm]
        );
        const artists = artistsRaw;
        
        const [bandsRaw] = await db.execute(
            "SELECT username, profile_picture FROM users WHERE role = 'band' AND username LIKE ?",
            [searchTerm]
        );
        const bands = bandsRaw;
        
        res.json({songs, albums, artists, bands });
    } catch (error) {
        console.error("Error en la búsqueda:", error);
        res.json({
            songs: [],
            albums: [],
            artists: [],
            bands: [],
            error: "Error al realizar la búsqueda: " + error.message
        });
    }
};

export default {register, login, logout, dashboard, addMusic, addAlbum, editContent, updateProfile, publicProfile, profile, search};

