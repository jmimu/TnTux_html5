//see http://www.html5rocks.com/en/tutorials/canvas/performance/
//inheritence: http://stackoverflow.com/questions/7486825/javascript-inheritance

//from http://www.html5rocks.com/en/tutorials/canvas/notearsgame/
var CANVAS_WIDTH = 480;
var CANVAS_HEIGHT = 320;

var canvasElement = $("<canvas width='" + CANVAS_WIDTH + 
					  "' height='" + CANVAS_HEIGHT + "'></canvas>");
var canvas = canvasElement.get(0).getContext("2d");
var FPS = 25;


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

