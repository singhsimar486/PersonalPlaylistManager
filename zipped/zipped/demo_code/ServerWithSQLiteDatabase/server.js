const express = require('express');
const http = require('http');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const fs = require('fs');
const routes = require('./routes/index');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('data/db_1200iRealSongs');

const app = express();
const PORT = process.env.PORT || 3000;

app.locals.pretty = true;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.post('/register', (request, response) => {
	const { userid, password } = request.body;
  
	if (!userid || !password) {
	  return response.status(400).json({ error: 'Both userid and password are required.' });
	}
  
	const role = 'guest';
  
	const sql = 'INSERT INTO users (userid, password, role) VALUES (?, ?, ?)';
	const values = [userid, password, role];
  
	db.run(sql, values, (err) => {
	  if (err) {
		console.error(err);
		if (err.message.includes('SQLITE_CONSTRAINT: UNIQUE')) {
		  return response.status(400).json({ error: 'User ID already exists.' });
		}
		return response.status(500).json({ error: 'Registration failed.' });
	  }
	  return response.status(200).json({ message: 'Registration successful.' });
	});
  });

function methodLogger(request, response, next) {
  console.log("METHOD LOGGER");
  console.log("================================");
  console.log("METHOD: " + request.method);
  console.log("URL:" + request.url);
  next();
}

function headerLogger(request, response, next) {
  console.log("HEADER LOGGER:");
  console.log("Headers:");
  for (k in request.headers) console.log(k);
  next();
}

function requireAuthentication(request, response, next) {
	if (request.user_role === 'guest') {
	  return response.status(403).json({ error: 'Authentication required.' });
	}
	next();
  }

// Register middleware with dispatcher
// ORDER MATTERS HERE
// Middleware
app.use(routes.authenticate); // Authenticate user
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));

// Uncomment the following lines if you want to use the methodLogger and headerLogger middleware
// app.use(methodLogger);
// app.use(headerLogger);

// Routes
app.get('/index.html', routes.index);
//app.get('/songs', routes.find);
app.get('/users', routes.users);
app.get('/song/*', routes.songDetails);

app.use(express.static(__dirname + '/public'));

app.get(['/', '/mytunes.html', '/mytunes', '/index.html'], (request, response) => {
	response.sendFile(path.join(__dirname, 'views', 'index.html'));
  });

app.get('/songs', (request, response) => {
  console.log(request.path);
  let songTitle = request.query.title;
  let titleWithPlusSigns = songTitle.trim().replace(/\s/g, '+');
  console.log('titleWithPlusSigns: ' + titleWithPlusSigns);

  console.log('query: ' + JSON.stringify(request.query));
  if (!songTitle) {
    response.json({ message: 'Please enter Song Title' });
    return;
  }

app.post('/savePlaylist', (request, response) => {
	const { playlistName, songs } = request.body;
	const userid = request.session.userid; 
  
	const insertPlaylistSql = 'INSERT INTO playlists (name, userid) VALUES (?, ?)';
	db.run(insertPlaylistSql, [playlistName, userid], function(err) {
	  if (err) {
		return response.status(500).json({ error: err.message });
	  }
	  response.status(201).json({ message: 'Playlist saved successfully', playlistId: this.lastID });
	});
  });
  
  app.get('/getUserPlaylists', (request, response) => {
	const userid = request.session.userid;
	db.all('SELECT * FROM playlists WHERE userid = ?', userid, (err, rows) => {
	  if (err) {
		return response.status(500).json({ error: err.message });
	  }
	  response.json(rows);
	});
  });
  
  

  const options = {
    "method": "GET",
    "hostname": "itunes.apple.com",
    "port": null,
    "path": `/search?term=${titleWithPlusSigns}&entity=musicTrack&limit=3`,
    "headers": {
      "useQueryString": true
    }
  };

  http.request(options, function (apiResponse) {
    let songData = '';
    apiResponse.on('data', function (chunk) {
      songData += chunk;
    });
    apiResponse.on('end', function () {
      response.contentType('application/json').json(JSON.parse(songData));
    });
  }).end();
});

// Start server
app.listen(PORT, err => {
  if (err) console.log(err);
  else {
    console.log(`Server listening on port: ${PORT} CNTL:-C to stop`);
    console.log(`To Test:`);
	console.log('http://localhost:3000');
    console.log('http://localhost:3000/users');
    
  }
});
