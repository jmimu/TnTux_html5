
//Level1 class, inherits Level
function Level1()
{
  console.log("Create Level1");
  Level.call(this,"levels/level1.json");// Parent constructor
  window.dataManager.loadfile(startGame,"data/data1.json",this);
  
  
  this.testSpecialActions=function()
  {
	//console.log(this.sprite2i(this.player));  
    if (this.metaTilesSens[this.metaMap[this.sprite2i(this.player)]-this.firstMetaTileIndex]=="s1")
		console.log("s1!!");
    
  }
}
