/* jslint browser:true */
/* global console */
/* global convertToPercent */
/* global io */

var player1;
var player2;
var ball;

window.Paddle = function (id, player) {
	this.id = id;
	this.player = player;
    this.element = document.createElement('svg');
    this.element.id = id;
    this.element.className = 'paddle';
	this.element.style.height = '12%';
	this.element.style.width = '0.6%';
	this.element.style.backgroundColor = '#FFF';
	this.element.style.position = 'fixed';
	this.element.style.top = '44%';
	if (player) {
		this.element.style.left = '0';
	} else {
		this.element.style.left = '99.4%';
	}
	document.body.appendChild(this.element);
};
window.Ball = function (id) {
    this.id = id;
    this.element = document.createElement('svg');
    this.element.id = id;
    this.element.className = 'ball';
    this.element.style.height = '16px';
    this.element.style.width = '16px';
    this.element.style.backgroundColor = '#FFF';
    this.element.style.position = 'fixed';
    this.element.style.marginLeft = '-8px';
    this.element.style.marginTop = '-8px';
	this.element.style.left = '50%';
	this.element.style.top = '50%';
    document.body.appendChild(this.element);
};
window.onload = function () {
    var socket = io.connect(window.location.hostname);
	player1 = new window.Paddle('paddle_1', true);
	player2 = new window.Paddle('paddle_2', false);
	ball = new window.Ball('ball');
	
	socket.on('set_player', function (player) {
		if (player === 'p1') {
			socket.emit('player_set', 'p1');
			socket.on('sync', function () {
				document.getElementById(ball.id).style.top = '50%';
				document.getElementById(ball.id).style.left = '50%';
				document.body.addEventListener('mousemove', function (e) {
					var position = convertToPercent(e.clientY || e.pageY);
					socket.emit('position', position);
					document.getElementById(player1.id).style.top = (position - 6) + '%';
				});
			});
			socket.on('received_position', function (pos) {
				document.getElementById(player2.id).style.top = pos + '%';
			});
		} else if (player === 'p2') {
			socket.emit('player_set', 'p2');
			socket.on('sync', function () {
				document.getElementById(ball.id).style.top = '50%';
				document.getElementById(ball.id).style.left = '50%';
				document.body.addEventListener('mousemove', function (e) {
					var position = convertToPercent(e.clientY || e.pageY);
					socket.emit('position', position);
					document.getElementById(player2.id).style.top = (position - 6) + '%';
				});
			});
			socket.on('received_position', function (pos) {
				document.getElementById(player1.id).style.top = pos + '%';
			});
		} else {
			console.error('An Error has occurred');
		}
	});
	socket.on('yball', function (pos) {
		document.getElementById(ball.id).style.top = pos + '%';
	});
    socket.on('xball', function (pos) {
        document.getElementById(ball.id).style.left = pos + '%';
    });
    socket.on('gameOver', function () {
        console.log('Game Over');
        document.getElementById(ball.id).style.top = '50%';
        document.getElementById(ball.id).style.left = '50%';
    });
};