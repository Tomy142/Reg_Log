function toggleBox() {
    const box = document.getElementById('addmusic_box');
    box.style.display = box.style.display === 'none' || box.style.display === '' ? 'block' : 'none';
}

// Verifica si las cajas están vacías y muestra u oculta el mensaje.
function checkEmptyBoxes() {
    const musicBox = document.querySelector('.music_box');
    const albumBox = document.querySelector('.album_box');

    const musicMessage = musicBox.querySelector('.empty_message');
    const albumMessage = albumBox.querySelector('.empty_message');

    // Verificar si hay elementos dentro de la caja (aparte del mensaje)
    if (musicBox.children.length > 1) {
        musicMessage.style.display = 'none';
    } else {
        musicMessage.style.display = 'block';
    }

    if (albumBox.children.length > 1) {
        albumMessage.style.display = 'none';
    } else {
        albumMessage.style.display = 'block';
    }
}

// Función que puedes llamar cuando agregues o elimines elementos
function addMusicItem(content) {
    const musicBox = document.querySelector('.music_box');
    const newItem = document.createElement('div');
    newItem.textContent = content; // Aquí puedes ajustar el contenido del nuevo elemento.
    musicBox.appendChild(newItem);
    checkEmptyBoxes(); // Verifica el contenido después de agregar el elemento.
}

function addAlbumItem(content) {
    const albumBox = document.querySelector('.album_box');
    const newItem = document.createElement('div');
    newItem.textContent = content; // Aquí puedes ajustar el contenido del nuevo elemento.
    albumBox.appendChild(newItem);
    checkEmptyBoxes(); // Verifica el contenido después de agregar el elemento.
}

// Llamar a la función al cargar la página para verificar el contenido inicial
document.addEventListener('DOMContentLoaded', checkEmptyBoxes);
