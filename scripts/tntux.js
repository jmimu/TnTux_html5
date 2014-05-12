

$(document).ready(function() //or $(function()
	{
		window.dataManager.loadfile(startGame,"data/data1.json");
	}
);

var gameUpdate;//record setInterval to be able to stop it TODO: move it to canvasJM.js?


startGame=function()
{
	console.log("Start game");	
	
	//taken from http://www.html5rocks.com/en/tutorials/canvas/notearsgame/
	window.keydown = {};
	function keyName(event) {
		return jQuery.hotkeys.specialKeys[event.which] ||
			String.fromCharCode(event.which).toLowerCase();
	}

	$(document).bind("keydown", function(event) {
		window.keydown[keyName(event)] = true;
	});

	$(document).bind("keyup", function(event) {
		window.keydown[keyName(event)] = false;
	});
	
	var player=new Player();
	var level=window.dataManager.level;
	var camera=new Camera(level);
	
	//list of sprites
	var allSprites=[player];
	allSprites.push(new Ball());
	allSprites.push(new Box(9,5));
	allSprites.push(new Box(9,6));
	allSprites.push(new Box(9,5));
	allSprites.push(new Box(8,6));
	allSprites.push(new Box(8,7));
	allSprites.push(new Box(11,8));
	allSprites.push(new Box(10,8));
	
	allSprites[4].setTarget(14*32,allSprites[4].y);
	
	(update=function(){
		canvas.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
		
		$.each(allSprites, function( i, v ){v.update(level,allSprites);if (v.isToDelete()) allSprites.splice(i,1);});
		camera.moveTo(player.x,player.y);
		
		level.draw(camera,allSprites);
		//ball.draw(camera);
		//player.draw(camera);
		//level.draw(camera,1);
		//window.requestAnimFrame(update);
	})();
	
	if (!globalError)
	{
		gameUpdate=setInterval(update,1000/FPS); //old version, prefer requestAnimFrame
	}
}
