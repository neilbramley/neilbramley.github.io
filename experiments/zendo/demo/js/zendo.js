var mouseX;
var mouseY;
var mouse_initially_entered_frame = false;

var bodies = []; // instances of b2Body (from Box2D)
var actors = []; // instances of Bitmap (from IvanK)
var idco = undefined; //The id of the object that moves with the mouse position in the list of box2d 'bodies' and ivank 'actors'
var maxSpeed = 30;
var gravity = 10;//10;
var data = {
  timeline: [],
  events: [],
  setup: [],
  constants: []
};

var zoomConstant = true; //Keeping track of whether the user changes the zoom level

//Declaring a bunch of needed box2d variables
var b2Vec2 = Box2D.Common.Math.b2Vec2,
  b2BodyDef = Box2D.Dynamics.b2BodyDef,
  b2Body = Box2D.Dynamics.b2Body,
  b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
  b2World = Box2D.Dynamics.b2World,
  b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
b2GravityController = Box2D.Dynamics.Controllers.b2GravityController;
b2TensorDampingController = Box2D.Dynamics.Controllers.b2TensorDampingController;
b2ContactListener = Box2D.Dynamics.b2ContactListener;

var Color = net.brehaut.Color;

function Start(params)
{
    stage = new Stage("c");

    frame = 0;

    initial_pixel_ratio = window.devicePixelRatio;
    ratio = 100 * initial_pixel_ratio;

    w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)*initial_pixel_ratio;//width of iframe in pixels
    h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)*initial_pixel_ratio;//height of iframe in pixels
    centre = {x:w/2, y:h/2};//centre of iframe


    world = new b2World(new b2Vec2(0, 0),  true);
    //up = new b2Vec2(0, -5);
    


    borderWidth = Math.min(w / 20, h / 20);

    createBox(w, borderWidth, 0, h-borderWidth, b2Body.b2_staticBody, {which:"bottom"}, true, stage);
    createBox(w, borderWidth, 0, 0, b2Body.b2_staticBody, {which:"top"}, true, stage);

    createBox(borderWidth, h-2*borderWidth, 0, 0, b2Body.b2_staticBody, {which:"left"}, true, stage);
    createBox(borderWidth, h-2*borderWidth, w-borderWidth, 0, b2Body.b2_staticBody, {which:"right"}, true, stage);


    console.log('w', w, 'h', h,  'centre', centre, '\n',
        w, borderWidth, 0, h-borderWidth, '\n',
        borderWidth, h-2*borderWidth, 0, 0, '\n',
        borderWidth, h-2*borderWidth, w-borderWidth, 0);

    ////////////////////////////////////
    // Pieces/////////////////////////
    points = [{x:0, y:0},
                {x:1, y:0},
                {x:1, y:1}];

    hue = Math.floor(Math.random() * 360);
    pieces = [];
    label = 'Test label';

    for (i=0; i<2; ++i)
    {
        pieces.push(createPiece(points, 100 + 200*i, 100*i+100, b2Body.b2_dynamicBody, {which:("piece" + i)}, true, stage, hue, ''));

    }
    idco = 4;//TESTING SET ID CONTROLLED OBJECT TO FIRST PIECE
    console.log(pieces);

    //new b2GravityController()

    //TODO MAKE THEM APPEAR WHERE YOU WANT
    
    //INFO BOX
    //Currently just to display the mouse position;
    f1 = new TextFormat("Helvetica", 15 * initial_pixel_ratio, 0x000000, true, false, "right");
    info_box = new TextField();

    info_box.selectable = false; // default is true
    info_box.setTextFormat(f1);
    info_box.text = "                      ";
    info_box.width = info_box.textWidth;
    info_box.height = info_box.textHeight;
    stage.addChild(info_box);
    info_box.x = w  - 200;//0;
    info_box.y = h  - 100;//(c.height - 60);

    stage.addEventListener(Event.ENTER_FRAME, onEF);
    //stage.addEventListener(MouseEvent.CLICK , nextFrame);
    //stage.addEventListener(KeyboardEvent.KEY_UP , nextFrame);
    //document.addEventListener('keydown' , nextFrame);
    //document.addEventListener('keydown', function(event
    //stage.addEventListener(KeyboardEvent.KEY_UP , nextFrame);

}




function createBox(w, h, x, y, type, userData, isRendered, stage) {


    density = 1;//Mass
    damping = 0;
    friction = .05;
    restitution = .98;//Elasticity 

  // Create the fixture definition
  var fixDef = new b2FixtureDef;

  fixDef.density = density; // Set the density
  fixDef.friction = friction; // Set the friction 
  fixDef.restitution = restitution; // Set the restitution - elasticity

  // Define the shape of the fixture
  fixDef.shape = new b2PolygonShape;
  fixDef.shape.SetAsBox(
    w/2 // input should be half the width
    , h/2 // input should be half the height 
  );

  // Create the body definition
  var bodyDef = new b2BodyDef;
  bodyDef.type = type;

  // Set the position of the body
  bodyDef.position.x = x/ratio;
  bodyDef.position.y = y/ratio;

  // Set the damping (This was not working, any idea why not??)
  //bodyDef.linearDamping = defaultFor(damping, 0.1);

  // Create the body in the box2d world
  var b = world.CreateBody(bodyDef);
  b.CreateFixture(fixDef);

  //What is userData exactly, and how do we use it?
  if (typeof userData !== 'undefined') {
    b.SetUserData(userData);
  }

  b.m_linearDamping = damping;


  bodies.push(b);

    var actor = new Sprite();

    actor.graphics.beginFill(0x000000);

    actor.graphics.drawRect (0,0, w,h);

    actor.graphics.endFill();

    actor.x = b.GetPosition().x*ratio;
    actor.y = b.GetPosition().y*ratio;

    console.log(i, actor.x, actor.y);
    stage.addChild(actor);
    actors.push(actor);

  return b;
}

function createPiece(points, x, y, type, userData, isRendered, stage, hue, label) {
  

  // fist_mass = 2;
  // fist_elasticity = .5; //Or zero?
  // fist_friction = .05;
  // fistWidth = Math.min(fullX / 18, fullY / 18);
  // CO_damping = 10; //Controlled object damping
  // damping = .05; //Uncontrolled object damping
  // var wall_elasticity = .98; //Sets elasticity
  // var wall_friction = 0.05; //Sets friction of the walls  (When does this affect things since the objects nearly always bounce rather than slide??)
  // var wall_mass = 0;
  // var wall_damping = 0;
  // patch_width = Math.random() * 2;
  // patch_height = Math.random() * 2; //Make it a random shape between 0 and 1 meters in each dimension
  // var patch_x = (Math.random() * 3) + .5; //Random location for high friction patch
  // var patch_y = (Math.random() * 2) + .5; //Random location for high friction patch
  // //var y_c_elasticity = .96; //Works, support 0-1 (near zero is like a hacky-sack, near 1 is like a bouncy ball)
  // var o_friction = .05;

    density = 2;
    damping = .05;
    friction = .05;
    restitution = .5; 
    
    // Create the fixture definition
    var fixDef = new b2FixtureDef;

    fixDef.density = density; // Set the density
    fixDef.friction = friction; // Set the friction
    fixDef.restitution = restitution; // Set the restitution - bounciness
    
    // fixDef.shape = new b2PolygonShape();
    // fixDef.shape.SetAsArray(points, points.length);
    
    fixDef.shape = new b2CircleShape;
    fixDef.shape.SetRadius(.5);

    // Create the body definition
    var bodyDef = new b2BodyDef;
    bodyDef.type = type;

    // Set the position of the body
    console.log('\nposition', x,y);

    bodyDef.position.x = x/ratio;
    bodyDef.position.y = y/ratio;

    // Create the body in the box2d world
    var b = world.CreateBody(bodyDef);
    b.CreateFixture(fixDef);

    if (typeof userData !== 'undefined') {
    b.SetUserData(userData);
    }

    //this workaround seems to do the trick
    b.m_linearDamping = damping;

    b.SetLinearVelocity(new b2Vec2(0, 10));

    //b.SetPosition(new b2Vec2(position.x,position.y));
  //.ApplyImpulse(up, bodies[i].GetWorldCenter());

    if (isRendered) {
    bodies.push(b);
    }

  var actor = new Sprite();

    //Inefficient way to get from HSL colours to javascript (single integer) via RGB.
    var tmp = Color({
      hue: hue,
      saturation: .8,
      lightness: .7
    });
    var tmp2 = hexToRgb(tmp);
    color = tmp2.r;
    color = (color << 8) + tmp2.g;
    color = (color << 8) + tmp2.b;

    actor.graphics.beginFill(color, 1);
    
    // actor.graphics.moveTo(points[0].x*ratio, points[0].y*ratio);
    // for (var j=1; j<points.length; j++)
    // {
    //     actor.graphics.lineTo(points[j].x*ratio, points[j].y*ratio);
    // }
    actor.graphics.drawCircle(0, 0, .5 * ratio);
    
    actor.graphics.endFill();
    actor.x = b.GetPosition().x*ratio;
    actor.y = b.GetPosition().y*ratio;

    console.log(actor.graphics, fixDef.shape);

  if (label != '') {
    var f1 = new TextFormat("Helvetica", 25*initial_pixel_ratio, 0x000000, true, false, false);
    var t1 = new TextField();
    t1.selectable = false; // default is true
    t1.setTextFormat(f1);
    t1.text = label;
    t1.width = t1.textWidth;
    t1.height = t1.textHeight;
    t1.obj_ix = actors.length;
    actor.addChild(t1);
    t1.x = -t1.textWidth / 2;
    t1.y = -t1.textHeight / 2;//-25;
  }


  stage.addChild(actor);
  actor.obj_ix = actors.length;
  actors.push(actor);

  return b;
}


document.onmousemove = function(e){
    mouseX = e.pageX;
    mouseY = e.pageY;

    info_box.text = 'x:' + mouseX + ' y:' + mouseY;

};

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// function onMOv(e){ e.target.alpha = 1.0; }
// function onMOu(e){ e.target.alpha = 0.7; }
function nextFrame(e)
{

    if(e.keyCode == 39)
    {
        console.log('pressed right');
        onEF(e)
    }
}


function onEF(e) {
  

    world.Step(1/60, 3, 3);
    world.ClearForces();

     

    for (var i = 0; i < actors.length; i++) {

        var body = bodies[i];
        var actor = actors[i];
        var p = body.GetPosition();
        actor.x = p.x * ratio; // updating actor (100 is the pixels to meters ratio)
        actor.y = p.y * ratio;
        //actor.rotation = 0;
        
        if (i>3)
        {
            console.log(e.target, 'after frame', frame, bodies[i].m_userData.which, ':', p.x, p.y,
            'actor loc', actor.x, actor.y);
            var armForce = new b2Vec2(1, 1);
            body.ApplyImpulse(armForce, body.GetWorldCenter());
        }


    }


    // if (idco != undefined) {
    
    //     var body = bodies[idco]; //Select the fist or controlled puck

    //     var tmp = body.GetLinearVelocity();

    //     var tmp = new b2Vec2(3,3);
    //     body.SetPosition(mouseX/ratio, mouseY/ratio);

    //     var xCO = body.GetPosition().x; //Position of controlled object
    //     var yCO = body.GetPosition().y; //Position of controlled object

    //     //This is pretty heuristic force increases rapidly for farther distances from cursor
    //     //but is also damped by the current velocity to prevent it getting too crazy
    //     // var xVec = .2*Math.pow((mouseX / ratio - xCO), 1); //fistSpeed; 
    //     // var yVec = .2*Math.pow((mouseY / ratio - yCO), 1); //fistSpeed;    
    //     // var armForce = new b2Vec2(xVec, yVec);
    //     // body.ApplyImpulse(armForce, body.GetWorldCenter());

    //    // console.log('in idco', idco, (mouseX / ratio), xCO, (mouseY / ratio), yCO, armForce);
    // }

    if (frame>100)
    {
       stage.removeEventListener(Event.ENTER_FRAME, onEF); 
    }
    frame = frame + 1;
}


// var listener = new b2ContactListener();
// listener.BeginContact = function(contact) {


//   //////////////
//   //Store events
//   //////////////

//   //console.log('AB:',[contact.GetFixtureA().GetBody().GetUserData().name, contact.GetFixtureB().GetBody().GetUserData().name].sort());

//   var tmp = [];
//   var tmp2 = [contact.GetFixtureA().GetBody().GetUserData().name, contact.GetFixtureB().GetBody().GetUserData().name].sort(); //Contact entities
//   tmp.push(data.timeline.length + 1); //Store latest frame
//   tmp.push(data.events.length + 1); //Store event number
//   var d = new Date();
//   tmp.push(d.getTime());

//   tmp.push(tmp2[0]);
//   tmp.push(tmp2[1]);

//   for (var i = 0; i < actors.length; i++) {

//     var body = bodies[i];
//     var actor = actors[i];
//     var p = body.GetPosition();
//     actor.x = p.x * ratio; 
//     actor.y = p.y * ratio;
//     actor.rotation = 0;

//     if (body.m_userData.bodyType == "dynamic") {
//     tmp.push(Math.round(p.x * 1000) / 1000);
//     tmp.push(Math.round(p.y * 1000) / 1000);
//     tmp.push(Math.round(body.m_linearVelocity.x * 1000) / 1000);
//     tmp.push(Math.round(body.m_linearVelocity.y * 1000) / 1000);
//     }
//   }

//    console.log('contact!', tmp);

//   //Patch stuff
//   // var contactEntities = getSensorContact(contact);

//   // if (contactEntities) {
//   //   console.log('inner', contactEntities.sensor, contactEntities.sensor.GetUserData())
//   //   var sensor = contactEntities.sensor;
//   //   if (sensor.GetUserData()) {
//   //     var userData = sensor.GetUserData();
//   //     if (userData.controller) {
//   //       console.log('inner inner', userData.controller)
//   //       userData.controller.AddBody(contactEntities.body);

//   //     }
//   //   }
//   // }

// }