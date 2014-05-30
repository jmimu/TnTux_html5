var gameUpdate;//record setInterval to be able to stop it TODO: move it to canvasJM.js?
var level;


$(document).ready(function() //or $(function()
  {
    level=new Level1();
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
  
  var player=level.player;
  var camera=new Camera(level);
  
  (update=function(){
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
    
    level.testSpecialActions();
    level.draw(camera);
    
    //window.requestAnimFrame(update);
  })();
  
  if (!globalError)
  {
    gameUpdate=setInterval(update,1000/FPS); //old version, prefer requestAnimFrame
  }
}
