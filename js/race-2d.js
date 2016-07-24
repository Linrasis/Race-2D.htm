'use strict';

function draw_logic(){
    canvas_buffer.save();
    canvas_buffer.translate(
      canvas_x,
      canvas_y
    );

    // Draw background.
    canvas_buffer.fillStyle = '#333';
    canvas_buffer.fillRect(
      -300,
      -200,
      600,
      400
    );

/*
    // Draw checkpoints.
    canvas_buffer.fillStyle = '#fff';
    canvas_buffer.strokeStyle = '#999';
    for(var checkpoint in checkpoints){
        canvas_buffer.fillRect(
          checkpoints[checkpoint]['x'] - 5,
          checkpoints[checkpoint]['y'] - 5,
          10,
          10
        );
        canvas_buffer.beginPath();
          canvas_buffer.moveTo(
            checkpoints[checkpoint]['x'],
            checkpoints[checkpoint]['y']
          );
          canvas_buffer.lineTo(
            checkpoints[checkpoints[checkpoint]['next']]['x'],
            checkpoints[checkpoints[checkpoint]['next']]['y']
          );
        canvas_buffer.closePath();
        canvas_buffer.stroke();
    }
*/

    // Draw walls.
    canvas_buffer.fillStyle = '#555';
    for(var wall in walls){
        canvas_buffer.fillRect(
          walls[wall]['x'],
          walls[wall]['y'],
          walls[wall]['width'],
          walls[wall]['height']
        );
    }

    // Draw racers.
    for(var racer in racers){
        canvas_buffer.fillStyle = racers[racer]['color'];
        canvas_buffer.save();
        canvas_buffer.translate(
          racers[racer]['x'],
          racers[racer]['y']
        );
        canvas_buffer.rotate(racers[racer]['angle']);

        canvas_buffer.fillRect(
          -15,
          -10,
          30,
          20
        );

        canvas_buffer.restore();
/*
        canvas_buffer.strokeStyle = racers[racer]['color'];
        canvas_buffer.beginPath();
          canvas_buffer.moveTo(
            racers[racer]['x'],
            racers[racer]['y']
          );
          canvas_buffer.lineTo(
            checkpoints[racers[racer]['target']]['x'],
            checkpoints[racers[racer]['target']]['y']
          );
        canvas_buffer.closePath();
        canvas_buffer.stroke();
*/
    }

    canvas_buffer.restore();

    // Draw lap counter.
    canvas_buffer.fillStyle = '#fff';
    canvas_buffer.fillText(
      racers[0]['lap'],
      0,
      25
    );
}

function logic(){
    for(var racer in racers){
        if(math_distance(
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
            angle += math_tau;

        }else if(angle > math_tau){
            angle -= math_tau;
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

function setmode_logic(newgame){
    checkpoints = {};
    racers = {};

    // Main menu mode.
    if(canvas_mode === 0){
        document.body.innerHTML = '<div><div><a onclick="canvas_setmode(1, true)">Test Track</a></div></div>'
          + '<div class=right><div><input disabled value=ESC>Main Menu</div><hr>'
          + '<div><input id=audio-volume max=1 min=0 step=0.01 type=range>Audio<br>'
          + '<input id=color type=color>Color<br>'
          + '<input id=ms-per-frame>ms/Frame<br>'
          + '<a onclick=settings_reset()>Reset Settings</a></div></div>';
        settings_update();

    // New game mode.
    }else{
        if(newgame){
            settings_save();
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
            'color': settings_settings['color'],
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

window.onkeydown = function(e){
    if(canvas_mode <= 0){
        return;
    }

    var key = e.keyCode || e.which;

    // ESC: return to main menu.
    if(key === 27){
        canvas_setmode(
          0,
          true
        );
        return;
    }
};

window.onload = function(){
    settings_init(
      'Race-2D.htm-',
      {
        'audio-volume': 1,
        'color': '#009900',
        'ms-per-frame': 25,
      }
    );
    canvas_init();
};
