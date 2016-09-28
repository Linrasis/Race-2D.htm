'use strict';

function draw_logic(){
    canvas_buffer.save();
    canvas_buffer.translate(
      canvas_x,
      canvas_y
    );
    canvas_buffer.rotate(-math_degrees_to_radians(race_racers[0]['angle']) - 1.5708);
    canvas_buffer.translate(
      -race_racers[0]['x'],
      -race_racers[0]['y']
    );

    // Draw background.
    canvas_buffer.fillStyle = '#333';
    canvas_buffer.fillRect(
      -300,
      -200,
      600,
      400
    );

    // Draw walls.
    canvas_buffer.fillStyle = '#555';
    for(var wall in race_walls){
        canvas_buffer.fillRect(
          race_walls[wall]['x'],
          race_walls[wall]['y'],
          race_walls[wall]['width'],
          race_walls[wall]['height']
        );
    }

    // Draw racers.
    for(var racer in race_racers){
        if(racer === '0'){
            continue;
        }

        canvas_buffer.fillStyle = race_racers[racer]['color'];
        canvas_buffer.save();
        canvas_buffer.translate(
          race_racers[racer]['x'],
          race_racers[racer]['y']
        );
        canvas_buffer.rotate(race_racers[racer]['angle']);

        canvas_buffer.fillRect(
          -15,
          -10,
          30,
          20
        );

        canvas_buffer.restore();
    }

    canvas_buffer.restore();

    // Draw player.
    canvas_buffer.fillStyle = race_racers[0]['color'];
    canvas_buffer.fillRect(
      canvas_x - 10,
      canvas_y - 15,
      20,
      30
    );

    // Draw lap counter.
    canvas_buffer.fillStyle = '#fff';
    canvas_buffer.fillText(
      race_racers[0]['lap'],
      0,
      25
    );
}

function logic(){
    if(canvas_menu){
        return;
    }

    // Move the player.
    var movement = 0;
    if(input_keys[83]['state']
      && race_racers[0]['speed'] > -race_racers[0]['speed-max'] / 2){
        movement = -race_racers[0]['acceleration'];
    }
    if(input_keys[87]['state']
      && race_racers[0]['speed'] < race_racers[0]['speed-max']){
        movement = race_racers[0]['acceleration'];
    }
    race_racers[0]['speed'] = race_racers[0]['speed'] + movement;

    if(race_racers[0]['speed'] !== 0){
        if(movement === 0){
            if(Math.abs(race_racers[0]['speed']) > .001){
                race_racers[0]['speed'] = math_round(
                  race_racers[0]['speed'] * .95
                );

            }else{
                race_racers[0]['speed'] = 0;
            }
        }

        var camera_movement = math_move_3d(
          race_racers[0]['speed'],
          race_racers[0]['angle'] - 90
        );
        race_racers[0]['x'] += camera_movement['x'];
        race_racers[0]['y'] += camera_movement['z'];

        var rotation = false;
        if(input_keys[65]['state']){
            rotation = 1 / (1 / race_racers[0]['speed']);
        }
        if(input_keys[68]['state']){
            rotation = -1 / (1 / race_racers[0]['speed']);
        }
        if(rotation !== false){
            race_racers[0]['angle'] -= rotation;
        }
    }

    // Move all other racers.
    for(var racer in race_racers){
        if(racer === '0'){
            continue;
        }

        if(race_racers[racer]['speed'] < race_racers[racer]['speed-max']){
            race_racers[racer]['speed'] += race_racers[racer]['acceleration'];
        }

        if(math_distance(
          race_racers[racer]['x'],
          race_racers[racer]['y'],
          race_checkpoints[race_racers[racer]['target']]['x'],
          race_checkpoints[race_racers[racer]['target']]['y']
        ) < 50){
            if(race_checkpoints[race_racers[racer]['target']]['lap']){
                race_racers[racer]['lap'] += 1;
            }
            race_racers[racer]['target'] = race_checkpoints[race_racers[racer]['target']]['next'];
        }

        var angle = Math.atan2(
          race_checkpoints[race_racers[racer]['target']]['y'] - race_racers[racer]['y'],
          race_checkpoints[race_racers[racer]['target']]['x'] - race_racers[racer]['x']
        );
        if(angle < 0){
            angle += math_tau;

        }else if(angle > math_tau){
            angle -= math_tau;
        }

        if(race_racers[racer]['angle'] > angle){
          race_racers[racer]['angle'] -= race_racers[racer]['turn'];

        }else if(race_racers[racer]['angle'] < angle){
          race_racers[racer]['angle'] += race_racers[racer]['turn'];
        }

        race_racers[racer]['x'] += Math.cos(race_racers[racer]['angle']) * race_racers[racer]['speed'];
        race_racers[racer]['y'] += Math.sin(race_racers[racer]['angle']) * race_racers[racer]['speed'];
    }
}

function setmode_logic(newgame){
    race_checkpoints.length = 0;
    race_racers.length = 0;

    // Main menu mode.
    if(canvas_mode === 0){
        document.body.innerHTML = '<div><div><a onclick="canvas_setmode(1, true)">Test Track</a></div></div>'
          + '<div class=right><div><input disabled value=WASD>Drive<br>'
          + '<input disabled value=ESC>Menu</div><hr>'
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

        race_checkpoints = [
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
        race_racer_create({
          'color': settings_settings['color'],
          'y': -150,
        });
        race_racer_create({
          'color': '#fff',
          'y': -150,
        });
        race_walls = [
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

window.onload = function(){
    settings_init(
      'Race-2D.htm-',
      {
        'audio-volume': 1,
        'color': '#009900',
        'ms-per-frame': 25,
      }
    );
    input_init(
      {
        27: {
          'todo': canvas_menu_toggle,
        },
        65: {},
        68: {},
        81: {
          'todo': canvas_menu_quit,
        },
        83: {},
        87: {},
      }
    );
    canvas_init();
};
