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
  this.level=0;//class Level
  this.sounds={};

  //call this function each time a ressource has to be loaded
  this.onNewToLoad=function()
  {
    this.numAsked++;
    this.numToLoad++;
  }

  //call this function when a ressource has been loaded
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
  
  //make a closure to read the json file
  this.loadfile = function(callbackReady,filename,level)
  {
    var obj = this;//closure to access "this"
    obj.callbackReady=callbackReady;
    obj.filename=filename;
    obj.level=level;
    
    
    obj.onNewToLoad();//at first, have to read jsonfile
    console.log("DataManager: Read file: "+obj.filename);
    $.getJSON(obj.filename, function(data) {
      //read anims
      $.each(data["anims"], function( index_anim, value_anim ) {
          console.log("DataManager: found animation "+index_anim);
          console.log("DataManager: animation size "+data["anims"][index_anim]["size"]);
          obj.anims[index_anim]={};
          if (!"size" in data["anims"][index_anim])
          {
            dataError("DataManager: error! no size for animation "+index_anim);
            return;
          }
          $.each(data["anims"][index_anim], function( index_dir, value ) {
            if (index_dir!="size")
            {
              console.log("DataManager: animation hitbox "+value["box"]);
              obj.anims[index_anim][index_dir]=new Anim(index_anim,index_dir,
                value["src"],data["anims"][index_anim]["size"],value["box"]);
              $("#status").html("Loading "+(obj.numAsked-obj.numToLoad)+"/"+obj.numAsked);
            }
          });
        });
      for (p in obj.anims)
        console.log("Got anim load: "+p);

      //read level
      obj.onNewToLoad();//has to read level
      console.log("DataManager try to load level file "+obj.level.jsonfile);
      obj.level.loadfile();
      
        
      obj.onNewLoaded();//json file is read
    });
  };
}


//if asking for data that does not exist
dataError=function(message)
{
  globalError=true;
  message="FATAL ERROR: "+message;
  console.error(message);
  alert(message);
  window.clearTimeout(gameUpdate);
}


window.dataManager=new DataManager();
var globalError=false;

