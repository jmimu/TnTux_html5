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

			//read layers
			$.each(data["layers"], function( index_layer, value_layer ) {
					console.log("Level: found layer "+value_layer["name"]);
				});

			window.dataManager.onNewLoaded(obj.jsonfile);
		});
	};
	
	this.loadfile();
	
}
