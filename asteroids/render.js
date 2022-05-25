var canvas = document.getElementById("User");
canvas.width  = window.innerWidth-40;
var wid = window.innerWidth;
canvas.height = window.innerHeight-150;
var hei =  window.innerHeight;
var ctxUser = canvas.getContext("2d");

var score = 0;
var lvl = 0;
SCORE_INCREMENT = 200;

TURN_SPEED = 2;
USER_MAX_SPEED = 12;
USER_ACC = 1;
USER_SLOW = .08;
MINI_THRUST_IMG = new Image();
MINI_THRUST_IMG.src = 'assets/game/side_thrust.png';

POWER_SPEED = 20;

POWER_PLUS_IMG = new Image();
POWER_PLUS_IMG.src = 'assets/game/fire_rt_pwr.png';

POWER_TIMES_IMG = new Image();
POWER_TIMES_IMG.src = 'assets/game/fire_rt_pwr_2.png';

POWER_SPREAD_IMG = new Image();
POWER_SPREAD_IMG.src = 'assets/game/spread_pwr.png';

POWER_THRUST_IMG = new Image();
POWER_THRUST_IMG.src = 'assets/game/speed_pwr.png';

POWER_TURN_IMG = new Image();
POWER_TURN_IMG.src = 'assets/game/turn_pwr.png';


POWER_IMGS = [POWER_PLUS_IMG, POWER_TIMES_IMG, POWER_SPREAD_IMG, POWER_THRUST_IMG, POWER_TURN_IMG];

BULLET_IMG = new Image();
BULLET_IMG.src = 'assets/game/bullet.png';
BULLET_SPREAD = 11;
BULLET_SPEED = 8;
BULLET_TIMER = 8;

ROCK_SPEED = 20;

window.addEventListener("keydown", keysPressed, false);
window.addEventListener("keyup", keysReleased, false);
if (document.getElementById("modal")) {
  var endGame = document.getElementById("modal");
  endGame.classList.add("hidden");
}

var timer = 0
var fire = false;
var on = true;
function startAgain() {
  if (on == false) {
    on = true;
    endGame.classList.add("hidden");
    renderInterval = setInterval(render, 1000 / 60);
  }
}
function keysPressed(event) {
  if (event.keyCode == 80) {
    if (on == true) {
      on = false;
      clearInterval(renderInterval); // pause
    } else {
      on = true;
      renderInterval = setInterval(render, 1000 / 60);
    }
  } // left
  if (event.keyCode == 65) { user.ddeg = -TURN_SPEED; } // left
  if (event.keyCode == 68) { user.ddeg = TURN_SPEED; } // right
  if (event.keyCode == 83) { user.dd = -USER_ACC; } // back
  if (event.keyCode == 87) { user.dd = USER_ACC;} // forward
  if (event.keyCode == 32 || fire) { fire = true; }
}
function keysReleased(event) {
  if (event.keyCode == 65) { user.ddeg = 0; } // left
  if (event.keyCode == 68) { user.ddeg = 0; } // right
  if (event.keyCode == 32) { fire = false; timer = 0; }
  if (event.keyCode == 83) { user.dd = USER_SLOW; } // stop back
  if (event.keyCode == 87) { user.dd = -USER_SLOW; } // stop forward
}
function spread(spread) {
  return Math.floor(Math.random() * spread) - spread/2;
}
function rad (num) {
  return num * Math.PI / 180;
}
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
function newBullet( ux, udx, uy, udy, deg) {
  bullets.push({
    deg: deg,
    x : Math.round(ux),
    dx: udx,
    y : Math.round(uy),
    dy: udy,
  })
}
function newUp(user, ind){
  var right = getRandomInt(2);
  var bottom = getRandomInt(2);
  if (right == 1) {right = canvas.width/2}
  else {right = -canvas.width/2}
  if (bottom == 1) {bottom = canvas.height/2}
  else {bottom = -canvas.height/2}
  var theta = getRandomInt(360);
  powerUps[ind] = {
    IMG: POWER_IMGS[ind],
    x : right,
    dx: user.pointX(theta)/POWER_SPEED,
    y : bottom,
    dy: user.pointY(theta)/POWER_SPEED,
  };
}
function newRock(user){
  var right = getRandomInt(2);
  var bottom = getRandomInt(2);
  if (right == 1) {right = canvas.width/2}
  else {right = -canvas.width/2}
  if (bottom == 1) {bottom = canvas.height/2}
  else {bottom = -canvas.height/2}
  var theta = getRandomInt(360);
  rocksIMG = new Image();
  var index = getRandomInt(15)+1;
  rocksIMG.src = 'assets/game/asteroids/'+index+'.png';
  rocks.push({
    rotate: getRandomInt(360),
    IMG: rocksIMG,
    x : right,
    dx: user.pointX(theta)/ROCK_SPEED,
    y : bottom,
    dy: user.pointY(theta)/ROCK_SPEED,
  })
}
function drawAllUps(context, ups) {
  for (i=0; i<ups.length; i++) {
    // This deletes ups out of frame
    if (ups[i] == 0 ){
          ups[i] = 0;
          continue;
        }
        //
    drawUps(context, ups[i]);
  }
}
function drawAllBullets(context, bullets) {
  if (bullets.length != 0) {
    for (i=0; i<bullets.length; i++) {
      // This deletes bullets out of frame
      if ((bullets[i].x > window.innerWidth / 2 || bullets[i].x < -window.innerWidth / 2) ||
          (bullets[i].y > window.innerHeight / 2 || bullets[i].y < -window.innerHeight / 2) ||
          (Number.isNaN(bullets[i].x) )){
            bullets.splice(i,1);
            continue;
          }
          //
      drawBullet(context, bullets[i]);
    }
  }
}
function drawAllRocks(context, rocks, bullets) {
  if (rocks.length != 0) {
    for (i=0; i<rocks.length; i++) {
      var print = true;
      for (k=0; k<bullets.length; k++) {
        if ((bullets[k].x > rocks[i].x-25 && bullets[k].x < rocks[i].x+25 ) &&
            (bullets[k].y > rocks[i].y-25 && bullets[k].y < rocks[i].y+25 )) {
              print = false;
              bullets.splice(k,1);
              score+=SCORE_INCREMENT;
              document.getElementById("score-count").innerHTML = score;
              break;
            }
      }
      if (print) { drawRock(context, rocks[i]); }
      else { rocks.splice(i,1); }
    }
  }
}
function drawBullet(context, bullet) {
  bullet.x += bullet.dx;
  bullet.y += bullet.dy;
  //console.log(bullet.deg);
  context.save();
  context.translate((canvas.width/2)+bullet.x,(canvas.height/2)+bullet.y);
  context.rotate(rad(bullet.deg));
  context.drawImage(BULLET_IMG,-25,-10,50,20);
  context.restore();
}
function drawRock(context, rock) {
  rock.x += rock.dx;
  rock.y += rock.dy;

  if ( Math.abs(rock.x) > (canvas.width/2) + 20 ) { rock.x *= -1; }
  if ( Math.abs(rock.y) > (canvas.height/2) + 20 ) { rock.y *= -1; }


  rock.rotate += .5;
  context.save();
  context.translate((canvas.width/2)+rock.x,(canvas.height/2)+rock.y);
  context.rotate(rad(rock.rotate));
  context.drawImage(rock.IMG,-25,-25,50,50);
  context.restore();
}
function drawUps(context, up) {
  up.x += up.dx;
  up.y += up.dy;

  if ( Math.abs(up.x) > (canvas.width/2) + 20 ) { up.x *= -1; }
  if ( Math.abs(up.y) > (canvas.height/2) + 20 ) { up.y *= -1; }


  context.save();
  context.translate((canvas.width/2)+up.x,(canvas.height/2)+up.y);
  context.drawImage(up.IMG,-25,-25,50,50);
  context.restore();
}
var thrustTimer = 11;
var smallTimer = 11;
function drawAllThrusters(context, user) {
  if (user.ddeg != 0 || user.dd < 0) { smallTimer = 0}
  if (smallTimer <= 5 && (user.ddeg < 0 || user.dd == -USER_ACC)) {   drawThruster(context, user, user.deg+45); }
  if (smallTimer <= 5 && (user.ddeg > 0 || user.dd == -USER_ACC)) {   drawThruster(context, user, user.deg-45); }
  smallTimer++;
}
function drawThruster(context,user, deg) {
  if (deg < 0) { deg += 360; }
  if (deg > 360) { deg -= 360; }
  x = user.x + Math.round(user.pointX(Math.abs((deg)%360))/3);
  y = user.y + Math.round(user.pointY(Math.abs((deg)%360))/3);
  context.save();
  context.translate((canvas.width/2)+x,(canvas.height/2)+y);
  context.rotate(rad(deg));
  context.drawImage(MINI_THRUST_IMG,-10,-5,20,10);
  context.restore();
}
function drawUser(context,user) {
  if (user.deg > 360) { user.deg = 0; }
  else if (user.deg < 0) { user.deg = 360; }
  context.save();
////

if ( Math.abs(user.dd) == 1 || Math.abs(user.d) == USER_MAX_SPEED ) { user.thrust = user.deg; }
if ( user.dd == 1 && user.d > USER_MAX_SPEED) { user.dd = 0; user.d = USER_MAX_SPEED; }
else if ( user.dd == -1 && user.d < -USER_MAX_SPEED) { user.dd = 0; user.d = -USER_MAX_SPEED; }
else if (Math.abs(user.dd) == USER_SLOW && Math.abs(user.d) <= USER_SLOW) { user.dd = 0; user.d = 0; }

if ( Math.abs(user.d + user.dd) <= USER_MAX_SPEED) { user.d += user.dd; }

user.x += user.pointX(user.thrust) / 200 * user.d;
user.y += user.pointY(user.thrust) / 200 * user.d;

if ( Math.abs(user.x) > (canvas.width/2) + 26 ) { user.x *= -1; }
if ( Math.abs(user.y) > (canvas.height/2) + 26 ) { user.y *= -1; }

context.translate((canvas.width/2)+user.x,(canvas.height/2)+user.y);

////
  //console.log(user.delta, user.d, user.dd);
  user.deg += user.ddeg;
  context.rotate(rad(user.deg+90));
  context.drawImage(user.IMG,-25,-25,user.sizeX,user.sizeY);

  if (Math.abs(user.dd) == 1 ) { thrustTimer = 0}
  context.translate(0,28);
  if (thrustTimer <= 5 && user.d > 0) {context.drawImage(user.backThrustIMG,-20,-20,40,27);}
  thrustTimer++;


  context.restore();
}
function refreshScreen(context, canvas, window) {
  if ( canvas.width != window.innerWidth-40) { canvas.width  = window.innerWidth-40; }
  if ( canvas.height != window.innerHeight-150 ) { canvas.height = window.innerHeight-150; }

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "black";
  context.fillRect(0, 0, canvas.width, canvas.height);
}
function clearScreen(context, canvas, window) {
    if ( canvas.width != window.innerWidth-40) {
      canvas.width  = window.innerWidth-40;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "black";
      context.fillRect(0, 0, canvas.width, canvas.height);
     }
    if ( canvas.height != window.innerHeight-150 ) {
      canvas.height = window.innerHeight-150;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "black";
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
}
function trig(len, deg) {
  return len * (Math.sin(rad(deg))/Math.sin(rad(90)));
}
var user = {
  // size of ship
  IMG : new Image(),
  backThrustIMG : new Image(),

  sizeX : 50,
  sizeY : 50,
  side  : function () {
    return Math.sqrt(((this.sizeX/2)**2) + (this.sizeY**2));
  },

  // position of the back left of the ship
  x : 0,
  y : 0,
  thrust: 0,
  d: 0,
  dd: 0,

  // 0 degrees rotation is facing right
  deg : 270,
  ddeg: 0,

  // finds a X and Y in any direction
  pointX : function (deg) {
    if (deg >= 0 && deg < 90) { return trig(this.side(), 90-deg); }
    else if (deg >= 90 && deg < 180) { return -trig(this.side(), 90-(180-deg)); }
    else if (deg >= 180 && deg < 270) { return -trig(this.side(), 270-deg); }
    else if (deg >= 270 && deg <= 360) { return trig(this.side(), deg-270); }
  },

  pointY : function (deg) {
    if (deg >= 0 && deg < 90) { return trig(this.side(), deg); }
    else if (deg >= 90 && deg < 180) { return trig(this.side(), 180-deg); }
    else if (deg >= 180 && deg < 270) { return -trig(this.side(), 90-(270-deg)); }
    else if (deg >= 270 && deg <= 360) { return -trig(this.side(), 90-(deg-270)); }
  },

}
function checkX(canvas, user, deg) {
  if (deg < 0) { deg += 360; }
  if (deg > 360) { deg -= 360; }
  return user.x + Math.round(user.pointX(Math.abs((deg)%360))/2.2);
}
function checkY(canvas, user, deg) {
  if (deg < 0) { deg += 360; }
  if (deg > 360) { deg -= 360; }
  return user.y + Math.round(user.pointY(Math.abs((deg)%360))/2.2);
}
function checkPlayerDeath(canvas, user, rocks, deg) {
  X = checkX(canvas, user, user.deg+deg);
  Y = checkY(canvas, user, user.deg+deg);
  for (i=0; i<rocks.length; i++) {
    if ( ( X > rocks[i].x-20 && X < rocks[i].x+20 ) &&
         ( Y > rocks[i].y-20 && Y < rocks[i].y+20 ) ) {
           return false;
    }
  }
  return true;
}
function checkUps(canvas, user, powerUps, ind, deg) {
  X = checkX(canvas, user, user.deg+deg);
  Y = checkY(canvas, user, user.deg+deg);
  if ( ( X > powerUps[ind].x-20 && X < powerUps[ind].x+20 ) &&
       ( Y > powerUps[ind].y-20 && Y < powerUps[ind].y+20 ) ) {
    powerUps[ind] = 0;
    return false;
  }
  return true;
}
function checkPlayer(canvas, user, rocks) {
  if ( !( checkPlayerDeath(canvas, user, rocks, 0) &&
          checkPlayerDeath(canvas, user, rocks, -135) &&
          checkPlayerDeath(canvas, user, rocks, 135) ) ) {
    return 2;
  }
  else if ( powerUps[0] != 0 &&
    !( checkUps(canvas, user, powerUps, 0, 0) &&
       checkUps(canvas, user, powerUps, 0, -135) &&
       checkUps(canvas, user, powerUps, 0, 135)) ) {
    return 3;
  }
  else if ( powerUps[1] != 0 &&
    !( checkUps(canvas, user, powerUps, 1, 0) &&
       checkUps(canvas, user, powerUps, 1, -135) &&
       checkUps(canvas, user, powerUps, 1, 135)) ) {
  return 4;
  }
  else if ( powerUps[2] != 0 &&
    !( checkUps(canvas, user, powerUps, 2, 0) &&
       checkUps(canvas, user, powerUps, 2, -135) &&
       checkUps(canvas, user, powerUps, 2, 135)) ) {
  return 5;
  }
  else if ( powerUps[3] != 0 &&
    !( checkUps(canvas, user, powerUps, 3, 0) &&
       checkUps(canvas, user, powerUps, 3, -135) &&
       checkUps(canvas, user, powerUps, 3, 135)) ) {
  return 6;
  }
  else if ( powerUps[4] != 0 &&
    !( checkUps(canvas, user, powerUps, 4, 0) &&
       checkUps(canvas, user, powerUps, 4, -135) &&
       checkUps(canvas, user, powerUps, 4, 135)) ) {
  return 7;
  }
  return 1;
}
function reset(user) {
  user.x = 0;
  user.y = 0;
  user.thrust = 0;
  user.d = 0;
  user.dd = 0;
  user.deg = 270;
  user.ddeg = 0;
}

user.IMG.src = 'assets/game/player.png';
user.backThrustIMG.src = 'assets/game/main_thrust.png';
var bullets = [];
var rocks = [];
var powerUps = [0,0,0,0,0];
function render() {
  refreshScreen(ctxUser, canvas, window);
  if (document.getElementById("score-count")) {
    document.getElementById("score-count").innerHTML = score;
  }
  if (rocks.length == 0) {
    lvl+=1;
    if (lvl % getRandomInt(2) == 0) {
      newUp(user, getRandomInt(5));
    }
    if (document.getElementById("lvl-count")) {
      document.getElementById("lvl-count").innerHTML = lvl;
    }
    if (ROCK_SPEED > 1) {
      ROCK_SPEED-=1;
    }
    for (i=-5-getRandomInt(lvl); i<0; i++) {
      newRock(user);
    }
  }
  if ( fire ) {
    if ( timer == BULLET_TIMER ) { timer = 0; }
    if ( timer == 0 ) {
      if (score > 0) {score--;}
      var degree = Math.abs(user.deg+spread(BULLET_SPREAD));
      x = user.x + Math.round(user.pointX(Math.abs((user.deg)%360))/2.2);
      y = user.y + Math.round(user.pointY(Math.abs((user.deg)%360))/2.2);
      newBullet(
        x,
        user.pointX(degree)/BULLET_SPEED,
        y,
        user.pointY(degree)/BULLET_SPEED,
        degree);
    }
    timer++;

  }
  drawUser(ctxUser, user);
  drawAllUps(ctxUser, powerUps);
  drawAllBullets(ctxUser, bullets);
  drawAllThrusters(ctxUser, user);
  drawAllRocks(ctxUser, rocks, bullets);
  switch ( checkPlayer(canvas, user, rocks) ) {
    case 1:
      break;
    case 2:
      on = false;
      bullets = [];
      rocks = [];
      powerUps = [0,0,0,0,0];
      BULLET_SPREAD = 11;
      BULLET_SPEED = 8;
      BULLET_TIMER = 8;
      ROCK_SPEED = 20;
      TURN_SPEED = 2;
      USER_MAX_SPEED = 12;
      lvl = 0;
      score = 0;
      clearInterval(renderInterval); // pause
      reset(user);
      reSize = setInterval(render2, 1000 / 60);
      endGame.classList.remove("hidden");
      break;
    case 3:
      if(BULLET_SPEED>=1) {BULLET_SPEED-=.5;}
      break;
    case 4:
      if(BULLET_TIMER>=1) {BULLET_TIMER--;}
      break;
    case 5:
      BULLET_SPREAD+= 10;
      break;
    case 6:
      USER_MAX_SPEED+=2;
      break;
    case 7:
      TURN_SPEED+=.5;
      break;
  }
}
function render2() {
  clearScreen(ctxUser, canvas, window);
}
renderInterval = setInterval(render, 1000 / 60);


var bodyCheck = 0;
if(document.title =="Asteroids"){

	//event listener on the accept button
	document.getElementById("input-username-button").addEventListener("click", sendScore);

	//do this when accept button is clicked
	function sendScore(){

    if(on == false) {
      console.log('sf');
      //get the inputted name and the score
      var score_name = document.getElementById('name-input').value;
      var score_number = document.getElementById('score-count').textContent;

      //if there is no name inputted, do not proceed and tell the user
      if(!score_name){
        alert("Please input a name.");
      }
      //otherwise, do it
      else{

        //create the message object
        var score_message = new XMLHttpRequest();
        var requestURL = '/game/add';
        score_message.open('POST', requestURL);

        //create a JSON object to send with the request
        var requestBody = JSON.stringify({
          name: score_name,
          highscore: score_number
        });


        score_message.setRequestHeader('Content-Type', 'application/json');
        if (bodyCheck != requestBody)
          {
          //send it
          score_message.send(requestBody);

          bodyCheck = requestBody
          }

        score_number = 0;
      }
    }
	}
}