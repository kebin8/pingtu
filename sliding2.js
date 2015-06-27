var App = function(obj) {
    var timer = new Timer();
    var puzzle = new Puzzle({
        timer: timer,
        tileCount: obj.tileCount,
        clock: timer.clock,
        context: obj.context,
        tileSize: obj.tileSize,
        boardSize: obj.boardSize
    });
    return {
        timer: timer,
        puzzle: puzzle
    };
};

var Util = {
    get: function(id) {
        return document.getElementById(id);
    },
    distance: function(x1, y1, x2, y2) {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    },
    random: function(from, to) {
        return Math.floor(Math.random() * (to - from) + from);
    },
    getRandomNum: function(from, to, randomAy) {
        var indexNum = 0; 
        var loopNum = 1;
        while(true) {
            indexNum = Util.random(from, to);
            if(randomAy[indexNum] === 0) {
                randomAy[indexNum] = 1;
                return indexNum;
            } else {
                if(loopNum == 3) {
                    for(var k = 0; k < randomAy.length; ++k) {
                        if(randomAy[k] === 0) {
                            randomAy[k] = 1;
                            return k;
                        }
                    }
                }
            }
            loopNum++;
        }
    }
};

var Timer = function() {
    var jsq = Util.get('id_jsq');
    var clockTime = Util.get('clocktime');
    var timer = null;

    var resetClock = function() {
        clearInterval(timer);
        setTime(true);
        clock();
    };
    var clock = function() {
        timer = setInterval(setTime, 1000);
    };
    var setTime = function(isReset) {
        var time = 0;
        if (isReset)
            time = 1;
        else
            time = parseInt(jsq.value, 10) + 1;
        jsq.value = time;
        var formattedTime = formatSencond(time);
        clockTime.innerHTML = formattedTime;
    };
    var formatSencond = function(value) {
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
    };

    return {
        clock: clock,
        resetClock: resetClock
    }
};

var Puzzle = function(obj) {
    var tileCount = obj.tileCount,
        clock = obj.clock,
        context = obj.context,
        boardSize = obj.boardSize,
        tileSize = obj.tileSize;

    var randomAy = new Array(tileCount * tileCount);
    var boradPartsRandom = new Object,
        boardParts = new Object,
        emptyLoc = new Object,
        clickLoc = new Object

    emptyLoc.x = 0;
    emptyLoc.y = 0;

    clickLoc.x = 0;
    clickLoc.y = 0;

    var solved = false;
    var stepCount = 0;

    var that = this;
    this.img = null;
    this.boardSize = boardSize;

    this.changeImageSize = function(objImg, most) {
        var objWidth = parseInt(objImg.width, 10),
            objHeight = parseInt(objImg.height, 10),
            objNaturalWidth = objImg.naturalWidth,
            objNaturalHeith = objImg.naturalHeight;

        if(objWidth > most) {
            var scaling = 1 - (objWidth - most) / objWidth;    
            //计算缩小比例
            objWidth = objWidth * scaling;
            //img元素没有设置高度时将自动等比例缩小

            objHeight = objHeight * scaling;    //img元素设置高度时需进行等比例缩小
            if(objNaturalWidth != undefined && 
                objNaturalHeith != undefined) {
                objNaturalHeith = objHeight; 
                objNaturalWidth = objWidth;
            }
        }
    };
    this.initBoard = function(tileCount) {
        for(var i = 0; i < randomAy.length; ++i) {
            randomAy[i] = 0;
        }
        var tileCountTemp = tileCount * tileCount;
        boradPartsRandom = new Array(tileCountTemp);
        for(var k = 0; k < boradPartsRandom.length; ++k)
        {
            boradPartsRandom[k] = new Object;
            boradPartsRandom[k].x = parseInt(k / tileCount);
            boradPartsRandom[k].y = k % tileCount; 
        }
    };
    this.setBoard = function() {
        that.initBoard(tileCount);

        var indexNum = 0;
        boardParts = new Array(tileCount);
        for (var i = 0; i < tileCount; ++i) {
            boardParts[i] = new Array(tileCount);
            for (var j = 0; j < tileCount; ++j) {
                boardParts[i][j] = new Object;
                indexNum = Util.getRandomNum(0, tileCount * tileCount - 1, randomAy);
                boardParts[i][j].x = boradPartsRandom[indexNum].x;
                boardParts[i][j].y = boradPartsRandom[indexNum].y;
            }
        }
        emptyLoc.x =  boradPartsRandom[indexNum].x;
        emptyLoc.y =  boradPartsRandom[indexNum].y;
        solved = false;
    };
    this.drawTiles = function() {
        context.clearRect ( 0 , 0 , boardSize , boardSize);
        for (var i = 0; i < tileCount; ++i) {
            for (var j = 0; j < tileCount; ++j) {
                var x = boardParts[i][j].x;
                var y = boardParts[i][j].y;
                if(i != emptyLoc.x || j != emptyLoc.y || solved == true) {
                    context.drawImage(that.img, x * tileSize, y * tileSize, tileSize, tileSize, i * tileSize, j * tileSize, tileSize, tileSize);
                }
            }
        }
    };
    this.drawTilesLoad = function(img) {
        that.changeImageSize(img, 240);
        clock();
        that.img = img;
        
        //stepCount = 0;
        that.drawTiles();
    };
    this.slideTile = function(toLoc, fromLoc) {
        if (!solved) {
            boardParts[toLoc.x][toLoc.y].x = boardParts[fromLoc.x][fromLoc.y].x;
            boardParts[toLoc.x][toLoc.y].y = boardParts[fromLoc.x][fromLoc.y].y;
            boardParts[fromLoc.x][fromLoc.y].x = tileCount - 1;
            boardParts[fromLoc.x][fromLoc.y].y = tileCount - 1;
            toLoc.x = fromLoc.x;
            toLoc.y = fromLoc.y;
            that.checkSolved();
        }
    };
    this.checkSolved = function() {
        var flag = true;
        for (var i = 0; i < tileCount; ++i) {
            for (var j = 0; j < tileCount; ++j) {
                if (boardParts[i][j].x != i || boardParts[i][j].y != j) {
                    flag = false;
                }
            }
        }
        solved = flag;
    };
    this.windowToCanvas = function(canvas, x, y) {
        var bbox = canvas.getBoundingClientRect();
        return {
            x: x - bbox.left - (bbox.width - canvas.width) / 2,
            y: y - bbox.top - (bbox.height - canvas.height) / 2
        };
    };
    this.mousemove = function(e, puzzle) {
        clickLoc.x = Math.floor((e.pageX - puzzle.offsetLeft) / tileSize);
        clickLoc.y = Math.floor((e.pageY - puzzle.offsetTop) / tileSize);
    };
    this.click = function() {
        if (Util.distance(clickLoc.x, clickLoc.y, emptyLoc.x, emptyLoc.y) == 1) {
            stepCount++;
            Util.get("id_bushu").innerHTML = stepCount;
            that.slideTile(emptyLoc, clickLoc);
            that.drawTiles();
        }
        if (solved) {
            setTimeout(
                function() {
                    alert("You solved it!");
                }, 500);
        }
    };
    this.reset = function() {
        stepCount = 0;
        Util.get("id_bushu").innerHTML = stepCount;
        that.setBoard();
        that.drawTiles();
    };
};


window.onload = function() {
    var refreshBtn = Util.get('id_refresh'),
        canvas = Util.get('puzzle'),
        p1 = Util.get("p1");
        
    var context = canvas.getContext('2d');
    
    context.strokeStyle = "#ff8040";
    context.fillStyle = "#0000ff";

    var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    var h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

    var img = new Image();
    img.src = 'longyan_pintu.jpg';

    img.addEventListener('load', function() {
        var width = img.width < w ? img.width : w;

        var boardSize = width,
            tileCount = 3;

        canvas.width = boardSize;
        canvas.height = boardSize;

        var myApp = new App({
            context: context,
            boardSize: boardSize,
            tileCount: tileCount,
            tileSize: boardSize / tileCount
        });

        myApp.puzzle.setBoard();
        myApp.puzzle.drawTilesLoad(this);
        p1.innerHTML = "<b>屏幕分辨率:</b>" + screen.width + "X" + screen.height + "<b>内部窗口</b>:" + w + "X" + h + " canvas的大小" + canvas.width;
        
        refreshBtn.onclick = function() {
            myApp.puzzle.reset();
            myApp.timer.resetClock();
        };

        var puzzle = Util.get('puzzle');
        puzzle.onmousemove = function(e) {
            myApp.puzzle.mousemove(e, puzzle);
        };

        puzzle.onclick = function() {
            myApp.puzzle.click();
        };
    }, false);
};