
//ball class, inherits Sprite
function Ball()
{
  Sprite.call(this,"Ball",192,128,"tux_walk",4);// Parent constructor
  this.vx=0;
  this.vy=0;
  
  this.update=function(level)
  {
    /*if ((this.x<0)||(this.x>=CANVAS_WIDTH-this.w))
      this.vx*=-1;
    if ((this.y<0)||(this.y>=CANVAS_HEIGHT-this.h))
      this.vy*=-1;
    this.x+=this.vx;
    this.y+=this.vy;
    
    if ((level.collide(this.x,this.y)=="wall")||
      (level.collide(this.x+this.w-1,this.y)=="wall")||
      (level.collide(this.x+this.w-1,this.y+this.h-1)=="wall")||
      (level.collide(this.x,this.y+this.h-1)=="wall"))
    {
      this.vx*=-1;this.vy*=-1;
    }
    
    if ((Math.abs(this.x-player.x)<=(this.w/2+player.w/2))&&
      (Math.abs(this.y-player.y)<=(this.h/2+player.h/2)))
    {
      this.setPos("ball_explode",1,this.endOfExplosion);
      this.vx*=-1;
    }*/
    this.animate(0.2);
  }
  
  /*this.endOfExplosion=function()
  {
    this.setPos("ball_roll",1);
  }*/
}
//Ball.prototype = Object.create(Sprite.prototype);// Inheritance


function Fish(x,y)//x,y will be rounded to blocks
{
    Sprite.call(this,"Fish",x,y,"fish",1);// Parent constructor
    this.x=Math.floor(this.x/window.level.tileSize[0])*window.level.tileSize[0]-this.currentAnim.hitbox[0][0];
    this.y=Math.floor(this.y/window.level.tileSize[1])*window.level.tileSize[1]-this.currentAnim.hitbox[0][1];
  this.update=function(level)  {this.animate(0.2);}
}

//box class, inherits Sprite
//the box acts as a wall when aligned with tiles, else the collisions are computed specifically (does not allow all slidings)
function Box(x,y)//x,y will be rounded to blocks
{
    Sprite.call(this,"Box",x,y,"box",1);// Parent constructor
    this.x=Math.floor(this.x/window.level.tileSize[0])*window.level.tileSize[0]-this.currentAnim.hitbox[0][0];
    this.y=Math.floor(this.y/window.level.tileSize[1])*window.level.tileSize[1]-this.currentAnim.hitbox[0][1];
  var targetX=this.x;
  var targetY=this.y;
  this.currentMoveX=0;
  this.currentMoveY=0;
  this.askedToMove=0;//accumulator of presure
  
  this.lastActionsBeforeDelete=function()
  {
    console.log("Prepare to delete a box");
    if (this.isTileAligned())
      window.level.blockingMap[window.level.xy2i(this.x+this.currentAnim.hitbox[0][0],this.y+this.currentAnim.hitbox[0][1])]=false;
  }
  
  this.setTarget=function(tX,tY)
  {
    targetX=tX;
    targetY=tY;
  }

  this.isTileAligned=function()
  {
    return (((this.x+this.currentAnim.hitbox[0][0])%window.level.tileSize[0]==0)
      && ((this.y+this.currentAnim.hitbox[0][1])%window.level.tileSize[1]==0))
  }
  
  this.askToMove=function(dir)
  {
    if (this.isTileAligned())
      this.askedToMove+=2;
    if (this.askedToMove>=10)
    {
      if (dir==1)
      { //check if next tile is empty
        if (!window.level.blockingMap[window.level.xy2i(
          this.x+this.currentAnim.hitbox[0][0]-level.tileSize[0],this.y+this.currentAnim.hitbox[0][1])])
          targetX-=level.tileSize[0];
      }
      if (dir==2)
      { //check if next tile is empty
        if (!window.level.blockingMap[window.level.xy2i(
          this.x+this.currentAnim.hitbox[0][0]+level.tileSize[0],this.y+this.currentAnim.hitbox[0][1])])
          targetX+=level.tileSize[0];
      }
      if (dir==3)
      { //check if next tile is empty
        if (!window.level.blockingMap[window.level.xy2i(
          this.x+this.currentAnim.hitbox[0][0],this.y+this.currentAnim.hitbox[0][1]-level.tileSize[1])])
          targetY-=level.tileSize[1];
      }
      if (dir==4)
      { //check if next tile is empty
        if (!window.level.blockingMap[window.level.xy2i(
          this.x+this.currentAnim.hitbox[0][0],this.y+this.currentAnim.hitbox[0][1]+level.tileSize[1])])
          targetY+=level.tileSize[1];
      }
      this.askedToMove=10;
    }
  }
  
  
    this.update=function(level)
  {
    if (this.askedToMove>0) this.askedToMove-=1;
    //update blockingMap
    if (this.isTileAligned())
      window.level.blockingMap[window.level.xy2i(this.x+this.currentAnim.hitbox[0][0],this.y+this.currentAnim.hitbox[0][1])]=false;
    
    /*//the box can be moved only if stopped
    if ((this.x==this.targetX)&&(this.y==this.targetY))
    {
      (function(obj)//need a closure!
      {
        $.each(allSprites, function( i, v ){if ((v!=obj)&&(obj.testCollideSprite(v))) {console.log("Boom!");obj.targetX+=32;}});
      })(this);
    }*/

    //go to target pos
    /*if (this.x<targetX) {this.x++;this.currentMoveX=1;}
    if (this.x>targetX) {this.x--;this.currentMoveX=-1;}
    if (this.y<targetY) {this.y++;this.currentMoveY=1;}
    if (this.y>targetY) {this.y--;this.currentMoveY=-1;}*/
    if (this.x<targetX) {this.x+=2;this.currentMoveX=2;}
    if (this.x>targetX) {this.x-=2;this.currentMoveX=-2;}
    if (this.y<targetY) {this.y+=2;this.currentMoveY=2;}
    if (this.y>targetY) {this.y-=2;this.currentMoveY=-2;}
    //$.each(allSprites, function( i, v ){if ((v!=this)&&(this.testCollideSprite(v))) {console.log("Boom!");this.toDelete=true;}});

    //update blockingMap
    if (this.isTileAligned())
      window.level.blockingMap[window.level.xy2i(this.x+this.currentAnim.hitbox[0][0],this.y+this.currentAnim.hitbox[0][1])]=true;
    
  }
}

