

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
	
	var ball=new Ball();
	var box=new Box();
	var player=new Player();
	var level=window.dataManager.level;
	var camera=new Camera(level);
	
	//lists of sprites for ordered drawing
	var hzSprites=[];//for sprites with height=0 (flat)
	var vertSprites=[];//sprite with an important drawing order
	
	(update=function(){
		canvas.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
		
		player.update(level);
		ball.update(player,level);
		box.update();
		camera.moveTo(player.x,player.y);
		
		vertSprites=[player,ball,box];
		
		level.draw(camera,hzSprites,vertSprites);
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
