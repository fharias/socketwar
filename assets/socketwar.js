/**
/**
 * Our SocketWar game controller!
 */
var SocketWar = (function(){
	
	var _grid = null, _webSocket, _myPlayer;
	
	var _init = function(){
			
		if(!Modernizr.websockets){
			alert('Your browser does not support Web Sockets! You have not business here!');
			return;
		}
	
		//Let's initialize our WebSocket object. This does not open the connection.
		_webSocket = new WebSocket("ws://localhost:8080");
		
		var playerType = 'd3';
		_myPlayer = new SocketWar.Player(playerType + ' myself');
		_grid = new SocketWar.Grid('#playground', 6, 14);
		_grid.addPlayer(_myPlayer);
		
		SocketWar.KeyboardController.listenKeys(_onKeyEvent);
		
	}
		
	var _onKeyEvent = function(direction){
		if(direction === 'shot'){
			return false;
		}
		var offsetMap = {
			left: {x:-1, y:0},
			right: {x:1, y:0},
			up: {x:0, y:-1},
			down: {x:0, y:1}
		};
		_grid.movePlayer(_myPlayer, offsetMap[direction]);
	}
	
	return {
		init: _init
	}
	
})();


/**
 * Object that represents the game grid.
 * @param string|jquery playground
 * @param int rows
 * @param int cols
 */
SocketWar.Grid = function(playground, rows, cols){this.init(playground,rows,cols);}
SocketWar.Grid.prototype = (function(){

	var _init = function(playground, rows, cols){
		
		this._rows = rows;
		this._cols = cols;
		this._playground = $(playground);
		this._players = {};
		
		//Create the grid of the specified size.
		this._obj = $('<div>').addClass('grid');
		for(var i = 0; i < rows; i++){
			for(var j = 0; j < cols; j++){
				this._obj.append($('<div>').addClass('cell'));
			}
		}
		this._playground.html(this._obj);
		
	};
	
	/**
	 * Adds a new player to the list
	 * @param SocketWar.Player player
	 * @param Array position
	 * @returns Array
	 */
	var _addPlayer = function(player, pos){

		//Generates random position if not found.
		var position = pos || {x:Math.floor(Math.random() * this._cols), y:Math.floor(Math.random() * this._rows)}
		
		//Prevent out of range positions.
		if(position.x >= this._cols || position.y >= this._rows){
			position = {x:0, y: 0}
		}
		
		//Adds player to the list, if there is no position specified, generate a random one
		this._players[player.getId()] = {
			player: player,
			position: position
		}
		
		this._playground.append(player.getDomObject());
		return _positionatePlayer.apply(this, [player, position]);
		
	}
	
	var _removePlayer = function(player){
		if(typeof this._players[player.getId()] === 'undefined'){
			return;
		}
		//Removes dom object
		this._playground.remove(player.getDomObject());
		//Removes player from the list
		delete this._players[player.getId()];
	}
	
	/**
	 * 
	 * @param SocketWar.Player player
	 * @param Object offset
	 * @returns {undefined}
	 */
	var _movePlayer = function(player, offset){
		
		var currentPosition = this._players[player.getId()].position;
		var newPosition = {
			x: currentPosition.x + offset.x,
			y: currentPosition.y + offset.y
		}
		
		//Check boudaries
		if(newPosition.x == this._cols || newPosition.x < 0 || newPosition.y == this._rows || newPosition.y < 0){
			return;
		}
		
		this._players[player.getId()].position = newPosition;
		return _positionatePlayer.apply(this, [player, newPosition]);
		
	}
	
	var _positionatePlayer = function(player, position){
		var domCell = this._obj.children().first();
		var domPlayer = player.getDomObject();
		var cellWidth =  domCell.width() + parseInt(domCell.css('border-left-width')) + parseInt(domCell.css('border-right-width'));
		var cellHeight = domCell.height() + parseInt(domCell.css('border-top-width')) + parseInt(domCell.css('border-bottom-width'))

		domPlayer.css('left', cellWidth * position.x + (cellWidth - domPlayer.width())/2);
		domPlayer.css('top', cellHeight * position.y + (cellHeight - domPlayer.height())/2);
		
		return position;
	}
	
	return {
		init: _init,
		addPlayer: _addPlayer,
		removePlayer: _removePlayer,
		movePlayer: _movePlayer
	};
})();

/**
 * Object that represents each player.
 */
SocketWar.Player = function(cssClass){this.init(cssClass);};
SocketWar.Player.prototype = (function(){

	var _init = function(cssClass){
		this._obj = $('<div>').addClass('player').addClass(cssClass);
		this._id = ++SocketWar.Player.Count;
	}
	
	var _getId = function(){
		return this._id;
	}
	
	var _getDomObject = function(){
		return this._obj;
	}
	
	return {
		init: _init,
		getId: _getId,
		getDomObject: _getDomObject
	}
	
})();

SocketWar.Player.Count = 0;

SocketWar.KeyboardController = (function(){
	//Prevents holding a key to trigger the event very fast.
	var _whichKeyDown = false, 
		_callback = null,
		_keyMap = {
			37: 'left',
			38: 'up',
			39: 'right',
			40: 'down',
			65: 'left',
			83: 'down',
			68: 'right',
			87: 'up',
			74: 'left',
			73: 'up',
			76: 'right',
			75: 'down',
			77: 'shot',
			88: 'shot'
		}
	/**
	 * Let's start the game
	 */
	var _listenKeys = function(callback){
		$(document).keydown(_onKeyDown).keyup(_onKeyUp);
		_callback = callback;
	}

	var _onKeyDown = function(e){
		//Prevents two keys pressed at the same time or one key held down.
		if(_whichKeyDown !== false){
			return;
		}
		_whichKeyDown = e.which;
		if(typeof _keyMap[e.which] !== 'undefined' && _callback){
			_callback(_keyMap[e.which]);
			e.preventDefault();
		}
	}
	
	var _onKeyUp = function(e){
		//Release the key only if it's the same initial pressed key
		if(_whichKeyDown == e.which){
			_whichKeyDown = false;
			e.preventDefault();
		}
	}
	
	return {
		listenKeys: _listenKeys,
	}
})();


//Initializes the game whent the document is ready!
$(SocketWar.init);


/*
			var conn = new WebSocket('ws://localhost:8080');
			conn.onopen = function(e) {
				console.log("Connection established!");
			};

			conn.onmessage = function(e) {
				console.log(e.data);
			};

*/