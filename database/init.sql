--  Abrir CMD  en UnMardeMusicas\database y Ejecutar C:\xampp\mysql\bin\mysql.exe -u root -p

CREATE DATABASE IF NOT EXISTS unmardemusicas;
USE unmardemusicas;

CREATE TABLE users(
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, 
    email VARCHAR(100) NOT NULL UNIQUE,
    role ENUM('listener', 'artist', 'band') NOT NULL,
    profile_picture VARCHAR(255),
    facebook_link VARCHAR(255),
    instagram_link VARCHAR(255),
    youtube_link VARCHAR(255),
    twitter_link VARCHAR(255),
    cvu_cbu VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP 
);

CREATE TABLE music(
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE albums(
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    release_date DATE NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE album_songs(
    album_id INT NOT NULL, 
    song_id INT NOT NULL,
    PRIMARY KEY (album_id, song_id),
    FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE,
    FOREIGN KEY (song_id) REFERENCES music(id) ON DELETE CASCADE
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_music_user ON music(user_id);
CREATE INDEX idx_albums_user ON albums(user_id);