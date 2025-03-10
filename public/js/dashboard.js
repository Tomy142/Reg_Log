document.addEventListener('DOMContentLoaded', () =>{
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio =>{
        audio.addEventListener('play', () =>{
            audioElements.forEach(otherAudio => {
                if (otherAudio !== audio) {
                    otherAudio.pause();
                }
            });
        });
    });

    const musicBox = document.querySelector('.music_box');
    const albumBox = document.querySelector('.album_box');

    if (musicBox) {
        const musicMessage = musicBox.querySelector('.empty_message');
        const hasSongs = musicBox.querySelector('.song_list') !== null;
        if (musicMessage){
            musicMessage.style.display = hasSongs ? 'none' : 'block';
        }
    }

    if(albumBox){
        const albumMessage = albumBox.querySelector('.empty_message');
        const hasAlbums = albumBox.querySelector('.album_list') !== null;
        if (albumMessage){
            albumMessage.style.display = hasAlbums ? 'none' : 'block';
        }
    }

    const searchForm = document.getElementById('search-form');
    const searchResultsBox = document.getElementById('search-results');
    if (searchForm) {
        searchForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const query = searchForm.querySelector('input[name="query"]').value;

            try{
                const response = await fetch(`/search?query=${encodeURIComponent(query)}`);
                const data = await response.json();

                document.getElementById('songs-results').innerHTML = '';
                document.getElementById('albums-results').innerHTML = '';
                document.getElementById('artists-results').innerHTML = '';
                document.getElementById('bands-results').innerHTML = '';

                if (data.error) {
                    searchResultsBox.innerHTML = `<p class="error">${data.error}</p>`;
                } else {
                        if (data.songs.length > 0) {
                            document.getElementById('songs-results').innerHTML = `
                            <h4>Canciones</h4>
                            <ul>${data.songs.map(song => `
                                <li><a href="/profile/${song.username}">${song.title} - ${song.username}</a> (Subida: ${song.created_at})</li>
                                `).join('')}</ul>
                            `;
                        }

                        if (data.albums.length > 0) {
                            document.getElementById('albums-results').innerHTML = `
                            <h4>Álbumes</h4>
                            <ul>${data.albums.map(album => `
                                <li><a href="/profile/${album.username}">${album.title} - ${album.username}</a> (Lanzamiento: ${album.release_date})</li>
                                `).join('')}</ul>
                            `;
                        }

                        if (data.artists.length > 0){
                            document.getElementById('artists-results').innerHTML = `
                            <h4>Artistas</h4>
                            <ul>${data.artists.map(artist => `
                                <li><a href="/profile/${artist.username}">${artist.username}</a></li>
                                `).join('')}</ul>
                            `;
                        }

                        if (data.bands.length > 0) {
                            document.getElementById('bands-results').innerHTML = `
                                <h4>Bandas</h4>
                                <ul>${data.bands.map(band => `
                                    <li><a href="/profile/${band.username}">${band.username}</a></li>
                                `).join('')}</ul>
                            `;
                        }
                        searchResultsBox.style.display = (data.songs.length || data.albums.length || data.artists.length || data.bands.length) ? 'block' : 'none';
                    }
                } catch (error) {
                    console.error('Error en la búsqueda:', error);
                    searchResultsBox.innerHTML = '<p class="error">Error al buscar. Intenta de nuevo. </p>';
                    searchResultsBox.style.display = 'block';
                }
            });
        }
    });
