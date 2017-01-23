'use strict';

function draw_logic(){
    canvas_buffer.save();
    canvas_buffer.translate(
      canvas_x,
      canvas_y
    );
    canvas_buffer.rotate(-entity_entities['player']['angle'] - 1.5708);
    canvas_buffer.translate(
      -entity_entities['player']['x'],
      -entity_entities['player']['y']
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
    */

    // Draw racers.
    for(var racer in entity_entities){
        canvas_buffer.fillStyle = entity_entities[racer]['color'];
        canvas_buffer.save();
        canvas_buffer.translate(
          entity_entities[racer]['x'],
          entity_entities[racer]['y']
        );
        canvas_buffer.rotate(entity_entities[racer]['angle']);

        canvas_buffer.fillRect(
          -15,
          -10,
          30,
          20
        );

        canvas_buffer.restore();
    }

    canvas_buffer.restore();

    // Draw lap counter.
    canvas_buffer.fillStyle = '#fff';
    canvas_buffer.fillText(
      entity_entities['player']['lap'],
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
      && entity_entities['player']['speed'] > -entity_entities['player']['speed-max'] / 2){
        movement = -entity_entities['player']['acceleration'];
    }
    if(input_keys[87]['state']
      && entity_entities['player']['speed'] < entity_entities['player']['speed-max']){
        movement = entity_entities['player']['acceleration'];
    }
    entity_entities['player']['speed'] = entity_entities['player']['speed'] + movement;

    if(entity_entities['player']['speed'] !== 0){
        if(movement === 0){
            if(Math.abs(entity_entities['player']['speed']) > .001){
                entity_entities['player']['speed'] = math_round({
                  'number': entity_entities['player']['speed'] * .95,
                });

            }else{
                entity_entities['player']['speed'] = 0;
            }
        }

        var rotation = false;
        if(input_keys[65]['state']){
            rotation = 1 / (1 / entity_entities['player']['speed']) * entity_entities['player']['turn'];
        }
        if(input_keys[68]['state']){
            rotation = 1 / (1 / entity_entities['player']['speed']) * -entity_entities['player']['turn'];
        }
        if(rotation !== false){
            entity_entities['player']['angle'] -= rotation;
        }

        var camera_movement = math_move_3d({
          'angle': math_radians_to_degrees({
            'radians': entity_entities['player']['angle'],
          }) - 90,
          'speed': entity_entities['player']['speed'],
        });
        entity_entities['player']['x'] += camera_movement['x'];
        entity_entities['player']['y'] += camera_movement['z'];
    }

    // Move ai.
    for(var racer in entity_entities){
        if(!entity_entities[racer]['ai']){
            continue;
        }

        if(entity_entities[racer]['speed'] < entity_entities[racer]['speed-max']){
            entity_entities[racer]['speed'] += entity_entities[racer]['acceleration'];
        }

        if(math_distance({
          'x0': entity_entities[racer]['x'],
          'x1': race_checkpoints[entity_entities[racer]['target']]['x'],
          'y0': entity_entities[racer]['y'],
          'y1': race_checkpoints[entity_entities[racer]['target']]['y'],
        }) < 50){
            if(race_checkpoints[entity_entities[racer]['target']]['lap']){
                entity_entities[racer]['lap'] += 1;
            }
            entity_entities[racer]['target'] = race_checkpoints[entity_entities[racer]['target']]['next'];
        }

        var angle = Math.atan2(
          race_checkpoints[entity_entities[racer]['target']]['y'] - entity_entities[racer]['y'],
          race_checkpoints[entity_entities[racer]['target']]['x'] - entity_entities[racer]['x']
        );
        if(angle < 0){
            angle += math_tau;

        }else if(angle > math_tau){
            angle -= math_tau;
        }

        if(entity_entities[racer]['angle'] > angle){
          entity_entities[racer]['angle'] -= entity_entities[racer]['turn'];

        }else if(entity_entities[racer]['angle'] < angle){
          entity_entities[racer]['angle'] += entity_entities[racer]['turn'];
        }

        entity_entities[racer]['x'] += Math.cos(entity_entities[racer]['angle']) * entity_entities[racer]['speed'];
        entity_entities[racer]['y'] += Math.sin(entity_entities[racer]['angle']) * entity_entities[racer]['speed'];
    }
}

function setmode_logic(newgame){
    race_checkpoints.length = 0;
    entity_entities.length = 0;

    // Main menu mode.
    if(canvas_mode === 0){
        document.body.innerHTML = '<div><div><a onclick=canvas_setmode({mode:1,newgame:true})>Test Track</a></div></div>'
          + '<div class=right><div><input disabled value=WASD>Drive<br>'
          + '<input disabled value=ESC>Menu</div><hr>'
          + '<div><input id=audio-volume max=1 min=0 step=0.01 type=range>Audio<br>'
          + '<input id=color type=color>Color<br>'
          + '<input id=ms-per-frame>ms/Frame<br>'
          + '<a onclick=storage_reset()>Reset Settings</a></div></div>';
        storage_update();

    // New game mode.
    }else{
        if(newgame){
            storage_save();
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
          'id': 'player',
          'properties': {
            'ai': false,
            'color': storage_data['color'],
            'y': -150,
          },
        });
        race_racer_create({
          'id': 'ai',
          'properties': {
            'color': '#fff',
            'y': -150,
          },
        });
        /*
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
        */
    }
}

window.onload = function(){
    entity_types_default = [
      '_racer',
    ];
    input_init({
      'keybinds': {
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
      },
    });
    storage_init({
      'data': {
        'audio-volume': 1,
        'color': '#009900',
        'ms-per-frame': 25,
      },
      'prefix': 'Race-2D.htm-',
    });
    canvas_init();
    race_init();
};
