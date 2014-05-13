window.level=0;//the game level, to be accessed everywhere

function Level(jsonfile)
{
	this.jsonfile=jsonfile;
	console.log("create level "+jsonfile);
	this.mapSize=[];//[sx,sy]
	this.mainMap=[];//int array
	this.metaMap=[];//int array
	this.blockingMap=[];//bool array (feeled with walls and all sprites obstacles)
	this.tiles=0;//Anim
	//s1-s5: special tiles that will be limked to a specific function in LevelN class
	this.metaTilesSens=["wall","hurt","slip","die","begin","end","break","autoL","autoR","autoU","autoD","s1","s2","s3","s4","s5"];//must be in the same order as meta tiles picture
	this.firstMainTileIndex=0;
	this.firstMetaTileIndex=0;
	this.tileSize=[];//[sx,sy]
	this.allSprites=[];
	this.player=0;
	
	this.addSprite=function(s)
	{
		this.allSprites.push(s);
		return s;
	}
	
	window.level=this;
	
	this.cl2i = function(c,l)//column, line to index in maps
	{
		return c+l*this.mapSize[0];
	}
	
	this.xy2i = function(x,y)//x,y to index in maps
	{
		//console.log("Check tile "+Math.floor(x/this.tileSize[0])+" "+Math.floor(y/this.tileSize[1]));
		return Math.floor(x/this.tileSize[0])+Math.floor(y/this.tileSize[1])*this.mapSize[0];
	}
	
	//make a closure to read the json file
	this.loadfile = function()
	{
		this.allSprites=[];
		this.player=0;
		
		console.log("Load level file "+this.jsonfile);
		var obj = this;//closure to access "this"
		$.getJSON(obj.jsonfile, function(data) {
			console.log("Getting json data from "+this.jsonfile);
			if (!"layers" in data){dataError("DataManager: error! No layers specified in "+obj.jsonfile);return;}
			if (!"tilesets" in data){dataError("DataManager: error! No tilesets specified in "+obj.jsonfile);return;}
			
			obj.mapSize=[data["width"],data["height"]];
			console.log("Level: mapSize="+obj.mapSize);
			obj.tileSize=[data["tilewidth"],data["tileheight"]];
			console.log("Level: tileSize="+obj.tileSize);
			
			//read tilesets
			$.each(data["tilesets"], function( index_tileset, value_tileset ) {
					console.log("Level: found tileset "+value_tileset["name"]);
					if (value_tileset["name"]=="main")
					{
						obj.tiles=new Anim("main_tiles",0,"data/"+value_tileset["image"],obj.tileSize);
						obj.firstMainTileIndex=value_tileset["firstgid"];
					}
					if (value_tileset["name"]=="meta")
					{
						obj.firstMetaTileIndex=value_tileset["firstgid"];
					}					
				});

			//read layers
			$.each(data["layers"], function( index_layer, value_layer ) {
					console.log("Level: found layer "+value_layer["name"]);
					if ((value_layer["type"]=="tilelayer")&&(value_layer["name"]=="main"))
						obj.mainMap=value_layer["data"];
					if ((value_layer["type"]=="tilelayer")&&(value_layer["name"]=="meta"))
					{
						obj.metaMap=value_layer["data"];
						
						//initialization of blockingMap and player
						//obj.blockingMap=obj.metaMap.slice();//deep copy
						obj.blockingMap=[];
						console.log("Level: create blockingMap according to "+obj.firstMetaTileIndex);
						for (var i=0;i<obj.metaMap.length;i++)
						{
							if (obj.metaMap[i]==obj.firstMetaTileIndex)
								obj.blockingMap.push(true);
							else
								obj.blockingMap.push(false);
							if (obj.metaTilesSens[obj.metaMap[i]-obj.firstMetaTileIndex]=="begin")
							{
								obj.player=new Player((i%obj.mapSize[0])*obj.tileSize[0],(i/obj.mapSize[0])*obj.tileSize[1]);
								obj.allSprites.push(obj.player);
							}
						}
					}
					if ((value_layer["type"]=="objectgroup")&&(value_layer["name"]=="objects"))
					{
						for (var i=0;i<value_layer["objects"].length;i++)
						{
							if (value_layer["objects"][i]["type"]=="box")
								obj.allSprites.push(new Box(value_layer["objects"][i]["x"],value_layer["objects"][i]["y"]));
							if (value_layer["objects"][i]["type"]=="fish")
								obj.allSprites.push(new Fish(value_layer["objects"][i]["x"],value_layer["objects"][i]["y"]));
							//console.log("New object: "+value_layer["objects"][i]["type"]+" "
							//	+value_layer["objects"][i]["x"]+" "+value_layer["objects"][i]["y"]);
						}
					}
				});
			if (obj.player==0) {dataError("DataManager: error! No 'begin' tile in "+obj.jsonfile);return;}
			window.dataManager.onNewLoaded(obj.jsonfile);
		});
	};
	
	this.loadfile();
	
	//draw in several layers to have correct supperpositions
	//uses a list of hz sprites (right on the floor, no precise order)
	//and vertical sprites that have to be drawn in correct order
	this.draw=function(camera)
	{
		var hzSprites=[];
		var vertSprites=[];
		
		$.each(this.allSprites, function( i, v )
		{
			if (v.isHz)
				hzSprites.push(v);
			else
				vertSprites.push(v);
		});
		//order vert sprite from top to bottom
		vertSprites.sort(spriteSortFunction);

		
		var scrollX=-camera.getX();
		var scrollY=-camera.getY();
		
		if (scrollX>0) scrollX=0;
		if (scrollY>0) scrollY=0;
		var drawW=Math.floor(CANVAS_WIDTH/this.tileSize[0])+1;
		var drawH=Math.floor(CANVAS_HEIGHT/this.tileSize[1])+1+1;//the last "+1" is for first hidden row relief
		var drawX=Math.floor(-scrollX/this.tileSize[0]);
		var drawY=Math.floor(-scrollY/this.tileSize[1]);
		var i;//index of current tile
		
		//scroll value, between 0 and tileSize-1
		scrollX=scrollX%this.tileSize[0];
		scrollY=scrollY%this.tileSize[1];
		
		var canvasX;
		var canvasY;
		var frameXimg;//where the tile is on tile sheet
		var frameYimg;
		
		var nextSpriteToDraw=0;//index of the next sprite to draw
		
		for (var height=0;height<2;height++)//0:floor, 1:top
		{
			canvasX=scrollX;
			canvasY=scrollY;
			i=drawX+this.mapSize[0]*drawY;//index of current tile
			for (var y=drawY;y<drawY+drawH;y++)
			{
				if (height==1)//draw vertSprites on second pass
				{
					while ((nextSpriteToDraw<vertSprites.length)
						&& (vertSprites[nextSpriteToDraw].y+vertSprites[nextSpriteToDraw].h-camera.getY()<=canvasY+this.tileSize[1]))
					{
						vertSprites[nextSpriteToDraw].draw(camera);
						nextSpriteToDraw++;
					}
					
					
				}
						
				for (var x=drawX;x<drawX+drawW;x++)
				{
					if ((this.metaMap[i]==this.firstMetaTileIndex)||(height==0))
					{
						if ((0<=x)&&(x<this.mapSize[0])&&(0<=y)&&(y<this.mapSize[1]))
						{					
							frameXimg=((this.mainMap[i]-this.firstMainTileIndex)%this.tiles.nbC)*this.tiles.size[0];
							frameYimg=(Math.floor((this.mainMap[i]-1)/this.tiles.nbC))*this.tiles.size[1];

							if (height==0)//floor
								canvas.drawImage(this.tiles.img,frameXimg,frameYimg,
									this.tileSize[0],this.tileSize[1],canvasX,canvasY,this.tileSize[0],this.tileSize[1]);
							else//high parts (only if metaMap[i]>0)
								canvas.drawImage(this.tiles.img,frameXimg,frameYimg,
									this.tileSize[0],this.tileSize[1],canvasX,canvasY-this.tileSize[1]/2,this.tileSize[0],this.tileSize[1]);
						}
					}
					
					canvasX+=this.tileSize[0];
					i+=1;
				}
				i+=(this.mapSize[0]-drawW);
				canvasX=scrollX;
				canvasY+=this.tileSize[0];
			}
			
			if (height==0)//draw hz sprites
				$.each(hzSprites, function( i, v ) {v.draw(camera);});
		}
		//draw the remaining sprites..
		while (nextSpriteToDraw<vertSprites.length)			
		{
			//vertSprites[nextSpriteToDraw].draw(camera);
			nextSpriteToDraw++;
		}
	}
	
	//returns a string containing the sens of the tile's meta
	this.touching=function(x,y)
	{
		var index=Math.floor(x/this.tileSize[0])+Math.floor(y/this.tileSize[1])*this.mapSize[0];
		if (this.metaMap[index]<this.firstMetaTileIndex)
			return ""; //no collision
		else
			return this.metaTilesSens[this.metaMap[index]-this.firstMetaTileIndex];
	}

	//if collides with a wall
	this.isBlocking=function(x,y)
	{
		var index=Math.floor(x/this.tileSize[0])+Math.floor(y/this.tileSize[1])*this.mapSize[0];
		return this.blockingMap[index];
	}

	
	this.isBlockingHz=function(x1,x2,y)
	{
		var x;
		if (x1>x2)
		{
			x=x2;
			x2=x1;
			x1=x;
		}
		x=x1;
		var output=false;
		while (x<=x2)
		{
			output|=(this.isBlocking(x,y));
			x+=this.tileSize[0];
		}		
		output|=(this.isBlocking(x2,y));
		return output;
	}
	
	this.isBlockingVert=function(x,y1,y2)
	{
		var y;
		if (y1>y2)
		{
			y=y2;
			y2=y1;
			y1=y;
		}
		y=y1;
		var output=false;
		while (y<=y2)
		{
			output|=(this.isBlocking(x,y));
			y+=this.tileSize[1];
		}
		output|=(this.isBlocking(x,y2));
		return output;
	}
}

