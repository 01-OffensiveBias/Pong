/* jslint browser: true */
/* global console */
/* global io */
/* global convertToPercent */
/* global convertToPixel */
var socket = io.connect(window.location.hostname);
/**
 * Constructor for the Paddle object
 *
 * @param player boolean false for p1 and true for p2
 */
window.Paddle = function (player) {
    var that = this;
    this.id = undefined;
    this.element = undefined;
	this.active = false;
	this.player = player;
    
	/**
	 * Creates a paddle svg and returns the DOM object
	 * Takes the desired id of the paddle as a parameter
	 *
     * @param id str desired id of created element
	 */
	this.create = function (id) {
		var element = document.createElement('svg');
        element.className = "paddle";
        element.id = id;
        that.id = id;
        that.element = element;
        that.edit.paddle(15, '#FFF');
        if (player) {
            element.style.left = '0';
        } else {
            element.style.left = '99.5%';
        }
	};
	
	/**
	 * Provides 3 functions that edit the paddle
	 */
	this.edit = {
		/**
		 * Changes the styles of the paddle
		 * 
		 * @param height int height of the paddle in percent
		 * @param color  str valid css color value
		 * @return undefined
		 */
		'paddle': function(height, color) {
            that.element.style.position = 'fixed';
			that.element.style.margin = '-' + (height / 4) + '% 0 0 0';
			that.element.style.width = '0.5%';
			that.element.style.height = height + '%';
			that.element.style.backgroundColor = color;
		},
		/**
		 * Changes the x and y position of the paddle
		 * 
		 * @param xpos int x position of paddle
		 * @param ypos int y position of paddle
		 * @return undefined
		 */
		'position': function(ypos) {
            var height = document.getElementById(that.id).style.height;
            var top = document.getElementById(that.id).style.top;
			if (0 + (height / 2) < ypos &&
            ypos < 100 - (height / 2)) {
				top = ypos + '%';
			} else if (0 + (height / 2) >= ypos) {
				top = '0%';
            } else if (100 - (height / 2) <= ypos) {
                top = '100%';
			} else {
				console.error('Invalid Position');
			}
		}
	};
	
	/**
	 * Initializes the paddle by rendering the paddle and
	 * adding the main position loop
	 */
	this.init = function () {

		document.body.appendChild(that.element);
		if (document.getElementById(that.id) !== null) {
            socket.on('sync', function() {
                document.addEventListener('mousemove', function(e) {
                    // Figure out position validation later
                    // that.edit.position(convertToPercent(e.clientY) || convertToPercent(e.pageY));
                    document.getElementById(that.id).style.top = e.clientY || e.pageY;
                    socket.volatile.broadcast.emit('position', e.clientY || e.pageY);
                });
            });
		} else {
			console.error('Could not initialize paddle movement');
		}
	};
};

window.onload = function () {
	var paddle = new window.Paddle(true);
	var paddle2 = new window.Paddle(false);
	paddle.create('pad');
	paddle.edit.paddle(15, '#FFF');
	paddle.init();
    socket.on('position', function(pos) {
    });
};