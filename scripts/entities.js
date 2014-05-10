
//ball class, inherits Sprite
function Ball()
{
    Sprite.call(this,"Ball",200,100,"tux_walk",4);// Parent constructor
	this.vx=0;
	this.vy=0;
	
	this.update=function(level,allSprites)
	{
		/*if ((this.x<0)||(this.x>=CANVAS_WIDTH-this.w))
			this.vx*=-1;
		if ((this.y<0)||(this.y>=CANVAS_HEIGHT-this.h))
			this.vy*=-1;
		this.x+=this.vx;
		this.y+=this.vy;
		
		if ((level.collide(this.x,this.y)=="wall")||
			(level.collide(this.x+this.w-1,this.y)=="wall")||
			(level.collide(this.x+this.w-1,this.y+this.h-1)=="wall")||
			(level.collide(this.x,this.y+this.h-1)=="wall"))
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
	
	/*this.endOfExplosion=function()
	{
		this.setPos("ball_roll",1);
	}*/
}
//Ball.prototype = Object.create(Sprite.prototype);// Inheritance



//box class, inherits Sprite
function Box()
{
    Sprite.call(this,"Box",32*12,32*5.5,"box",1);// Parent constructor
	this.targetX=this.x+32;
	this.targetY=this.y;
    this.update=function(level,allSprites)
	{
		/*//the box can be moved only if stopped
		if ((this.x==this.targetX)&&(this.y==this.targetY))
		{
			(function(obj)//need a closure!
			{
				$.each(allSprites, function( i, v ){if ((v!=obj)&&(obj.testCollideSprite(v))) {console.log("Boom!");obj.targetX+=32;}});
			})(this);
		}*/

		//go to target pos
		if (this.x<this.targetX) this.x++;
		if (this.x>this.targetX) this.x--;
		if (this.y<this.targetY) this.y++;
		if (this.y>this.targetY) this.y--;
		//$.each(allSprites, function( i, v ){if ((v!=this)&&(this.testCollideSprite(v))) {console.log("Boom!");this.toDelete=true;}});
		
	}
}


//player class, inherits Sprite
function Player()
{
	Sprite.call(this,"Player",100,60,"tux_walk",1);// Parent constructor

	this.update=function(level,allSprites)
	{
		var vx=0;
		var vy=0;
		if (window.keydown["up"]) {vy=-4;}
		if (window.keydown["down"]) {vy=4;}
		if (window.keydown["left"]) {vx=-4;}
		if (window.keydown["right"]) {vx=4;}

		var depl=this.testCollideLevel(level,vx,vy);
		var push_direction=0;
		if ((vx<0)&&(depl[0]==0)&&(vy==0)) push_direction=1;
		if ((vx>0)&&(depl[0]==0)&&(vy==0)) push_direction=2;
		if ((vy<0)&&(depl[1]==0)&&(vx==0)) push_direction=3;
		if ((vy>0)&&(depl[1]==0)&&(vx==0)) push_direction=4;
		
		//test the interations with other sprites
		(function(obj)//need a closure for $.each!
		{
			$.each(allSprites, function( i, v ){
				if ((v!=obj)&&(obj.testCollideSprite(v)))
					obj.onContact(v);
			});
		})(this);
		
		
		this.x+=depl[0];
		this.y+=depl[1];

		if ((push_direction!=0)&&((this.pos!="tux_push")||(this.dir!=push_direction)))
			this.setPos("tux_push",push_direction);

		if (window.keydown["up"])
		{
			this.animate(0.3);
			if (push_direction==0)
			{
				if (this.dir==4) this.setPos("tux_turn",3,this.endOfTurn);
				else if (this.dir!=3) this.setPos("tux_walk",3);
			}
		}
		else if (window.keydown["down"])
		{
			this.animate(0.3);
			if (push_direction==0)
			{
				if (this.dir==3) this.setPos("tux_turn",4,this.endOfTurn);
				else if (this.dir!=4) this.setPos("tux_walk",4);
			}
		}
		else if (window.keydown["left"])
		{
			this.animate(0.3);
			if (push_direction==0)
			{
				if (this.dir==2) this.setPos("tux_turn",1,this.endOfTurn);
				else if (this.dir!=1) this.setPos("tux_walk",1);
			}
		}
		else if (window.keydown["right"])
		{
			this.animate(0.3);
			if (push_direction==0)
			{
				if (this.dir==1) this.setPos("tux_turn",2,this.endOfTurn);
				else if (this.dir!=2) this.setPos("tux_walk",2);
			}
		}

		
		if (this.pos=="tux_turn")
		{
			this.animate(0.3);
		}
	}
	
	//end of animation functions ---------------------
	
	this.endOfTurn=function()
	{
		this.setPos("tux_walk",this.dir);
	}
	
	//when on contact with sprite s
	this.onContact=function(s)
	{
		//act depending on its class
		//console.log("Contact with a "+s.subClassName);
		switch (s.subClassName){
			case "Ball":
				console.log("Do nothing...");
				break;
			case "Box":
				console.log("Move the box");
				break;
			default :
				console.log("Touched an unknown object...")
		}
	}
}
