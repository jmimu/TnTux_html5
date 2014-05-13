
//player class, inherits Sprite
function Player(x,y)
{
	Sprite.call(this,"Player",x,y,"tux_walk",1);// Parent constructor
	this.x-=this.currentAnim.hitbox[0][0];
    this.y-=this.currentAnim.hitbox[0][1];
	this.push_direction=0;//>0 if pushing in a direction

	this.update=function(level)
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
			$.each(level.allSprites, function( i, v ){
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
		if (this.push_direction==1)
		{
			//console.log("Pushing");
			var pushX=this.x+this.currentAnim.hitbox[0][0]-1;
			var pushY=this.y+(this.currentAnim.hitbox[0][1]+this.currentAnim.hitbox[1][1]+1)/2;
			for (var i=0;i<level.allSprites.length;i++)
				if ((level.allSprites[i].subClassName=="Box")&&(level.allSprites[i].testCollideCord(pushX,pushY)))
					level.allSprites[i].askToMove(this.push_direction);
		}
		if (this.push_direction==2)
		{
			//console.log("Pushing");
			var pushX=this.x+this.currentAnim.hitbox[1][0]+1;
			var pushY=this.y+(this.currentAnim.hitbox[0][1]+this.currentAnim.hitbox[1][1]+1)/2;
			for (var i=0;i<level.allSprites.length;i++)
				if ((level.allSprites[i].subClassName=="Box")&&(level.allSprites[i].testCollideCord(pushX,pushY)))
					level.allSprites[i].askToMove(this.push_direction);
		}
		if (this.push_direction==3)
		{
			//console.log("Pushing");
			var pushX=this.x+(this.currentAnim.hitbox[0][0]+this.currentAnim.hitbox[1][0]+1)/2;
			var pushY=this.y+this.currentAnim.hitbox[0][1]-1;
			for (var i=0;i<level.allSprites.length;i++)
				if ((level.allSprites[i].subClassName=="Box")&&(level.allSprites[i].testCollideCord(pushX,pushY)))
					level.allSprites[i].askToMove(this.push_direction);
		}
		if (this.push_direction==4)
		{
			//console.log("Pushing");
			var pushX=this.x+(this.currentAnim.hitbox[0][0]+this.currentAnim.hitbox[1][0]+1)/2;
			var pushY=this.y+this.currentAnim.hitbox[1][1]+1;
			for (var i=0;i<level.allSprites.length;i++)
				if ((level.allSprites[i].subClassName=="Box")&&(level.allSprites[i].testCollideCord(pushX,pushY)))
					level.allSprites[i].askToMove(this.push_direction);
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
			case "Fish":
				//console.log("Touched a fish!");
				s.setToDelete();
				break;
			case "Box":
				//console.log("Move the box "+s.y/32+"  depl"+depl);
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
						//console.log("x+ "+newDepl);
					}
					//console.log("test depl[0]<0"+depl[0]);
					if (depl[0]<0)
					{
						newDepl[0]=(s.x+s.currentAnim.hitbox[1][0])-(this.x+this.currentAnim.hitbox[0][0])+1;
						//console.log("x- "+newDepl);
					}
					//console.log("test depl[1]>0"+depl[1]);
					if (depl[1]>0)
					{
						newDepl[1]=(s.y+s.currentAnim.hitbox[0][1])-(this.y+this.currentAnim.hitbox[1][1])-1;
						//console.log("y+ "+newDepl);
					}
					//console.log("test depl[1]<0"+depl[1]);
					if (depl[1]<0)
					{
						newDepl[1]=(s.y+s.currentAnim.hitbox[1][1])-(this.y+this.currentAnim.hitbox[0][1])+1;
						//console.log("y- "+newDepl);
					}

					//cant compare if one is zero...
					if (Math.abs(newDepl[0])<=Math.abs(newDepl[1])) newDepl[1]=depl[1];
					else newDepl[0]=depl[0];
					
					if (newDepl[0]==1000) newDepl[0]=s.currentMoveX;
					if (newDepl[1]==1000) newDepl[1]=s.currentMoveY;
					//console.log("final newdepl"+newDepl);
					
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
