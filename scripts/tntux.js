

$(document).ready(function() //or $(function()
	{
		window.dataManager.loadfile(startGame,"data/data1.json");
	}
);

var gameUpdate;



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
	var player=new Player();
	var camera=new Camera(window.dataManager.level);
	
	(update=function(){
		canvas.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
		player.update();
		ball.update(player);
		camera.moveTo(ball.x,ball.y);
		window.dataManager.level.draw(camera);
		ball.draw(camera);
		player.draw(camera);
		//window.requestAnimFrame(update);
	})();
	
	if (!globalError)
	{
		gameUpdate=setInterval(update,1000/FPS); //old version, prefer requestAnimFrame
	}
}
