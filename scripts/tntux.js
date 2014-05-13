

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
	
	var level=window.dataManager.level;
	var player=level.player;
	var camera=new Camera(level);
	
	level.addSprite(new Ball());
	/*level.addSprite(new Box(9,5));
	level.addSprite(new Box(9,6));
	level.addSprite(new Box(9,5));
	level.addSprite(new Box(8,6));
	level.addSprite(new Box(8,7));
	level.addSprite(new Box(11,8));
	level.addSprite(new Box(10,8));*/
	
	//level.allSprites[4].setTarget(14*32,level.allSprites[4].y);
	
	(update=function(){
		canvas.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
		
		for (var i=0;i<level.allSprites.length;i++)
		{
			level.allSprites[i].update(level);
			if (level.allSprites[i].isToDelete())
			{
				level.allSprites.splice(i,1);
				i--;
			}
		}
		camera.moveTo(player.x,player.y);
		
		level.draw(camera);
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
