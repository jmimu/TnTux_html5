//see http://www.html5rocks.com/en/tutorials/canvas/performance/
//inheritence: http://stackoverflow.com/questions/7486825/javascript-inheritance

//from http://www.html5rocks.com/en/tutorials/canvas/notearsgame/
var CANVAS_WIDTH = 480;
var CANVAS_HEIGHT = 320;

var canvasElement = $("<canvas width='" + CANVAS_WIDTH + 
					  "' height='" + CANVAS_HEIGHT + "'></canvas>");
var canvas = canvasElement.get(0).getContext("2d");
var FPS = 20;


//data manager: load everything, says when all is ready
function DataManager()
{
	console.log("DataManager: create");
	this.allbackReady=0;
	this.filename="?";
	this.ready=false;
	this.numAsked=0;
	this.numToLoad=0;
	this.anims={};
	this.sounds={};
	
	//make a closure to read the json file
	this.loadfile = function(callbackReady,filename)
	{
		var obj = this;//closure to access "this"
		obj.callbackReady=callbackReady;
		obj.filename=filename;
		
		obj.numAsked++;//at first, have to read jsonfile
		obj.numToLoad++;
		console.log("DataManager: Read file: "+obj.filename);
		$.getJSON(obj.filename, function(data) {
			console.log("???: "+data["anims"]);
			$.each(data["anims"], function( index, value ) {
					console.log("DataManager: got: "+index);					
					obj.numAsked++;//at first, have to read jsonfile
					obj.numToLoad++;
					obj.anims[index]=new Anim(index,value);
					$("#status").html("Loading "+(obj.numAsked-obj.numToLoad)+"/"+obj.numAsked);
				});
			for (p in obj.anims)
				console.log("Got anim load: "+p);
			obj.numToLoad--;//json file is read
		});
	};

	this.onNewLoaded=function(name)
	{
		console.log("DataManager: loaded "+name);
		this.numToLoad--;
		$("#status").html("Loading "+(this.numAsked-this.numToLoad)+"/"+this.numAsked);
		if (this.numToLoad==0)
		{
			$("#status").html("Ready!");
			this.callbackReady();
		}
	}
}

window.dataManager=new DataManager();

//animation class
function Anim(name,node)
{
	console.log("create anim "+name);
	this.size=node["size"];//size of one frame
	this.len=0;//animaton duration in frames
	this.img=new Image();
		
	this.prepareOnLoad=function(){//closure to know the Anim when img.onLoad
		var obj=this;
		this.img.onload=function()
		{
			console.log("this: "+this);
			console.log("this.transform: "+this.transform);
			this.transform(-1,0,0,1,0,0);
			obj.len=Math.floor(this.width/obj.size[0])//animation length
			if (this.height<obj.size[1]) console.log("Error on size of "+this.src);
			window.dataManager.onNewLoaded(this.src);
		}
	};
	this.prepareOnLoad();
	
	this.img.src=node["src"];
}

//sprite class
function Sprite(x,y,pos,dir)
{
	this.pos="?";//current animation
	this.dir=0;//current direction
	this.frame=0;//where we are in the animation
	this.w=-1;//size of current picture
	this.h=-1;//size of current picture	
	this.x=x;
	this.y=y;
	this.loopedOnce=false;//to know if one loop of animation is finished
	
	this.setPos=function(newpos,dir)
	{
		this.pos=newpos;
		this.dir=dir;
		this.frame=0;		
		if (this.pos in window.dataManager.anims)
		{
			console.log("pos set to  "+newpos);
			this.w=window.dataManager.anims[this.pos].size[0];
			this.h=window.dataManager.anims[this.pos].size[1];
			this.loopedOnce=false;
		}else
			console.log(newpos+" does not exist");
	}
	
	this.setPos(pos,dir);//call it in construtor
	
	this.animate=function(dt)
	{
		if (this.pos in window.dataManager.anims)
		{
			this.frame+=dt;
			if (Math.floor(this.frame)>=window.dataManager.anims[this.pos].len)
			{
				this.frame=0;
				this.loopedOnce=true;
			}
		}
	}
	
	this.draw=function()
	{
		if (this.pos in window.dataManager.anims)
		{
			canvas.drawImage(window.dataManager.anims[this.pos].img, Math.floor(this.frame)*this.w,0,
				this.w,this.h,this.x-this.w/2,this.y-this.h/2,this.w,this.h);
		}else
			console.log(this.pos+" not ready to draw");
	}
}


//ball class, inherits Sprite
function Ball()
{
    Sprite.call(this,200,100,"ball_roll",1);// Parent constructor
	this.vx=2;
	this.vy=2;
	
	this.update=function(player)
	{
		if ((this.x<0)||(this.x>=CANVAS_WIDTH))
			this.vx*=-1;
		if ((this.y<0)||(this.y>=CANVAS_HEIGHT))
			this.vy*=-1;
		this.x+=this.vx;
		this.y+=this.vy;
		
		if ((Math.abs(this.x-player.x)<=(this.w/2+player.w/2))&&
			(Math.abs(this.y-player.y)<=(this.h/2+player.h/2)))
		{
			this.setPos("ball_explode",0);
			this.vx*=-1;
		}
		if ((this.pos=="ball_explode")&&(this.loopedOnce))
		{
			this.setPos("ball_roll",0);
		}
		this.animate(0.2);
	}
}
//Ball.prototype = Object.create(Sprite.prototype);// Inheritance

//player class, inherits Sprite
function Player()
{
	Sprite.call(this,100,60,"tux_walk_side",1);// Parent constructor

	this.update=function()
	{
		if (window.keydown["up"]) {this.y-=2;this.animate(0.3);}
		if (window.keydown["down"]) {this.y+=2;this.animate(0.3);}
		if (window.keydown["left"]) {this.x-=2;this.animate(0.3);}
		if (window.keydown["right"]) {this.x+=2;this.animate(0.3);}
	}
}

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

$(document).ready(function() //or $(function()
	{
		window.dataManager.loadfile(startGame,"data/ball.json");
	}
);

startGame=function()
{
	console.log("Start game");
	canvasElement.appendTo('body');
	
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
	
	//load picture
	var ball_pic = new Image();
	ball_pic.src = 'data/ball_roll1.png';
	
	(update=function(){
		canvas.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
		player.update();
		ball.update(player);
		ball.draw();
		player.draw();
		//window.requestAnimFrame(update);
	})();
	
	
	setInterval(update,1000/FPS); //old version, prefer requestAnimFrame
}
