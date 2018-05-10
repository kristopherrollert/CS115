/*jshint esversion: 6 */
// ^ this is just for kris, please don't delete
/*
 *                               _    _
 *                              | |  (_)
 *      __ _   __ _  _   _  ___ | |_  _   ___
 *     / _` | / _` || | | |/ __|| __|| | / __|
 *    | (_| || (_| || |_| |\__ \| |_ | || (__
 *     \__,_| \__, | \__,_||___/ \__||_| \___|
 *               | |
 *               |_|
 *
 * Version: 1.0
 * Developers:
 *  Kristopher Rollert | Kai Schniedergers | Michelle Slaughter | Lorenzo Yabut
 *
 */

/* ------------------------------------------------------------------------- */
/* -------------------------------- GLOBALS -------------------------------- */
/* ------------------------------------------------------------------------- */

// KRIS: use events to prevent the database query from returning too early
//https://www.tutorialspoint.com/nodejs/nodejs_event_emitter.htm

/* Constants to be changed before release */
const clientID = "1951f93df40942a59574ed5d17e5425a";
const clientSecret = "048262fe59c048e18ce94d18d5784078";
const port = 3000;
const baseUrl = `http://localhost:${port}`;

/* Server Modules */
const http = require('http');
const crypto = require('crypto');
const events = require('events');
const mongo = require('mongodb');
const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const fetch = require("node-fetch");


/* Local Modules */
const queue = require('./queue');

const mongoClient = mongo.MongoClient;
const app = express();

/* TODO : I am unsure what this does, but I feel like it shouldn't be a global
 *        varible. -kris */
var authStateKey = 'spotify_auth_state';
const debug = true; // this can be set to false to hide console.logs

/* ------------------------------------------------------------------------- */
/* ----------------------------- DATABASE CODE ----------------------------- */
/* ------------------------------------------------------------------------- */
/*
var database = {
    /* General Databse Information */ /*
    name: "aqusticDB",
    url: 'mongodb://localhost:27017/',
    createCollection: function(collectionName, callback = null) {
        mongoClient.connect(this.url, function(err, db) {
            if (err) throw err;
            var database = db.db(this.name);
            database.createCollection(collectionName,
                function(err, result) {
                    if (err) throw err;
                    if (debug) console.log(`Created ${collectionName} collection!`);
                    db.close();
                    if (callback) callback(result);
                }
            );
        });
    },
    insertOne: function (collectionName, item, callback = null) {
        mongoClient.connect(this.url, function (err, db) {
            if (err) throw err;
            var database = db.db(this.name);
            database.collection(collectionName).insertOne(item,
                function (err, result) {
                    if (err) throw err;
                    if (debug) console.log("Inserted One Element");
                    //console.log(result);
                    db.close();
                    if (callback) callback(result);
                }
            );
        });
    },
    insertMany: function (collectionName, items, callback = null) {
        mongoClient.connect(this.url, function (err, db) {
            if (err) throw err;
            var database = db.db(this.name);
            database.collection(collectionName).insertOne(item,
                function(err, result) {
                    if (err) throw err;
                    if (debug) console.log("Inserted Elements");
                    db.close();
                    if (callback) callback(result);
                }
            );
        });
    },

    /* returns an array of */ /*
    findOne: function (collectionName, query = {}, callback = null) {
        return mongoClient.connect(this.url, function (err, db) {
            if (err) throw err;
            var database = db.db(this.name);
            return database.collection(collectionName).findOne(query,
                function (err, result) {
                    if (err) throw err;
                    db.close();
                    if (debug) {
                        console.log("FIND ONE RESULT: ");
                        //console.log(result);
                    }
                    if (callback) callback(result);
                }
            );
        });
    },

    find: function(collectionName, query = {}, limit = 0, callback = null){
        return mongoClient.connect(this.url, function (err, db) {
            if (err) throw err;
            var database = db.db(this.name);
            return database.collection(collectionName).find(query).limit(limit).toArray(
                function (err, result) {
                    if (err) throw err;
                    if (debug) {
                        console.log("FIND RESULT: ");
                        console.log(result);
                    }
                    db.close();
                    if (callback) callback(result);
                }
            );
        });
    },

    findAll: function (collectionName, query = {}, callback = null) {
        return this.find(collectionName, query, 0, callback );
    },

    updateOne: function (collectionName, query, newValues, callback = null) {
        mongoClient.connect(this.url, function(err, db){
            if (err) throw err;
            var database = db.db(this.name);
            database.collection(collectionName).updateOne(query, newValues,
                function(err, result) {
                    if (err) throw err;
                    if (debug) {
                        console.log("UPDATE ONE RESULT:");
                        console.log(result);
                    }
                    db.close();
                    if (callback) callback(result);
            });
        });
    },

    update: function (collectionName, query, newValues, callback = null) {
        mongoClient.connect(this.url, function(err, db){
            if (err) throw err;
            var database = db.db(this.name);
            database.collection(collectionName).updateMany(query, newValues,
                function(err, result) {
                    if (err) throw err;
                    if (debug) {
                        console.log("UPDATE RESULT:");
                        //console.log(result);
                    }
                    db.close();
                    if (callback) callback(result);
                });
        });
    },

    deleteOne: function (collectionName, query, callback = null) {
        mongoClient.connect(this.url, function(err, db){
            if (err) throw err;
            var database = db.db(this.name);
            database.collection(collectionName).deleteOne(query,
                function(err, result) {
                    if (err) throw err;
                    if (debug) console.log("DELETED ELEMENT");
                    db.close();
                    if (callback) callback(result);
            });
        });
    },

    delete: function (collectionName, query, callback = null) {
        mongoClient.connect(this.url, function(err, db){
            if (err) throw err;
            var database = db.db(this.name);
            database.collection(collectionName).deleteMany(query,
                function(err, result) {
                    if (err) throw err;
                    if (debug) console.log(`DELETED ${result.result.n} ELEMENT(S)`);
                    db.close();
                    if (callback) callback(result);
            });
        });
    },

};


database.createCollection("ACCOUNTS");

/* -------------------------------------------------------------------------- */
/* ---------------------------- SONG OBJECT/INFO ---------------------------- */
/* -------------------------------------------------------------------------- */

function Song (prev = null, next = null) {
    this.prev = prev;
    this.next = next;

    this.songId = null;
    this.likes = 0;
    this.dislikes = 0;
    this.score = 0;

    this.getSongId = function() {
        return this.id;
    };

    this.setSongId = function(songId) {
        this.songId = songId;
    };

    this.getLikes = function() {
        return this.likes;
    };

    this.getDislikes = function() {
        return this.dislikes;
    };

    this.getScore = function() {
        return this.score;
    };

    this.addLike = function() {
        this.likes++;
        this.updateScore();
    };

    this.addDislike = function() {
        this.dislikes++;
        this.updateScore();
    };

    this.updateScore = function() {
        //TODO Better voting score algorithm goes here
        this.score = this.likes - this.dislikes;
    };
}

/* -------------------------------------------------------------------------- */
/* ------------------------------- MIDDLEWARE ------------------------------- */
/* -------------------------------------------------------------------------- */

/*
 * description: middleware thatremoves the browwer from blocking certain
 * requests.
 *
 * notes: When this project is completed, this should not be here, it should be
 * in the web.config file.
 */
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

/*
 * description: middleware that parses cookies from the client folder.
 */
app.use(express.static(__dirname + '/client')).use(cookieParser());

// these allow us to support JSON-encoded bodies and URL-encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

/* ------------------------------------------------------------------------- */
/* ------------------------------- ENDPOINTS ------------------------------- */
/* ------------------------------------------------------------------------- */
app.get('/signin', function(req, res){
    res.sendFile(__dirname+"\\client\\signin.html");
});

app.get('/signup', function(req, res){
    res.sendFile(__dirname+"\\client\\signup.html");
});

app.put('/account/sign-in', function (req, res) {
    let username = req.body.username || '';
    let password = req.body.password || '';
    if (password.length < 1 && username.length < 1)
        res.send({error: "Enter a username and a password!"});
    else if (username.length < 1)
        res.send({error: "Username cannot be blank!"});
    else if (password.length < 1)
        res.send({error: "Password cannot be blank!"});
    else {
        database.findOne("ACCOUNTS", {username: username},
            function (result) {
                if (result == null)
                    res.send({error: "Username not found!"});
                else {
                    var hashPass = hashPassword(password, result.salt);
                    if (result.password != hashPass)
                        res.send({error: "Password is not correct!"});
                    else {
                        res.send({loginCode: result.loginCode });
                    }
                }
            });
    }
});


app.put('/account/sign-up', function (req, res) {
    let minUserLen = 4;
    let maxUserLen = 20;
    let maxPassLen = 128;
    let minPassLen = 5;

    let username = req.body.username || '';
    let password = req.body.password || '';
    let passwordConf = req.body.passwordConf || '';

    // TODO CHECK IF USERNAME IS TAKEN
    if (username.length < minUserLen)
        res.send({error : `Username should be at least ${minUserLen} characters!`});
    else if (username.length > maxUserLen )
        res.send({error : `Username is too long!`});
    else if (username.length > maxUserLen)
        res.send({error : `Username should not more than ${maxUserLen} characters!`});
    else if (!isValid(username))
        res.send({error : `Username cannot contain symbols!`});
    else if (password.length < minPassLen)
        res.send({error : `Password should be more than ${minPassLen} characters!`});
    else if (password.length > maxPassLen)
        res.send({error : `Password is too long!`});
    else if (password !== passwordConf)
        res.send({error : `Passwords do not match!`});
    else {
        var passwordData = saltHashPassword(password);
        var loginCode = generateRandomString(16);
        var query = {
            username: username,
            password: passwordData.hashPassword,
            salt: passwordData.salt,
            loginCode: loginCode
        };
        database.insertOne("ACCOUNTS", query);
        res.send({username: username, loginCode: loginCode});
    }
});


app.get('/spotify-authorization', function(req, res){
    console.log("GOT SPOTIFY AUTH");

    // cookie to ensure browser/server connection is secure
    let state = servFunc.generateRandomString(16);
    res.cookie(authStateKey, state);

    // redirects to spotify authorization page, returns to the redirect_uri
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
             response_type: 'code',
             client_id: clientID,
             scope: 'streaming user-read-private user-read-email',
             redirect_uri: `${baseUrl}/callback/`,
             state: state
     }));
});

/*
 * description: puts the html from auth.html into the /settings page
 *
 */
app.get('/settings', function(req, res){
    res.sendFile(__dirname+"\\client\\auth.html");
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[authStateKey] : null;

    if (state === null || state !== storedState) {
        //TODO: make a better error report
        res.redirect('/#' +
            querystring.stringify({
            error: 'state_mismatch'
        }));
    }
    else {
        res.clearCookie(authStateKey);
        var authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code: code,
                redirect_uri: `${baseUrl}/callback/`,
                grant_type: 'authorization_code'
                },
            headers: {
                'Authorization': 'Basic ' + (new Buffer(clientID + ':' + clientSecret).toString('base64'))
            },
            json: true
        };

        request.post(authOptions, function(error, response, body) {
            if (!error && response.statusCode === 200) {
                var access_token = body.access_token;
                var refresh_token = body.refresh_token;

                var options = {
                    url: 'https://api.spotify.com/v1/me',
                    headers: { 'Authorization': 'Bearer ' + access_token },
                    json: true
                };

                // use the access token to access the Spotify Web API
                request.get(options, function(error, response, body) {
                    console.log(body);
                });

                // we can also pass the token to the browser to make requests from there
                res.redirect('/#' +
                    querystring.stringify({
                        access_token: access_token,
                        refresh_token: refresh_token
                    })
                );
            }
            else {
                // TODO better error handleing
                res.redirect('/#' +
                    querystring.stringify({
                        error: 'invalid_token'
                    })
                );
            }
        });
    }
});

app.put('/play-song', function(req, res) {
    console.log("I'm here!");
    let songURI = 'spotify:album:5ht7ItJgpBH7W6vJ5BqpPr';
    let authToken = 'BQDSLgfRZeVV7l2XzAW144uXYFkLFkLkIk1_kluPXDH7mqcAFXWGnEFq8xjvt-NBCg11XwMYUnNmYRhkLH4Y8DBmYS-1XAytMeqP1sCNi12OeeNwT68APMZiAtCyQTlS7m2-tACD7g4lGHEzR3iyf4mwHRV1-LUSWA' //Still need to figure out
    playSong(authToken, songURI);
    console.log("here now");
});

/* ------------------------------------------------------------------------- */

app.listen(port, (err) => {
    if (err) {
        return console.log('Something bad happened', err);
    }
    console.log(`server is listening on ${port}`);
});


/* ------------------------------------------------------------------------- */
/* --------------------------- GENERAL FUNCTIONS --------------------------- */
/* ------------------------------------------------------------------------- */

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
function generateRandomString(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

/**
 * hash password with sha512.
 * @function
 * @param {string} password - List of required fields.
 * @param {string} salt - Data to be validated.
 */
var sha512 = function(password, salt){
    var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    var value = hash.digest('hex');
    console.log("SHA");
    console.log(value);
    return {
        salt:salt,
        passwordHash:value
    };
};

/**
 * returns hashed password and salt
 *
 */
function saltHashPassword(userpassword) {
    let salt = generateRandomString(16);
    let passwordData = sha512(userpassword, salt);
    console.log("SALT HASH PASS");
    console.log(passwordData);
    return { hashPassword: passwordData.passwordHash,
             salt: passwordData.salt };
}

function hashPassword(userpassword, salt) {
    let passwordData = sha512(userpassword, salt);
    return passwordData.passwordHash;
}

/*
 * Returns true if string has special characters
 */
function isValid(str){
 return !/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(str);
}

function getLargerSong(song1, song2) {
    let score1 = song1.getScore();
    let score2 = song2.getScore();
    if(score1 > score2)
        return song1;
    else if(score2 > score1)
        return song2;
    return null;
}

function playSong(authToken, songID) {

    var header = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": "Bearer " + authToken,
    }

    var body = {

        context_uri: songID,
    }

    var init = {
        method: 'PUT',
        headers: header,
        body: body,
    }

    //TODO make the query "device_id" equal to the name of the player
    return fetch(`https://api.spotify.com/v1/me/player/play`, init)
        .then(function (res) {
            if (res.status == 204) {
                console.log("Playing Song...")
            }
            else {
                console.log(JSON.stringify(res.status));
            }
        })
}
