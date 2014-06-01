var gameUpdate;//record setInterval to be able to stop it TODO: move it to canvasJM.js?
window.level=0;


$(document).ready(function() //or $(function()
  {
    window.level=new Level1("startA");
  }
);


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
  
  var player=window.level.player;
  var camera=new Camera();
  camera.init(window.level);
  
  
  //var lastDate=0;
  
  (update=function(){
	//lastDate=new Date();  
    //console.log("lastDate "+lastDate);

    for (var i=0;i<window.level.allSprites.length;i++)
    {
      window.level.allSprites[i].update(window.level);
      if (window.level.allSprites[i].isToDelete())
      {
        window.level.allSprites.splice(i,1);
        i--;
      }
    }
    camera.moveTo(player.x,player.y);
    
    
    if (window.level.testSpecialActions())
    {
		clearInterval(gameUpdate);
		window.level=window.level.nextLevel;
		console.log("Now level is "+window.level.jsonfile);
		camera.init(window.level);
		player=window.level.player;
	}
    window.level.draw(camera);
    //window.requestAnimFrame(update);
  });
  
  if (!globalError)
  {
    gameUpdate=setInterval(update,1000/FPS); //old version, prefer requestAnimFrame
  }
}
