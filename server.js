/* jslint node: true */

var
    app = require('express')(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server, {log: false}),
    fs = require('fs'),
	p1 = { status: false },
	p2 = { status: false },
    ball = {};

Math.tand = function (deg) {
	var rad = deg * Math.PI / 180;
	return Math.tan(rad);
};

Math.atand = function (deg) {
	var rad = deg * Math.PI / 180;
	return Math.atan(rad);
};

Math.cosd = function (deg) {
    var rad = deg * Math.PI / 180;
    return Math.cos(rad);
};

Math.sind = function (deg) {
    var rad = deg * Math.PI / 180;
    return Math.sin(rad);
};

Math.arbitrary = function (min, max) {
    return (Math.random() * (max - min + 1)) + min;
};

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/views/index.html');
});

app.get('/resources/reset.css', function (req, res) {
    res.sendfile(__dirname + '/resources/reset.css');
});

app.get('/resources/style.css', function (req, res) {
    res.sendfile(__dirname + '/resources/style.css');
});

app.get('/scripts/conversion.js', function (req, res) {
    res.sendfile(__dirname + '/scripts/conversion.js');
});

app.get('/scripts/main.js', function (req, res) {
    res.sendfile(__dirname + '/scripts/main.js');
});

server.listen(8000, function () {
    console.log('Listening on port', server.address().port);
});

io.sockets.on('connection', function (socket) {
    if (p1.status === false && p2.status === false) {
		p1.status = true;
		p1.socket = socket;
		p1.socket.emit('set_player', 'p1');
		p1.socket.on('player_set', function (player) {
			console.log('Player1 has been set');
			p1.set = true;
		});
	} else if (p1.status === true && p2.status === false) {
		p2.status = true;
		p2.socket = socket;
		p2.socket.emit('set_player', 'p2');
		p2.socket.on('player_set', function (player) {
			console.log('Player2 has been set');
			p2.set = true;
			if (p1.set && p2.set) {
				io.sockets.emit('sync');
				p1.socket.on('position', function (pos) {
					p1.position = pos;
					p2.socket.volatile.emit('received_position', pos - 6);
				});
				p2.socket.on('position', function (pos) {
					p2.position = pos;
					p1.socket.volatile.emit('received_position', pos - 6);
				});
				gameloop();
			}
		});
	} else {
		console.error('Error setting player');
	}
});

function gameloop() {
	var gametimeout = setTimeout(function() {
		gameloopfunction();
	}, 3000);
}

function gameloopfunction() {
	var direction = Math.floor(Math.random() * 360);
	ball.slope = {
		rise: Math.sind(direction),
		run: Math.cosd(direction)
	};
	console.log(ball.slope);
	ball.position = [50, 50];
	var loop = setInterval(function () {
		if(0 < ball.position[1] && ball.position[1] < 100) {
			ball.position[1] -= ball.slope.rise;
			io.sockets.volatile.emit('yball', ball.position[1]);
		} else if (ball.position[1] <= 0) {
			ball.slope.rise *= -1;
			ball.position[1] = 1;
		} else if (ball.position[1] >= 100) {
			ball.slope.rise *= -1;
			ball.position[1] = 99;
		}

		if(0 < ball.position[0] && ball.position[0] < 100) {
			ball.position[0] += ball.slope.run;
			io.sockets.volatile.emit('xball', ball.position[0]);
		} else if (ball.position[0] <= 0) {
			if (p1.position - 6.5 < ball.position[1] && ball.position[1] < p1.position + 6.5) {
				if (p1.position < ball.position[1]) {
					ball.slope.run *= -1;
					ball.slope.rise += (ball.position[1] - p1.position) / 10;
					ball.position[0] = 1;
				}
				if (p1.position > ball.position[1]) {
					ball.slope.run *= -1;
					ball.slope.rise += (ball.position[1] - p1.position) / 10;
					ball.position[0] = 1;
				}
			} else {
				console.log('Game Over');
				io.sockets.emit('gameOver');
				clearInterval(loop);
				gameloop();
			}
		} else if (ball.position[0] >= 100) {
			if (p2.position - 6.5 < ball.position[1] && ball.position[1] < p2.position + 6.5) {
				if (p2.position < ball.position[1]) {
					ball.slope.run *= -1;
					ball.slope.rise += (ball.position[1] - p2.position) / 10;
					ball.position[0] = 99;
				}
				if (p2.position > ball.position[1]) {
					ball.slope.run *= -1;
					ball.slope.rise += (ball.position[1] - p2.position) / 10;
					ball.position[0] = 99;
				}
			} else {
				console.log('Game Over');
				io.sockets.emit('gameOver');
				clearInterval(loop);
				gameloop();
			}
		}
	}, 4);
}