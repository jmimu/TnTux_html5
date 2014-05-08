//animation class
function Anim(name,pos,src,size)
{
	console.log("create anim "+name+" pos "+pos+", src="+src);
	this.name=name;
	this.pos=pos;
	
	this.size=size;//size of one frame
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
	
	this.draw=function(camera)
	{
		if ((this.pos in window.dataManager.anims)&&(this.dir in window.dataManager.anims[this.pos]))
		{
			var anim=window.dataManager.anims[this.pos][this.dir];
			var frameXimg=((Math.floor(this.frame))%anim.nbC)*anim.size[0];
			var frameYimg=(Math.floor((Math.floor(this.frame)/anim.nbC)))*anim.size[1];
			
			canvas.drawImage(anim.img,frameXimg,frameYimg,
					anim.size[0],anim.size[1],
					this.x-this.w/2-camera.getX(),this.y-this.h/2-camera.getY(),this.w,this.h);
		}else{
			dataError("Animation "+this.pos+" dir "+this.dir+" not found.");
		}
	}
}

