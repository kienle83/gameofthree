'use strict';

var express     = require('express');
var bodyParser  = require('body-parser');
var socket      = require('socket.io');
var http        = require('http');

var app  = express();
var port = process.env.PORT || 10080;
//var host = 'localhost';

app.set('port', port);

// Create HTTP server
var server = http.createServer(app);

// Listen on provided port
//server.listen(port, host);
server.listen(port);

app.io = socket(server);

app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);
app.set('views', (__dirname));

// Files
app.use(express.static(require('path').join(__dirname, 'app')));
app.use('/app', express.static(__dirname + '/app'));
app.use('/socket', express.static(__dirname + '/node_modules/socket.io-client/'));

// enable parsing of application/json
app.use(bodyParser.json());

// allow CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

var players = [];

// ES6
app.get('/', (request, response) => {
    response.render('index');
});

app.io.on('connection', (client) => {
    console.log('Connected');

    client.join('game');
    players.push(client.id);

    client.on('chat message', (msg, player) => {
        client.broadcast.to('game').emit('chat message', msg, player, client.id);
    });

    client.on('disconnect', () => {
        console.log('socket disconnected (%s)', client.id);
    });

    client.on('close', () => {
        console.log('socket closed (%s)', client.id);
    });

});

module.exports = app;