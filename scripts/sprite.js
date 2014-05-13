//animation class
function Anim(name,pos,src,size,hitbox)
{
	console.log("create anim "+name+" pos "+pos+", src="+src);
	this.name=name;
	this.pos=pos;
	
	this.size=size;//size of one frame
	this.hitbox=hitbox;//array of 2 array : xy of upper left corner and lower right corner
	this.len=0;//animaton duration in frames
	this.nbL=0;//number of lines of frames in img
	this.nbC=0;//number of columns of frames in img
	this.img=new Image();
	
	window.dataManager.onNewToLoad();
		
	this.prepareOnLoad=function(){//closure to know the Anim when img.onLoad
		var obj=this;
		this.img.onload=function()
		{
			console.log("Loaded anim "+obj.name+" pos "+obj.pos+", src="+obj.img.src+" size="+obj.size);
			if ((this.height<obj.size[1])||(this.width<obj.size[0]))
			{
				dataError("Error on size of "+this.src);
			}
			obj.nbL=Math.floor(this.height/obj.size[1]);
			obj.nbC=Math.floor(this.width/obj.size[0]);
			obj.len=obj.nbL*obj.nbC;//we suppose the img is full of frames!
			window.dataManager.onNewLoaded(this.src);
		}
	};
	this.prepareOnLoad();
	
	this.img.src=src;
}


//sort sprite to get drawing order = compare bottom of the sprite
function spriteSortFunction(s1, s2){
	if (s1.y+s1.h>s2.y+s2.h)
		return 1
	else if (s1.y+s1.h<s2.y+s2.h)
		return -1
	else return 0;
}


//sprite class
function Sprite(subClassName,x,y,pos,dir,hz)
{
	this.subClassName=subClassName;
	this.pos="?";//current animation
	this.dir=0;//current direction 1:left, 2:right, 3:up, 4:down
	this.frame=0;//where we are in the animation
	
	//drawing part
	this.w=-1;//size of current picture
	this.h=-1;//size of current picture	
	this.x=x;
	this.y=y;
	this.z=0;//for later...
	this.isHz=hz;//is the sprite flat and horizontal?
	var toDelete=false;//this sprite has to be destroyed on next frame (private)
	
	this.isToDelete=function(){return toDelete;}//getter
	//set lastActionsBeforeDelete for your subclass destructor
	this.lastActionsBeforeDelete=function(){console.log("lastActionsBeforeDelete not set for "+this.subClassName);}
	//setToDelete is a public function that can access to toDelete, and that has some customizable part through lastActionsBeforeDelete
	this.setToDelete=function(){this.lastActionsBeforeDelete();toDelete=true;}
	
	
	//collision part: we suppose the sprite is at zoom=1, hit box is Anim's
	
	this.loopedOnce=false;//to know if one loop of animation is finished
	this.callback=0;//call this function at the end of the animation
	this.currentAnim=0;
	
	//you can specify a callback when the animation is finished
	this.setPos=function(newpos,dir,callback)
	{
		this.pos=newpos;
		this.dir=dir;
		this.frame=0;
		if(typeof(callback)==='undefined') callback = 0;
		this.callback=callback;
		if ((this.pos in window.dataManager.anims)&&(this.dir in window.dataManager.anims[this.pos]))
		{
			//console.log("pos set to  "+newpos);
			this.currentAnim=window.dataManager.anims[this.pos][this.dir];
			this.w=this.currentAnim.size[0];
			this.h=this.currentAnim.size[1];
			this.loopedOnce=false;
		}else
			dataError("Animation "+this.pos+" dir "+this.dir+" not found.");
	}
	
	this.setPos(pos,dir);//call it in construtor
	
	this.animate=function(dt)
	{
		this.frame+=dt;
		if (Math.floor(this.frame)>=this.currentAnim.len)
		{
			this.frame=0;
			this.loopedOnce=true;
			if (this.callback!=0)
				this.callback();					
		}
	}
	
	this.draw=function(camera)
	{
		var frameXimg=((Math.floor(this.frame))%this.currentAnim.nbC)*this.currentAnim.size[0];
		var frameYimg=(Math.floor((Math.floor(this.frame)/this.currentAnim.nbC)))*this.currentAnim.size[1];
		
		canvas.drawImage(this.currentAnim.img,frameXimg,frameYimg,
				this.currentAnim.size[0],this.currentAnim.size[1],
				this.x-camera.getX(),this.y-camera.getY(),this.w,this.h);
	}
	
	//TODO: compute main collision direction?
	this.testCollideSprite=function(s,depl)
	{
		return (((this.x+this.currentAnim.hitbox[1][0]+depl[0] >= s.x+s.currentAnim.hitbox[0][0])
				&&(this.x+this.currentAnim.hitbox[0][0]+depl[0] <= s.x+s.currentAnim.hitbox[1][0]))
			&&((this.y+this.currentAnim.hitbox[1][1]+depl[1] >= s.y+s.currentAnim.hitbox[0][1])
				&&(this.y+this.currentAnim.hitbox[0][1]+depl[1] <= s.y+s.currentAnim.hitbox[1][1])));
	}
	
	this.testCollideCord=function(x,y)
	{
		return (((this.x+this.currentAnim.hitbox[1][0] >= x)
				&&(this.x+this.currentAnim.hitbox[0][0] <= x))
			&&((this.y+this.currentAnim.hitbox[1][1] >= y)
				&&(this.y+this.currentAnim.hitbox[0][1] <= y)));
	}
	
	this.testCollideLevel=function(level,vx,vy)
	{
		if (vx>0)//go right
		{
			var collide=level.isBlockingVert(this.x+this.currentAnim.hitbox[1][0]+vx,this.y+this.currentAnim.hitbox[0][1],this.y+this.currentAnim.hitbox[1][1]);
			//console.log("collide:"+collide);
			if (collide) //round to next tile
			{
				//console.log("right collide "+this.x+" "+vx);
				vx=(Math.floor((this.x+this.currentAnim.hitbox[1][0]+1+vx)/level.tileSize[0]))*level.tileSize[0]-(this.x+this.currentAnim.hitbox[1][0]+1);
				//console.log("vx "+vx);
			}
		}
		if (vx<0)//go left
		{
			var collide=level.isBlockingVert(this.x+this.currentAnim.hitbox[0][0]+vx,this.y+this.currentAnim.hitbox[0][1],this.y+this.currentAnim.hitbox[1][1]);
			//console.log("collide:"+collide);
			if (collide) //round to next tile
			{
				//console.log("left collide "+this.x+" "+vx);
				vx=(Math.floor((this.x+this.currentAnim.hitbox[0][0]+vx)/level.tileSize[0])+1)*level.tileSize[0]-(this.x+this.currentAnim.hitbox[0][0]);
				//console.log("vx "+vx);
			}
		}
		if (vy>0)//go down
		{
			var collide=level.isBlockingHz(this.x+this.currentAnim.hitbox[0][0],this.x+this.currentAnim.hitbox[1][0],this.y+this.currentAnim.hitbox[1][1]+vy);
			//console.log("collide:"+collide);
			if (collide) //round to next tile
			{
				//console.log("down collide "+this.y+" "+vy);
				vy=(Math.floor((this.y+this.currentAnim.hitbox[1][1]+1+vy)/level.tileSize[1]))*level.tileSize[1]-(this.y+this.currentAnim.hitbox[1][1]+1);
				//console.log("vy "+vy);
			}
		}
		if (vy<0)//go up
		{
			var collide=level.isBlockingHz(this.x+this.currentAnim.hitbox[0][0],this.x+this.currentAnim.hitbox[1][0],this.y+this.currentAnim.hitbox[0][1]+vy);
			//console.log("collide:"+collide);
			if (collide) //round to next tile
			{
				//console.log("up collide "+this.y+" "+vy);
				vy=(Math.floor((this.y+this.currentAnim.hitbox[0][1]+vy)/level.tileSize[1])+1)*level.tileSize[1]-(this.y+this.currentAnim.hitbox[0][1]);
				//console.log("vy "+vy);
			}
		}
		
		//then the 4 diagonals?
		if (vx>0)//go right
		{
			var collide=level.isBlockingVert(this.x+this.currentAnim.hitbox[1][0]+vx,this.y+this.currentAnim.hitbox[0][1]+vy,this.y+this.currentAnim.hitbox[1][1]+vy);
			//console.log("collide:"+collide);
			if (collide) //round to next tile
			{
				//console.log("right collide "+this.x+" "+vx);
				vx=(Math.floor((this.x+this.currentAnim.hitbox[1][0]+1+vx)/level.tileSize[0]))*level.tileSize[0]-(this.x+this.currentAnim.hitbox[1][0]+1);
				//console.log("vx "+vx);
			}
		}
		if (vx<0)//go left
		{
			var collide=level.isBlockingVert(this.x+this.currentAnim.hitbox[0][0]+vx,this.y+this.currentAnim.hitbox[0][1]+vy,this.y+this.currentAnim.hitbox[1][1]+vy);
			//console.log("collide:"+collide);
			if (collide) //round to next tile
			{
				//console.log("left collide "+this.x+" "+vx);
				vx=(Math.floor((this.x+this.currentAnim.hitbox[0][0]+vx)/level.tileSize[0])+1)*level.tileSize[0]-(this.x+this.currentAnim.hitbox[0][0]);
				//console.log("vx "+vx);
			}
		}
		if (vy>0)//go down
		{
			var collide=level.isBlockingHz(this.x+this.currentAnim.hitbox[0][0]+vx,this.x+this.currentAnim.hitbox[1][0]+vx,this.y+this.currentAnim.hitbox[1][1]+vy);
			//console.log("collide:"+collide);
			if (collide) //round to next tile
			{
				//console.log("down collide "+this.y+" "+vy);
				vy=(Math.floor((this.y+this.currentAnim.hitbox[1][1]+1+vy)/level.tileSize[1]))*level.tileSize[1]-(this.y+this.currentAnim.hitbox[1][1]+1);
				//console.log("vy "+vy);
			}
		}
		if (vy<0)//go up
		{
			var collide=level.isBlockingHz(this.x+this.currentAnim.hitbox[0][0]+vx,this.x+this.currentAnim.hitbox[1][0]+vx,this.y+this.currentAnim.hitbox[0][1]+vy);
			//console.log("collide:"+collide);
			if (collide) //round to next tile
			{
				//console.log("up collide "+this.y+" "+vy);
				vy=(Math.floor((this.y+this.currentAnim.hitbox[0][1]+vy)/level.tileSize[1])+1)*level.tileSize[1]-(this.y+this.currentAnim.hitbox[0][1]);
				//console.log("vy "+vy);
			}
		}
		
		return [vx,vy];
	}
	
}

