//see http://www.html5rocks.com/en/tutorials/canvas/performance/
//inheritence: http://stackoverflow.com/questions/7486825/javascript-inheritance

//from http://www.html5rocks.com/en/tutorials/canvas/notearsgame/
var CANVAS_WIDTH = 480;
var CANVAS_HEIGHT = 320;

var canvasElement = $("<canvas width='" + CANVAS_WIDTH + 
					  "' height='" + CANVAS_HEIGHT + "'></canvas>");
var canvas = canvasElement.get(0).getContext("2d");
var FPS = 25;


//TODO: if anim not found say pos and dir, and break!
//TODO: flipped animations are reversed!

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
			$.each(data["anims"], function( index_anim, value_anim ) {
					console.log("DataManager: found animation "+index_anim);
					console.log("DataManager: animation size"+data["anims"][index_anim]["size"]);
					obj.anims[index_anim]={};
					if (!"size" in data["anims"][index_anim])
					{
						dataError("DataManager: error! no size for animation "+index_anim);
						return;
					}
					$.each(data["anims"][index_anim], function( index_dir, value ) {
						if (index_dir!="size")
						{
							obj.numAsked++;//at first, have to read jsonfile
							obj.numToLoad++;
							obj.anims[index_anim][index_dir]=new Anim(index_anim,index_dir,
								value,data["anims"][index_anim]["size"]);
							$("#status").html("Loading "+(obj.numAsked-obj.numToLoad)+"/"+obj.numAsked);
						}
					});
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
function Anim(name,pos,src,size)
{
	console.log("create anim "+name+" pos "+pos+", src="+src);
	this.size=size;//size of one frame
	this.len=0;//animaton duration in frames
	this.vertical=false;//is the animation in a vertical strip?
	this.img=new Image();
		
	this.prepareOnLoad=function(){//closure to know the Anim when img.onLoad
		var obj=this;
		this.img.onload=function()
		{
			if ((this.height<obj.size[1])||(this.width<obj.size[0]))
			{
				dataError("Error on size of "+this.src);
			}
			obj.len=Math.floor(this.width/obj.size[0])//animation length
			if (obj.len<2)
			{
				obj.vertical=true;
				obj.len=Math.floor(this.height/obj.size[1])//animation length
			}
			window.dataManager.onNewLoaded(this.src);
		}
	};
	this.prepareOnLoad();
	
	this.img.src=src;
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
	this.callback=0;//call this function at the end of the animation
	
	//you can specify a callback when the animation is finished
	this.setPos=function(newpos,dir,callback)
	{
		this.pos=newpos;
		this.dir=dir;
		this.frame=0;
		if(typeof(callback)==='undefined') callback = 0;
		this.callback=callback;
		if (this.pos in window.dataManager.anims)
		{
			console.log("pos set to  "+newpos);
			this.w=window.dataManager.anims[this.pos][this.dir].size[0];
			this.h=window.dataManager.anims[this.pos][this.dir].size[1];
			this.loopedOnce=false;
		}else
			dataError("Animation "+this.pos+" dir "+this.dir+" not found.");
	}
	
	this.setPos(pos,dir);//call it in construtor
	
	this.animate=function(dt)
	{
		if (this.pos in window.dataManager.anims)
		{
			this.frame+=dt;
			if (Math.floor(this.frame)>=window.dataManager.anims[this.pos][this.dir].len)
			{
				this.frame=0;
				this.loopedOnce=true;
				if (this.callback!=0)
					this.callback();					
			}
		}
	}
	
	this.draw=function()
	{
		if ((this.pos in window.dataManager.anims)&&(this.dir in window.dataManager.anims[this.pos]))
		{
			if (window.dataManager.anims[this.pos][this.dir].vertical)
				canvas.drawImage(window.dataManager.anims[this.pos][this.dir].img,0,Math.floor(this.frame)*this.h,
					this.w,this.h,this.x-this.w/2,this.y-this.h/2,this.w,this.h);
			else
				canvas.drawImage(window.dataManager.anims[this.pos][this.dir].img,Math.floor(this.frame)*this.w,0,
					this.w,this.h,this.x-this.w/2,this.y-this.h/2,this.w,this.h);
		}else{
			dataError("Animation "+this.pos+" dir "+this.dir+" not found.");
		}
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
			this.setPos("ball_explode",1,this.endOfExplosion);
			this.vx*=-1;
		}
		this.animate(0.2);
	}
	
	this.endOfExplosion=function()
	{
		this.setPos("ball_roll",1);
	}
}
//Ball.prototype = Object.create(Sprite.prototype);// Inheritance

//player class, inherits Sprite
function Player()
{
	Sprite.call(this,100,60,"tux_walk",1);// Parent constructor

	this.update=function()
	{
		if (window.keydown["up"]) {this.y-=2;}
		if (window.keydown["down"]) {this.y+=2;}
		if (window.keydown["left"]) {this.x-=2;}
		if (window.keydown["right"]) {this.x+=2;}

		if (window.keydown["up"])
		{
			this.animate(0.3);
			if (this.dir==4) this.setPos("tux_turn",3,this.endOfTurn);
			else if (this.dir!=3) this.setPos("tux_walk",3);
		}
		else if (window.keydown["down"])
		{
			this.animate(0.3);
			if (this.dir==3) this.setPos("tux_turn",4,this.endOfTurn);
			else if (this.dir!=4) this.setPos("tux_walk",4);
		}
		else if (window.keydown["left"])
		{
			this.animate(0.3);
			if (this.dir==2) this.setPos("tux_turn",1,this.endOfTurn);
			else if (this.dir!=1) this.setPos("tux_walk",1);
		}
		else if (window.keydown["right"])
		{
			this.animate(0.3);
			if (this.dir==1) this.setPos("tux_turn",2,this.endOfTurn);
			else if (this.dir!=2) this.setPos("tux_walk",2);
		}

		
		if (this.pos=="tux_turn")
		{
			this.animate(0.3);
		}
	}
	
	this.endOfTurn=function()
	{
		this.setPos("tux_walk",this.dir);
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
		window.dataManager.loadfile(startGame,"data/data1.json");
	}
);

var gameUpdate;
var globalError=false;

//if asking for data that does not exist
dataError=function(message)
{
	globalError=true;
	message="FATAL ERROR: "+message;
	console.log(message);
	alert(message);
	window.clearTimeout(gameUpdate);
}

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
	
	(update=function(){
		canvas.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
		player.update();
		ball.update(player);
		ball.draw();
		player.draw();
		//window.requestAnimFrame(update);
	})();
	
	if (!globalError)
	{
		gameUpdate=setInterval(update,1000/FPS); //old version, prefer requestAnimFrame
	}
}
