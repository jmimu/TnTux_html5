
//Level1 class, inherits Level
function Level1(startMetaTile)
{
  console.log("Create Level1");
  Level.call(this,"levels/level1.json",startMetaTile);// Parent constructor
  window.dataManager.loadfile(startGame,"data/data1.json",this);
  
  
  //returns true if have to change level
  this.testSpecialActions=function()
  { 
    if (this.metaTilesSens[this.metaMap[this.sprite2i(this.player)]-this.firstMetaTileIndex]=="endB")
    {
      console.log("s1!!");
      this.nextLevel=new Level2("startB");
      console.log("Next: "+this.nextLevel.jsonfile);
      return true
    }
	
    return false;
  }
}
