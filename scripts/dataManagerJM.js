//data manager: load everything, says when all is ready
function DataManager()
{
	console.log("DataManager: create");
	this.allbackReady=0;
	this.filename="?";
	this.ready=false;
	this.numAsked=0;
	this.numToLoad=0;
	this.anims={};
	this.sounds={};
	
	//make a closure to read the json file
	this.loadfile = function(callbackReady,filename)
	{
		var obj = this;//closure to access "this"
		obj.callbackReady=callbackReady;
		obj.filename=filename;
		
		obj.numAsked++;//at first, have to read jsonfile
		obj.numToLoad++;
		console.log("DataManager: Read file: "+obj.filename);
		$.getJSON(obj.filename, function(data) {
			console.log("???: "+data["anims"]);
			$.each(data["anims"], function( index_anim, value_anim ) {
					console.log("DataManager: found animation "+index_anim);
					console.log("DataManager: animation size"+data["anims"][index_anim]["size"]);
					obj.anims[index_anim]={};
					if (!"size" in data["anims"][index_anim])
					{
						dataError("DataManager: error! no size for animation "+index_anim);
						return;
					}
					$.each(data["anims"][index_anim], function( index_dir, value ) {
						if (index_dir!="size")
						{
							obj.numAsked++;//at first, have to read jsonfile
							obj.numToLoad++;
							obj.anims[index_anim][index_dir]=new Anim(index_anim,index_dir,
								value,data["anims"][index_anim]["size"]);
							$("#status").html("Loading "+(obj.numAsked-obj.numToLoad)+"/"+obj.numAsked);
						}
					});
				});
			for (p in obj.anims)
				console.log("Got anim load: "+p);
			obj.numToLoad--;//json file is read
		});
	};

	this.onNewLoaded=function(name)
	{
		console.log("DataManager: loaded "+name);
		this.numToLoad--;
		$("#status").html("Loading "+(this.numAsked-this.numToLoad)+"/"+this.numAsked);
		if (this.numToLoad==0)
		{
			$("#status").html("Ready!");
			this.callbackReady();
		}
	}
}


//if asking for data that does not exist
dataError=function(message)
{
	globalError=true;
	message="FATAL ERROR: "+message;
	console.log(message);
	alert(message);
	window.clearTimeout(gameUpdate);
}


window.dataManager=new DataManager();
var globalError=false;

