function Level(jsonfile)
{
	this.jsonfile=jsonfile;
	console.log("create level "+jsonfile);
	this.mapSize=[];//[sx,sy]
	this.map=[];//int array
	this.tiles=0;//Anim	
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
					obj.tiles=new Anim("main_tiles",0,"data/"+value_tileset["image"],obj.tileSize);
				});

			//read layers
			$.each(data["layers"], function( index_layer, value_layer ) {
					console.log("Level: found layer "+value_layer["name"]);
					if ((value_layer["type"]=="tilelayer")&&(value_layer["visible"]==true)&&(value_layer["name"]=="main"))
						obj.map=value_layer["data"];
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
		
		for (var y=drawY;y<drawY+drawH;y++)
		{			
			for (var x=drawX;x<drawX+drawW;x++)
			{
				if ((0<=x)&&(x<this.mapSize[0])&&(0<=y)&&(y<this.mapSize[1]))
					canvas.drawImage(this.tiles.img,(this.map[i]-1)*this.tileSize[0],0,
						this.tileSize[0],this.tileSize[1],canvasX,canvasY,this.tileSize[0],this.tileSize[1]);
				
				canvasX+=this.tileSize[0];
				i+=1;
			}
			i+=(this.mapSize[0]-drawW);
			canvasX=scrollX;
			canvasY+=this.tileSize[0];
		}
	}
	
}
