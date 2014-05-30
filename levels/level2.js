
//Level1 class, inherits Level
function Level2()
{
  this.snowStormIndex=3;//index of snowstorm in TopTile
  this.snowStormOffset=0;

  console.log("Create Level2");
  Level.call(this,"levels/level2.json");// Parent constructor
  window.dataManager.loadfile(startGame,"data/data1.json",this);
  
  //returns true if have to change level
  this.testSpecialActions=function()
  { 
    if (this.metaTilesSens[this.metaMap[this.sprite2i(this.player)]-this.firstMetaTileIndex]=="s1")
    {
      this.player.y=(this.mapSize[1]-3)*this.tileSize[1];
    }
    if (this.metaTilesSens[this.metaMap[this.sprite2i(this.player)]-this.firstMetaTileIndex]=="s2")
    {
      this.player.x=2*this.tileSize[0];
    }
    if (this.metaTilesSens[this.metaMap[this.sprite2i(this.player)]-this.firstMetaTileIndex]=="s4")
    {
      this.player.x=(this.mapSize[0]-3)*this.tileSize[0];
    }
    if (this.metaTilesSens[this.metaMap[this.sprite2i(this.player)]-this.firstMetaTileIndex]=="s3")
    {
      this.nextLevel=new Level1();
      console.log("Next: "+this.nextLevel.jsonfile);
      return true
    }
	
    return false;
  }
  
  //override drawing function to add snow storm
  this.draw=function(camera)
  {
    this.drawBase(camera);// Parent draw
    
    var drawW=Math.floor(CANVAS_WIDTH/this.tileSize[0])+1;
    var drawH=Math.floor(CANVAS_HEIGHT/this.tileSize[1])+1+1;//the last "+1" is for first hidden row relief
    var frameXimg;//where the tile is on tile sheet
    var frameYimg;
    var canvasX=this.snowStormOffset;
    var canvasY=this.snowStormOffset;
    
    for (var y=-1;y<drawH;y++)
    {
      for (var x=-1;x<drawW;x++)
      {
          frameXimg=((this.snowStormIndex)%this.topTiles.nbC)*this.tileSize[0];
          frameYimg=(Math.floor((this.snowStormIndex)/this.topTiles.nbC))*this.tileSize[1];
          canvas.drawImage(this.topTiles.img,frameXimg,frameYimg,this.tileSize[0],this.tileSize[1],canvasX+x*this.tileSize[0],canvasY+y*this.tileSize[1],this.tileSize[0],this.tileSize[1]);
      }
    }
    this.snowStormOffset+=1+2*Math.cos(this.snowStormOffset/32.0);
    if (this.snowStormOffset>this.tileSize[0])
    	this.snowStormOffset=0;
  }
}
