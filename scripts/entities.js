
//ball class, inherits Sprite
function Ball()
{
    Sprite.call(this,200,100,"tux_walk",4);// Parent constructor
	this.vx=0;
	this.vy=0;
	
	this.update=function(player,level)
	{
		/*if ((this.x<0)||(this.x>=CANVAS_WIDTH-this.w))
			this.vx*=-1;
		if ((this.y<0)||(this.y>=CANVAS_HEIGHT-this.h))
			this.vy*=-1;
		this.x+=this.vx;
		this.y+=this.vy;
		
		if ((level.collide(this.x,this.y)=="bloc")||
			(level.collide(this.x+this.w-1,this.y)=="bloc")||
			(level.collide(this.x+this.w-1,this.y+this.h-1)=="bloc")||
			(level.collide(this.x,this.y+this.h-1)=="bloc"))
		{
			this.vx*=-1;this.vy*=-1;
		}
		
		if ((Math.abs(this.x-player.x)<=(this.w/2+player.w/2))&&
			(Math.abs(this.y-player.y)<=(this.h/2+player.h/2)))
		{
			this.setPos("ball_explode",1,this.endOfExplosion);
			this.vx*=-1;
		}*/
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

	this.update=function(level)
	{
		var vx=0;
		var vy=0;
		if (window.keydown["up"]) {vy=-4;}
		if (window.keydown["down"]) {vy=4;}
		if (window.keydown["left"]) {vx=-4;}
		if (window.keydown["right"]) {vx=4;}

		var depl=this.testCollideLevel(level,vx,vy);
		
		this.x+=depl[0];
		this.y+=depl[1];

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
