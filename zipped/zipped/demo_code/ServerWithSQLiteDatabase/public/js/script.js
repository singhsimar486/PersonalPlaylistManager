function getSong() {
    let songTitle = document.getElementById('songTitleTextField').value.trim();
    console.log('songTitle: ' + songTitle);
    if (songTitle === '') {
        return alert('Please enter a Song Title');
    }
  
    let searchResultsHeading = document.getElementById('searchResultsHeading');
    searchResultsHeading.textContent = `Songs matching: ${songTitle}`;
  
    let searchResultsTableBody = document.getElementById('searchResultsTableBody');
    searchResultsTableBody.innerHTML = '';
  
    // Making the HTTP request to the server
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
            let response = JSON.parse(xhr.responseText);
            response.results.forEach((result) => {
                addToSearchResultsTable(result.trackName, result.artistName, result.artworkUrl100);
            });
        }
    };
    xhr.open('GET', `/songs?title=${songTitle}`, true);
    xhr.send();
  }
  
  // Adding song to the playlist table
  function addToPlaylistTable(title, artist, artworkUrl) {
    let playlistTableBody = document.getElementById('playlistTableBody');
    let row = playlistTableBody.insertRow();
    row.innerHTML = `
        <td>
            <button onclick="removeFromPlaylist(this)">-</button>
            <button onclick="moveUp(this)">🔼</button>
            <button onclick="moveDown(this)">🔽</button>
        </td>
        <td>${title}</td>
        <td>${artist}</td>
        <td><img src="${artworkUrl}" alt="${title} Artwork"></td>
    `;
  }
  
  // Adding song to the search table
  function addToSearchResultsTable(title, artist, artworkUrl) {
    let searchResultsTableBody = document.getElementById('searchResultsTableBody');
    let row = searchResultsTableBody.insertRow();
    row.innerHTML = `
        <td><button onclick="addToPlaylist('${title}', '${artist}', '${artworkUrl}')">+</button></td>
        <td>${title}</td>
        <td>${artist}</td>
        <td><img src="${artworkUrl}" alt="${title} Artwork"></td>
    `;
  }
  
  // Remove a song from the playlist
  function removeFromPlaylist(button) {
      let row = button.parentNode.parentNode;
      let playlistTableBody = document.getElementById('playlistTableBody');
      playlistTableBody.removeChild(row);
      updateLocalStorage();
  }
  
  // Moving a song up in the playlist
  function moveUp(button) {
      let row = button.parentNode.parentNode;
      let previousRow = row.previousElementSibling;
      if (previousRow) {
          row.parentNode.insertBefore(row, previousRow);
          updateLocalStorage();
      }
  }
  
  // Moving a song down in the playlist
  function moveDown(button) {
      let row = button.parentNode.parentNode;
      let nextRow = row.nextElementSibling;
      if (nextRow) {
          row.parentNode.insertBefore(nextRow, row);
          updateLocalStorage();
      }
  }
  
  // Adding songs to the Playlist
  function addToPlaylist(title, artist, artworkUrl) {
      addToPlaylistTable(title, artist, artworkUrl);
      updateLocalStorage();
  }
  
  // Local storage
  function loadPlaylistFromLocalStorage() {
    let playlistTableBody = document.getElementById('playlistTableBody');
    let playlistData = JSON.parse(localStorage.getItem('playlist')) || [];
  
    playlistTableBody.innerHTML = '';
  
    playlistData.forEach((song) => {
        addToPlaylistTable(song.title, song.artist, song.artworkUrl);
    });
  }
  
  // Updating local storage
  function updateLocalStorage() {
      let playlistTableBody = document.getElementById('playlistTableBody');
      let playlistData = [];
  
      for (let i = 0; i < playlistTableBody.rows.length; i++) {
          let row = playlistTableBody.rows[i];
          let title = row.cells[1].textContent;
          let artist = row.cells[2].textContent;
          let artworkUrl = row.cells[3].querySelector('img').src;
          playlistData.push({ title, artist, artworkUrl });
      }
  
      localStorage.setItem('playlist', JSON.stringify(playlistData));
  }
  
  document.addEventListener('DOMContentLoaded', function () {
    loadPlaylistFromLocalStorage();
  
    // Add event listeners
    document.getElementById('submit_button').addEventListener('click', getSong);
    document.getElementById('createPlaylistButton').addEventListener('click', savePlaylist);
  });

  document.getElementById('registrationForm').addEventListener('submit', function (event) {
    event.preventDefault();
  
    const userid = document.getElementById('useridField').value.trim();
    const password = document.getElementById('passwordField').value.trim();
  
    fetch('/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', 
        },
        body: JSON.stringify({ userid, password }), 
      })
        .then((response) => response.json())
        .then((data) => {
        })
        .catch((error) => {
          console.error(error);
        });
  });

  function createPlaylist(title, artist) {
    const playlistName = prompt('Enter a name for your playlist:');
  
    if (playlistName) {
      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = () => {
        if (xhr.readyState == 4) {
          if (xhr.status == 201) {
            alert('Playlist created successfully');
          } else {
            alert('Failed to create playlist');
          }
        }
      };
      xhr.open('POST', '/createPlaylist', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify({ playlistName }));
    }
  }
  
  function getUserPlaylists() {
    fetch('/userPlaylists', {
      method: 'GET',
    })
      .then((response) => response.json())
      .then((data) => {
        const playlistsContainer = document.getElementById('playlistsContainer');
        playlistsContainer.innerHTML = '';
  
        data.forEach((playlist) => {
          const playlistItem = document.createElement('div');
          playlistItem.textContent = playlist.playlist_name;
          playlistsContainer.appendChild(playlistItem);
        });
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  function getAdminUserPlaylists(targetUserid) {
    fetch(`/adminUserPlaylists/${targetUserid}`, {
      method: 'GET',
    })
      .then((response) => response.json())
      .then((data) => {
        const playlistsContainer = document.getElementById('playlistsContainer');
        playlistsContainer.innerHTML = '';
  
        data.forEach((playlist) => {
          const playlistItem = document.createElement('div');
          playlistItem.textContent = playlist.playlist_name;
          playlistsContainer.appendChild(playlistItem);
        });
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  function savePlaylist() {
    const playlistName = document.getElementById('playlistName').value; 
  const songs = getSongsFromPlaylist(); 

  if (!playlistName) {
    alert("Please enter a playlist name.");
    return;
  }

  fetch('/savePlaylist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playlistName, songs })
  })
  .then(response => response.json())
  .then(data => {
    console.log('Playlist saved', data);
  })
  .catch(error => console.error('Error saving playlist', error));
  }
  

  function loadUserPlaylists() {
    fetch('/getUserPlaylists')
    .then(response => response.json())
    .then(playlists => {
      const playlistsContainer = document.getElementById('playlistsContainer'); 
      playlistsContainer.innerHTML = '';
      playlists.forEach(playlist => {
        const playlistItem = document.createElement('div');
        playlistItem.textContent = playlist.name; 
        playlistsContainer.appendChild(playlistItem);
      });
    })
    .catch(error => console.error('Error loading playlists', error));
  }
  
  document.addEventListener('DOMContentLoaded', function () {
    loadUserPlaylists();
  });
  
  
  
  
  