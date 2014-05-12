
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
//the box acts as a wall when aligned with tiles, else the collisions are computed specifically (does not allow all slidings)
function Box(x,y)//x,y in blocks
{
    Sprite.call(this,"Box",x*window.level.tileSize[0],(y-0.5)*window.level.tileSize[0],"box",1);// Parent constructor
	var targetX=this.x;
	var targetY=this.y;
	this.currentMoveX=0;
	this.currentMoveY=0;
	
	this.lastActionsBeforeDelete=function()
	{
		console.log("Prepare to delete a box");
		if (this.isTileAligned())
			window.level.blockingMap[window.level.xy2i(this.x+this.currentAnim.hitbox[0][0],this.y+this.currentAnim.hitbox[0][1])]=false;
	}
	
	this.setTarget=function(tX,tY)
	{
		targetX=tX;
		targetY=tY;
	}

    this.isTileAligned=function()
	{
		return (((this.x+this.currentAnim.hitbox[0][0])%window.level.tileSize[0]==0)
			&& ((this.y+this.currentAnim.hitbox[0][1])%window.level.tileSize[1]==0))
	}
	
    this.update=function(allSprites)
	{
		//update blockingMap
		if (this.isTileAligned())
			window.level.blockingMap[window.level.xy2i(this.x+this.currentAnim.hitbox[0][0],this.y+this.currentAnim.hitbox[0][1])]=false;
		
		/*//the box can be moved only if stopped
		if ((this.x==this.targetX)&&(this.y==this.targetY))
		{
			(function(obj)//need a closure!
			{
				$.each(allSprites, function( i, v ){if ((v!=obj)&&(obj.testCollideSprite(v))) {console.log("Boom!");obj.targetX+=32;}});
			})(this);
		}*/

		//go to target pos
		if (this.x<targetX) {this.x++;this.currentMoveX=1;}
		if (this.x>targetX) {this.x--;this.currentMoveX=-1;}
		if (this.y<targetY) {this.y++;this.currentMoveY=1;}
		if (this.y>targetY) {this.y--;this.currentMoveY=-1;}
		//$.each(allSprites, function( i, v ){if ((v!=this)&&(this.testCollideSprite(v))) {console.log("Boom!");this.toDelete=true;}});

		//update blockingMap
		if (this.isTileAligned())
			window.level.blockingMap[window.level.xy2i(this.x+this.currentAnim.hitbox[0][0],this.y+this.currentAnim.hitbox[0][1])]=true;
		
	}
}


//player class, inherits Sprite
function Player()
{
	Sprite.call(this,"Player",100,60,"tux_walk",1);// Parent constructor
	this.push_direction=0;//>0 if pushing in a direction

	this.update=function(level,allSprites)
	{
		var vx=0;
		var vy=0;
		if (window.keydown["up"]) {vy=-4;}
		if (window.keydown["down"]) {vy=4;}
		if (window.keydown["left"]) {vx=-4;}
		if (window.keydown["right"]) {vx=4;}

		//first test collisions with the level
		var depl=this.testCollideLevel(level,vx,vy);

		//test the interations with other sprites
		(function(obj)//need a closure for $.each!
		{
			$.each(allSprites, function( i, v ){
				if ((v!=obj)&&(obj.testCollideSprite(v,depl)))
				{
					depl=obj.onContact(v,depl);
				}
			});
		})(this);
		
		//finally validate move with the level
		depl=this.testCollideLevel(level,depl[0],depl[1]);

		this.push_direction=0;
		if ((vx<0)&&(depl[0]==0)&&(vy==0)) this.push_direction=1;
		if ((vx>0)&&(depl[0]==0)&&(vy==0)) this.push_direction=2;
		if ((vy<0)&&(depl[1]==0)&&(vx==0)) this.push_direction=3;
		if ((vy>0)&&(depl[1]==0)&&(vx==0)) this.push_direction=4;

		this.x+=depl[0];
		this.y+=depl[1];
		

		if ((this.push_direction!=0)&&((this.pos!="tux_push")||(this.dir!=this.push_direction)))
			this.setPos("tux_push",this.push_direction);

		if (window.keydown["up"])
		{
			this.animate(0.3);
			if (this.push_direction==0)
			{
				if (this.dir==4) this.setPos("tux_turn",3,this.endOfTurn);
				else if ((this.dir!=3)||(this.pos!="tux_walk")) this.setPos("tux_walk",3);
			}
		}
		else if (window.keydown["down"])
		{
			this.animate(0.3);
			if (this.push_direction==0)
			{
				if (this.dir==3) this.setPos("tux_turn",4,this.endOfTurn);
				else if ((this.dir!=4)||(this.pos!="tux_walk")) this.setPos("tux_walk",4);
			}
		}
		else if (window.keydown["left"])
		{
			this.animate(0.3);
			if (this.push_direction==0)
			{
				if (this.dir==2) this.setPos("tux_turn",1,this.endOfTurn);
				else if ((this.dir!=1)||(this.pos!="tux_walk")) this.setPos("tux_walk",1);
			}
		}
		else if (window.keydown["right"])
		{
			this.animate(0.3);
			if (this.push_direction==0)
			{
				if (this.dir==1) this.setPos("tux_turn",2,this.endOfTurn);
				else if ((this.dir!=2)||(this.pos!="tux_walk")) this.setPos("tux_walk",2);
			}
		}

		
		if (this.pos=="tux_turn")
		{
			this.animate(0.3);
		}
		
		//if there is a push_direction, check if pushing a box
		//TODO
		if (this.push_direction==2)
		{
			console.log("Pushing");
			var pushX=this.x+this.currentAnim.hitbox[1][0]+1;
			var pushY=this.y+(this.currentAnim.hitbox[0][1]+this.currentAnim.hitbox[1][1]+1)/2;
			for (var i=0;i<allSprites.length;i++)
			{
				if (allSprites[i].testCollideCord(pushX,pushY))
				{
					console.log("Pushing "+allSprites[i].x);
					allSprites[i].setTarget(allSprites[i].x+32,allSprites[i].y);
				}
			}
		}
		
	}
	
	//end of animation functions ---------------------
	
	this.endOfTurn=function()
	{
		this.setPos("tux_walk",this.dir);
	}
	
	//when on contact with sprite s, player movement is depl
	this.onContact=function(s,depl)
	{
		//act depending on its class
		//console.log("Contact with a "+s.subClassName);
		var newDepl=depl.slice();//deep copy
		switch (s.subClassName){
			case "Ball":
				//console.log("Do nothing...");
				break;
			case "Box":
				console.log("Move the box "+s.y/32+"  depl"+depl);
				/*if (depl[0]==0)
					depl[0]-=s.currentMoveX;
				if (depl[1]==0)
					depl[1]-=s.currentMoveY;*/
				
				if (!s.isTileAligned()) //if box aligned on tiles, collision is made with blockingMap
				{
				
					newDepl=[1000,1000];
					//console.log("test depl[0]>0"+depl[0]);
					if (depl[0]>0)
					{
						newDepl[0]=(s.x+s.currentAnim.hitbox[0][0])-(this.x+this.currentAnim.hitbox[1][0])-1;
						console.log("x+ "+newDepl);
					}
					//console.log("test depl[0]<0"+depl[0]);
					if (depl[0]<0)
					{
						newDepl[0]=(s.x+s.currentAnim.hitbox[1][0])-(this.x+this.currentAnim.hitbox[0][0])+1;
						console.log("x- "+newDepl);
					}
					//console.log("test depl[1]>0"+depl[1]);
					if (depl[1]>0)
					{
						newDepl[1]=(s.y+s.currentAnim.hitbox[0][1])-(this.y+this.currentAnim.hitbox[1][1])-1;
						console.log("y+ "+newDepl);
					}
					//console.log("test depl[1]<0"+depl[1]);
					if (depl[1]<0)
					{
						newDepl[1]=(s.y+s.currentAnim.hitbox[1][1])-(this.y+this.currentAnim.hitbox[0][1])+1;
						console.log("y- "+newDepl);
					}

					//cant compare if one is zero...
					if (Math.abs(newDepl[0])<=Math.abs(newDepl[1])) newDepl[1]=depl[1];
					else newDepl[0]=depl[0];
					
					if (newDepl[0]==1000) newDepl[0]=s.currentMoveX;
					if (newDepl[1]==1000) newDepl[1]=s.currentMoveY;
					console.log("final newdepl"+newDepl);
					
					/*if (newDepl[0]<0) push_direction=1;
					if (newDepl[0]>0) push_direction=2;
					if (newDepl[1]<0) push_direction=3;
					if (newDepl[1]>0) push_direction=4;*/
				}
				break;

			default :
				console.log("Touched an unknown object...")
		}
		return newDepl;
	}
}
