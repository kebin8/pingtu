
/*
秒表计时器
*/
var timer1=null;

function clock_reset()
  {
	  var t;
	  t=1;
	  document.getElementById("id_jsq").value = t;
	  t=formatSeconds(t);
	  document.getElementById("clocktime").innerHTML=t;
  } 
  
function clock()
  {
	  var t;
	  t=parseInt(document.getElementById("id_jsq").value)+1;
	  document.getElementById("id_jsq").value = t;
	  t=formatSeconds(t);
	  document.getElementById("clocktime").innerHTML=t;
  } 
 
function formatSeconds(value) {
var ctime = Number(value);
        var ctime1 = 0;
        var ctime2 = 0;
        if(ctime > 60) {
        	ctime1 = Number(ctime/60);
        	ctime = Number(ctime%60);
        	if(ctime1 > 60) {
        		ctime2 = Number(ctime1/60);
        		ctime1 = Number(ctime%60);
        	}
        }
        var result = ""+ctime+"秒";
        if(ctime1 > 0) {
        	result = ""+parseInt(ctime1)+"分"+result;
        }
        if(ctime2 > 0) {
        	result = ""+parseInt(ctime2)+"小时"+result;
        }
		//result="计时："+result;
        return result;
}

/*
 以下为拼图游侠代码
*/
function changeImg(objImg,most)
 {
     //var most = 690;        //设置最大宽度
     if(objImg.width > most)
     {
         var scaling = 1-(objImg.width-most)/objImg.width;    
         //计算缩小比例
         objImg.width = objImg.width*scaling;
        // objImg.height = objImg.height;            //img元素没有设置高度时将自动等比例缩小

         objImg.height = objImg.height*scaling;    //img元素设置高度时需进行等比例缩小
		 objImg.naturalHeight=objImg.height; 
		 objImg.naturalWidth=objImg.width;
     }

 }




var canvas=document.getElementById('puzzle');
var context = document.getElementById('puzzle').getContext('2d');
context.strokeStyle = "#ff8040";
context.fillStyle = "#0000ff";

//context.scale(0.5,0.5);



var x = navigator;
var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
var h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
document.getElementById("p1").innerHTML = "<b>屏幕分辨率:</b>"+screen.width + "X" + screen.height+"<b>内部窗口</b>:" + w + "X" + h+" canvas的大小"+canvas.width;


//当浏览器装载图片完成时，需要处理的事件
var img = new Image();
img.src = 'longyan_pintu.jpg';
img.addEventListener('load', drawTiles_load, false);
//canvas.width = 240;
//canvas.height = 240;
var boardSize = 240;//document.getElementById('puzzle').width;
alert(boardSize);
//var tileCount = document.getElementById('scale').value;
var tileCount = 3;//拼图维数设定
var stepCount = 0;//拼图完成所走的步数

var tileSize = boardSize / tileCount;//每一片拼图的宽度

var clickLoc = new Object;
clickLoc.x = 0;
clickLoc.y = 0;

var emptyLoc = new Object;
emptyLoc.x = 0;
emptyLoc.y = 0;

var solved = false;
//保存图片坐标供随机获取
var boardParts_random = new Object;
var randomAy = new Array(tileCount*tileCount);

var boardParts = new Object;
setBoard();





/*

document.getElementById('scale').onchange = function() {
  tileCount = this.value;
  tileSize = boardSize / tileCount;
  setBoard();
  drawTiles();
};
*/
document.getElementById('id_refresh').onclick = function() {


  stepCount=0;
//  alert(this.id);
  setBoard();
  drawTiles();
  clearInterval(timer1);
  clock_reset();
  timer1=setInterval("clock()",1000);
};

document.getElementById('puzzle').onmousemove = function(e) {
  //var e=windowToCanvas(canvas,event.clientX,event.clientY);
  
  clickLoc.x = Math.floor((e.pageX - this.offsetLeft) / tileSize);
  clickLoc.y = Math.floor((e.pageY - this.offsetTop) / tileSize);
};

document.getElementById('puzzle').onclick = function() {
  if (distance(clickLoc.x, clickLoc.y, emptyLoc.x, emptyLoc.y) == 1) {
    stepCount++;
	document.getElementById("id_bushu").innerHTML = stepCount;
    slideTile(emptyLoc, clickLoc);
    drawTiles();
  }
  if (solved) {
    setTimeout(function() {alert("You solved it!");}, 500);
  }
};

function windowToCanvas(canvas,x,y){
    var bbox = canvas.getBoundingClientRect();
    return {
        x:x - bbox.left - (bbox.width - canvas.width) / 2,
        y:y - bbox.top - (bbox.height - canvas.height) / 2
    };
}	
//xy分别标记拼图分片的坐标
function initBoard(tile_Count) {
  for(var i = 0; i < randomAy.length; ++i)
  {
     randomAy[i]=0;
  }
  
  var tileCountTemp=tile_Count*tile_Count;
  boardParts_random = new Array(tileCountTemp);
  for(var k = 0; k < boardParts_random.length; ++k)
  {
     boardParts_random[k] = new Object;
     boardParts_random[k].x = parseInt(k/tile_Count);
     boardParts_random[k].y = k%tile_Count; 
  }
}

// 返回随机数函数
function random(from, to) {
   return Math.floor(Math.random() * (to - from) + from);
}

//xy分别标记拼图分片的坐标
function getRandomNum(from, to) {
  var index_num=0; 
  var loopNum=1;
  while(true)
  {
	index_num=random(from, to);
	if(randomAy[index_num]===0)
	{
	    randomAy[index_num]=1;
		return index_num;
	}else{
	   if(loopNum==3)
	   {
	        for(var k = 0; k < randomAy.length; ++k)
			{
			   if(randomAy[k]===0)
			   {
					randomAy[k]=1;
					return k;
			   }
			}
	   }
	}
	loopNum++;
  }

}

//xy分别标记拼图分片的坐标
function setBoard() {
  initBoard(tileCount);
  var index_num=0;
  boardParts = new Array(tileCount);
  for (var i = 0; i < tileCount; ++i) {
    boardParts[i] = new Array(tileCount);
    for (var j = 0; j < tileCount; ++j) {
      boardParts[i][j] = new Object;
	  index_num=getRandomNum(0,tileCount*tileCount-1);
      boardParts[i][j].x = boardParts_random[index_num].x;
      boardParts[i][j].y = boardParts_random[index_num].y;
    }
  }
//  emptyLoc.x = boardParts[tileCount - 1][tileCount - 1].x;
//  emptyLoc.y = boardParts[tileCount - 1][tileCount - 1].y;
    emptyLoc.x =  boardParts_random[index_num].x;
	emptyLoc.y =  boardParts_random[index_num].y;
  solved = false;
}

//在canvas中绘制拼图
function drawTiles() {
  context.clearRect ( 0 , 0 , boardSize , boardSize );
  for (var i = 0; i < tileCount; ++i) {
    for (var j = 0; j < tileCount; ++j) {
      var x = boardParts[i][j].x;
      var y = boardParts[i][j].y;
      if(i != emptyLoc.x || j != emptyLoc.y || solved == true) {
        context.drawImage(img, x * tileSize, y * tileSize, tileSize, tileSize,
            i * tileSize, j * tileSize, tileSize, tileSize);
      }
    }
  }
}

//在canvas中初始化拼图
function drawTiles_load() {
  //alert("123");
  changeImg(img,240);
  alert(img.width+","+img.height);
  timer1=setInterval("clock()",1000);
  stepCount=0;
  context.clearRect ( 0 , 0 , boardSize , boardSize );
  for (var i = 0; i < tileCount; ++i) {
    for (var j = 0; j < tileCount; ++j) {
      var x = boardParts[i][j].x;
      var y = boardParts[i][j].y;
      if(i != emptyLoc.x || j != emptyLoc.y || solved == true) {
	          context.drawImage(img, x * tileSize, y * tileSize, tileSize, tileSize,
            i * tileSize, j * tileSize, tileSize, tileSize);
      }
    }
  }
}

function distance(x1, y1, x2, y2) {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

function slideTile(toLoc, fromLoc) {//互换位置
  if (!solved) {
    boardParts[toLoc.x][toLoc.y].x = boardParts[fromLoc.x][fromLoc.y].x;
    boardParts[toLoc.x][toLoc.y].y = boardParts[fromLoc.x][fromLoc.y].y;
    boardParts[fromLoc.x][fromLoc.y].x = tileCount - 1;
    boardParts[fromLoc.x][fromLoc.y].y = tileCount - 1;
    toLoc.x = fromLoc.x;
    toLoc.y = fromLoc.y;
    checkSolved();
  }
}

function checkSolved() {//检查是否完成拼图
  var flag = true;
  for (var i = 0; i < tileCount; ++i) {
    for (var j = 0; j < tileCount; ++j) {
      if (boardParts[i][j].x != i || boardParts[i][j].y != j) {
        flag = false;
      }
    }
  }
  solved = flag;
}


