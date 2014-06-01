//see http://www.html5rocks.com/en/tutorials/canvas/performance/
//inheritence: http://stackoverflow.com/questions/7486825/javascript-inheritance

//from http://www.html5rocks.com/en/tutorials/canvas/notearsgame/
var CANVAS_WIDTH = 32*24;
var CANVAS_HEIGHT = 32*16;

var canvasElement = $("<canvas width='" + CANVAS_WIDTH + 
            "' height='" + CANVAS_HEIGHT + "'></canvas>");
var canvas = canvasElement.get(0).getContext("2d");
var FPS = 30;

canvasElement.appendTo('body');

//from http://fr.openclassrooms.com/informatique/cours/dynamisez-vos-sites-web-avec-javascript/animations-2
window.requestAnimFrame = (function(){
    return window.requestAnimationFrame       || // La forme standardisee
           window.webkitRequestAnimationFrame || // Pour Chrome et Safari
           window.mozRequestAnimationFrame    || // Pour Firefox
           window.oRequestAnimationFrame      || // Pour Opera
           window.msRequestAnimationFrame     || // Pour Internet Explorer
           function(callback){                   // Pour les eleves du dernier rang
               window.setTimeout(callback, 1000 / 60);
           };
})();

function Camera()
{
  
  this.init=function(level)
  {
    this.level=level;
    this.xmin=CANVAS_WIDTH/2;
    this.ymin=CANVAS_HEIGHT/2;
    this.xmax=level.mapSize[0]*level.tileSize[0]-CANVAS_WIDTH/2;
    this.ymax=level.mapSize[1]*level.tileSize[1]-CANVAS_HEIGHT/2;
    this.x=this.xmin;
    this.y=this.xmax;
  }
  
  
  this.moveTo=function(x,y)
  {
    this.x=Math.max(this.xmin,Math.min(x,this.xmax));
    this.y=Math.max(this.ymin,Math.min(y,this.ymax));
  }
  
  
  this.getX=function()
  {
    return this.x-this.xmin;
  }

  this.getY=function()
  {
    return this.y-this.ymin;
  }
    
}
