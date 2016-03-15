'use strict';

function distance(x0, y0, x1, y1){
    return Math.sqrt(Math.pow(x0 - x1, 2) + Math.pow(y0 - y1, 2));
}

function draw(){
    buffer.clearRect(
      0,
      0,
      width,
      height
    );

    buffer.save();
    buffer.translate(
      x,
      y
    );

    // Draw background.
    buffer.fillStyle = '#333';
    buffer.fillRect(
      -300,
      -200,
      600,
      400
    );

/*
    // Draw checkpoints.
    buffer.fillStyle = '#fff';
    buffer.strokeStyle = '#999';
    for(var checkpoint in checkpoints){
        buffer.fillRect(
          checkpoints[checkpoint]['x'] - 5,
          checkpoints[checkpoint]['y'] - 5,
          10,
          10
        );
        buffer.beginPath();
          buffer.moveTo(
            checkpoints[checkpoint]['x'],
            checkpoints[checkpoint]['y']
          );
          buffer.lineTo(
            checkpoints[checkpoints[checkpoint]['next']]['x'],
            checkpoints[checkpoints[checkpoint]['next']]['y']
          );
        buffer.closePath();
        buffer.stroke();
    }
*/

    // Draw walls.
    buffer.fillStyle = '#555';
    for(var wall in walls){
        buffer.fillRect(
          walls[wall]['x'],
          walls[wall]['y'],
          walls[wall]['width'],
          walls[wall]['height']
        );
    }

    // Draw racers.
    for(var racer in racers){
        buffer.fillStyle = racers[racer]['color'];
        buffer.save();
        buffer.translate(
          racers[racer]['x'],
          racers[racer]['y']
        );
        buffer.rotate(racers[racer]['angle']);

        buffer.fillRect(
          -15,
          -10,
          30,
          20
        );

        buffer.restore();
/*
        buffer.strokeStyle = racers[racer]['color'];
        buffer.beginPath();
          buffer.moveTo(
            racers[racer]['x'],
            racers[racer]['y']
          );
          buffer.lineTo(
            checkpoints[racers[racer]['target']]['x'],
            checkpoints[racers[racer]['target']]['y']
          );
        buffer.closePath();
        buffer.stroke();
*/
    }

    buffer.restore();

    canvas.clearRect(
      0,
      0,
      width,
      height
    );
    canvas.drawImage(
      document.getElementById('buffer'),
      0,
      0
    );

    animationFrame = window.requestAnimationFrame(draw);
}

function logic(){
    for(var racer in racers){
        if(distance(
          racers[racer]['x'],
          racers[racer]['y'],
          checkpoints[racers[racer]['target']]['x'],
          checkpoints[racers[racer]['target']]['y']
        ) < 50){
            racers[racer]['target'] = checkpoints[racers[racer]['target']]['next'];
        }

        var angle = Math.atan2(
          checkpoints[racers[racer]['target']]['y'] - racers[racer]['y'],
          checkpoints[racers[racer]['target']]['x'] - racers[racer]['x']
        );
        if(angle < 0){
            angle += Math.PI * 2;

        }else if(angle > Math.PI * 2){
            angle -= Math.PI * 2;
        }

        if(racers[racer]['angle'] > angle){
          racers[racer]['angle'] -= racers[racer]['turn'];

        }else if(racers[racer]['angle'] < angle){
          racers[racer]['angle'] += racers[racer]['turn'];
        }

        racers[racer]['x'] += Math.cos(racers[racer]['angle']) * racers[racer]['speed'];
        racers[racer]['y'] += Math.sin(racers[racer]['angle']) * racers[racer]['speed'];
    }
}

function play_audio(id){
    if(settings['audio-volume'] <= 0){
        return;
    }

    document.getElementById(id).currentTime = 0;
    document.getElementById(id).play();
}

function reset(){
    if(!window.confirm('Reset settings?')){
        return;
    }

    var ids = {
      'audio-volume': 1,
      'color': '#009900',
      'ms-per-frame': 25,
    };
    for(var id in ids){
        document.getElementById(id).value = ids[id];
    }

    save();
}

function resize(){
    if(mode <= 0){
        return;
    }

    height = window.innerHeight;
    document.getElementById('buffer').height = height;
    document.getElementById('canvas').height = height;
    y = height / 2;

    width = window.innerWidth;
    document.getElementById('buffer').width = width;
    document.getElementById('canvas').width = width;
    x = width / 2;
}

// Save settings into window.localStorage if they differ from default.
function save(){
    var ids = {
      'audio-volume': 1,
      'ms-per-frame': 25,
    };
    for(var id in ids){
        settings[id] = parseFloat(document.getElementById(id).value);

        if(settings[id] == ids[id]
          || isNaN(settings[id])){
            window.localStorage.removeItem('Race-2D.htm-' + id);

        }else{
            window.localStorage.setItem(
              'Race-2D.htm-' + id,
              settings[id]
            );
        }
    }

    ids = {
      'color': '#009900',
    };
    for(id in ids){
        settings[id] = document.getElementById(id).value;

        if(settings[id] === ids[id]){
            window.localStorage.removeItem('Race-2D.htm-' + id);

        }else{
            window.localStorage.setItem(
              'Race-2D.htm-' + id,
              settings[id]
            );
        }
    }
}

function setmode(newmode, newgame){
    window.cancelAnimationFrame(animationFrame);
    window.clearInterval(interval);

    checkpoints = {};
    racers = {};

    mode = newmode;

    // New game mode.
    if(mode > 0){
        // If it's a newgame from the main menu, save settings.
        if(newgame){
            save();
        }

        // If it's a newgame from the main menu, setup canvas and buffers.
        if(newgame){
            document.body.innerHTML =
              '<canvas id=canvas></canvas><canvas id=buffer></canvas>';

            var contextAttributes = {
              'alpha': false,
            };
            buffer = document.getElementById('buffer').getContext(
              '2d',
              contextAttributes
            );
            canvas = document.getElementById('canvas').getContext(
              '2d',
              contextAttributes
            );

            resize();
        }

        checkpoints = [
          {
            'next': 1,
            'x': 250,
            'y': -150,
          },
          {
            'next': 2,
            'x': 250,
            'y': 150,
          },
          {
            'next': 3,
            'x': 0,
            'y': -50,
          },
          {
            'next': 4,
            'x': -250,
            'y': 150,
          },
          {
            'next': 0,
            'x': -250,
            'y': -150,
          },
        ];
        racers = [
          {
            'angle': 0,
            'color': settings['color'],
            'speed': 2,
            'target': 0,
            'turn': .04,
            'x': 0,
            'y': -150,
          },
        ];
        walls = [
          {
            'height': 10,
            'width': 390,
            'x': -200,
            'y': -125,
          },
          {
            'height': 200,
            'width': 10,
            'x': -200,
            'y': -125,
          },
          {
            'height': 150,
            'width': 10,
            'x': 0,
            'y': 50,
          },
          {
            'height': 200,
            'width': 10,
            'x': 185,
            'y': -125,
          },
        ];

        animationFrame = window.requestAnimationFrame(draw);
        interval = window.setInterval(
          logic,
          settings['ms-per-frame']
        );

        return;
    }

    // Main menu mode.
    buffer = 0;
    canvas = 0;

    document.body.innerHTML = '<div><div><a onclick="setmode(1, true)">Test Track</a></div></div><div class=right><div><input disabled value=ESC>Main Menu</div><hr><div><input id=audio-volume max=1 min=0 step=0.01 type=range value='
      + settings['audio-volume'] + '>Audio<br><input id=color type=color value='
      + settings['color'] + '>Color<br><input id=ms-per-frame value='
      + settings['ms-per-frame'] + '>ms/Frame<br><a onclick=reset()>Reset Settings</a></div></div>';
}

var animationFrame = 0;
var buffer = 0;
var canvas = 0;
var checkpoints = {};
var degree = Math.PI / 180;
var height = 0;
var interval = 0;
var mode = 0;
var racers = {};
var settings = {
  'audio-volume': window.localStorage.getItem('Race-2D.htm-audio-volume') !== null
    ? parseFloat(window.localStorage.getItem('Race-2D.htm-audio-volume'))
    : 1,
  'color': window.localStorage.getItem('Race-2D.htm-color') || '#009900',
  'ms-per-frame': parseInt(window.localStorage.getItem('Race-2D.htm-ms-per-frame')) || 25,
};
var walls = [];
var width = 0;
var x = 0;
var y = 0;

window.onkeydown = function(e){
    if(mode <= 0){
        return;
    }

    var key = e.keyCode || e.which;

    // ESC: return to main menu.
    if(key === 27){
        setmode(
          0,
          true
        );
        return;
    }
};

window.onload = function(e){
    setmode(
      0,
      true
    );
};

window.onresize = resize;
