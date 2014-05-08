function Level(jsonfile)
{
	this.jsonfile=jsonfile;
	console.log("create level "+jsonfile);
	this.mapSize=[];//[sx,sy]
	this.mainMap=[];//int array
	this.metaMap=[];//int array
	this.tiles=0;//Anim
	this.metaTilesSens=["bloc","hurt","slip","die"];//must be in the same order as meta tiles picture
	this.firstMainTileIndex=0;
	this.firstMetaTileIndex=0;
	this.tileSize=[];//[sx,sy]
	
	//make a closure to read the json file
	this.loadfile = function()
	{
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
						obj.metaMap=value_layer["data"];
				});

			window.dataManager.onNewLoaded(obj.jsonfile);
		});
	};
	
	this.loadfile();
	
	this.draw=function(camera)
	{
		var scrollX=-camera.getX();
		var scrollY=-camera.getY();
		
		if (scrollX>0) scrollX=0;
		if (scrollY>0) scrollY=0;
		var drawW=Math.floor(CANVAS_WIDTH/this.tileSize[0])+1;
		var drawH=Math.floor(CANVAS_HEIGHT/this.tileSize[1])+1;
		var drawX=Math.floor(-scrollX/this.tileSize[0]);
		var drawY=Math.floor(-scrollY/this.tileSize[1]);
		var i=drawX+this.mapSize[0]*drawY;//index of current tile
		
		//scroll value, between 0 and tileSize-1
		scrollX=scrollX%this.tileSize[0];
		scrollY=scrollY%this.tileSize[1];
		
		var canvasX=scrollX;
		var canvasY=scrollY;
		var frameXimg;//where the tile is on tile sheet
		var frameYimg;
		
		for (var y=drawY;y<drawY+drawH;y++)
		{			
			for (var x=drawX;x<drawX+drawW;x++)
			{
				if ((0<=x)&&(x<this.mapSize[0])&&(0<=y)&&(y<this.mapSize[1]))
				{
					frameXimg=((this.mainMap[i]-this.firstMainTileIndex)%this.tiles.nbC)*this.tiles.size[0];
					frameYimg=(Math.floor((this.mainMap[i]-1)/this.tiles.nbC))*this.tiles.size[1];

					canvas.drawImage(this.tiles.img,frameXimg,frameYimg,
						this.tileSize[0],this.tileSize[1],canvasX,canvasY,this.tileSize[0],this.tileSize[1]);
				}
				
				canvasX+=this.tileSize[0];
				i+=1;
			}
			i+=(this.mapSize[0]-drawW);
			canvasX=scrollX;
			canvasY+=this.tileSize[0];
		}
	}
	
	this.collide=function(x,y)
	{
		var index=Math.floor(x/this.tileSize[0])+Math.floor(y/this.tileSize[1])*this.mapSize[0];
		if (this.metaMap[index]<this.firstMetaTileIndex)
			return ""; //no collision
		else
			return this.metaTilesSens[this.metaMap[index]-this.firstMetaTileIndex];
	}
	
	this.collideHz=function(x1,x2,y)
	{
		var x;
		if (x1>x2)
		{
			x=x2;
			x2=x1;
			x1=x;
		}
		x=x1;
		var output=[];
		while (x<=x2)
		{
			output.push(this.collide(x,y));
			x+=this.tileSize[0];
		}
		output.push(this.collide(x2,y));
		return output;
	}
	
	this.collideVert=function(x,y1,y2)
	{
		var y;
		if (y1>y2)
		{
			y=y2;
			y2=y1;
			y1=y;
		}
		y=y1;
		var output=[];
		while (y<=y2)
		{
			output.push(this.collide(x,y));
			y+=this.tileSize[1];
		}
		output.push(this.collide(x,y2));
		return output;
	}
}
