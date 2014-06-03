
//Level3 class, inherits Level
function Level3(startMetaTile)
{
  console.log("Create Level3");
  Level.call(this,"levels/level3.json",startMetaTile);// Parent constructor
  window.dataManager.loadfile(startGame,"data/data1.json",this);
  
  //returns true if have to change level
  this.testSpecialActions=function()
  { 

    return false;
  }
 
  //override drawing function to add snow storm
  this.draw=function(camera)
  {
    this.drawBase(camera);// Parent draw
    
  }
}
