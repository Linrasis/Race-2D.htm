'use strict';

function distance(x0, y0, x1, y1){
    return Math.sqrt(Math.pow(x0 - x1, 2) + Math.pow(y0 - y1, 2));
}

function draw_logic(){
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

    // Draw lap counter.
    buffer.fillStyle = '#fff';
    buffer.fillText(
      racers[0]['lap'],
      0,
      25
    );
}

function logic(){
    for(var racer in racers){
        if(distance(
          racers[racer]['x'],
          racers[racer]['y'],
          checkpoints[racers[racer]['target']]['x'],
          checkpoints[racers[racer]['target']]['y']
        ) < 50){
            if(checkpoints[racers[racer]['target']]['lap']){
                racers[racer]['lap'] += 1;
            }
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

function resize_logic(){
    buffer.font = font;
}

function setmode_logic(newgame){
    checkpoints = {};
    racers = {};

    // Main menu mode.
    if(mode === 0){
        document.body.innerHTML = '<div><div><a onclick="setmode(1, true)">Test Track</a></div></div>'
          + '<div class=right><div><input disabled value=ESC>Main Menu</div><hr>'
          + '<div><input id=audio-volume max=1 min=0 step=0.01 type=range>Audio<br>'
          + '<input id=color type=color>Color<br>'
          + '<input id=ms-per-frame>ms/Frame<br>'
          + '<a onclick=reset()>Reset Settings</a></div></div>';
        update_settings();

    // New game mode.
    }else{
        if(newgame){
            save();
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
            'x': -225,
            'y': 175,
          },
          {
            'next': 5,
            'x': -250,
            'y': -150,
          },
          {
            'lap': true,
            'next': 0,
            'x': 0,
            'y': -150,
          },
        ];
        racers = [
          {
            'angle': 0,
            'color': settings['color'],
            'lap': 0,
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
    }
}

var checkpoints = {};
var degree = Math.PI / 180;
var racers = {};
var walls = [];

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

window.onload = function(){
    init_settings(
      'Race-2D.htm-',
      {
        'audio-volume': 1,
        'color': '#009900',
        'ms-per-frame': 25,
      }
    );
    init_canvas();
};
