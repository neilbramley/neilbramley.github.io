var world;
var bodies = []; // instances of b2Body (from Box2D)
var actors = []; // instances of Bitmap (from IvanK)
var up;
var idco = undefined;
var CO_damping = 10;
var damping = 0.1;
var mouse_initially_entered_frame = false;
var ratio = 100; //1 meter == 100 pixels (worry about pixel_ratio later!)

function Start() 
{   
    var stage = new Stage("c");
    stage.addEventListener(Event.ENTER_FRAME, onEF);
    stage.addEventListener(MouseEvent.MOUSE_DOWN, AssumeControl);
    stage.addEventListener(MouseEvent.MOUSE_UP, RenegeControl);
    parent.document.getElementById('game_frame').addEventListener("mouseout", RenegeControl);

    // background
    // var bg = new Bitmap( new BitmapData("border.png") );
    // bg.scaleX = bg.scaleY = stage.stageHeight/512;
    // stage.addChild(bg);

         b2Vec2      = Box2D.Common.Math.b2Vec2;
    var  b2BodyDef   = Box2D.Dynamics.b2BodyDef,
         b2Body      = Box2D.Dynamics.b2Body,
         b2FixtureDef    = Box2D.Dynamics.b2FixtureDef,
         b2World     = Box2D.Dynamics.b2World,
         b2PolygonShape  = Box2D.Collision.Shapes.b2PolygonShape;
         b2CircleShape   = Box2D.Collision.Shapes.b2CircleShape;

    world = new b2World(new b2Vec2(0, 10),  true);
    up = new b2Vec2(0, -1);

    // I decided that 1 meter = 100 pixels

    var bxFixDef   = new b2FixtureDef();   // box  fixture definition
    bxFixDef.shape = new b2PolygonShape();
    bxFixDef.density = 1;

    var bodyDef = new b2BodyDef();
    bodyDef.type = b2Body.b2_staticBody;

    // create ground
    bxFixDef.shape.SetAsBox(10, 1);
    bodyDef.position.Set(9, stage.stageHeight/ratio + 1);
    world.CreateBody(bodyDef).CreateFixture(bxFixDef);
    bxFixDef.shape.SetAsBox(1, 100);
    bxFixDef.friction = .9;

    // left wall
    bodyDef.position.Set(-1, 3);
    world.CreateBody(bodyDef).CreateFixture(bxFixDef);
    // right wall
    bodyDef.position.Set(stage.stageWidth/ratio + 1, 3);
    world.CreateBody(bodyDef).CreateFixture(bxFixDef);

    // Both images are supposed to be 200 x 200 px
    var bxBD = new BitmapData("../images/box.png");
      
      //Create a polygon shape for the box2d objects
      
        all_points = {small:{
                            rhs:[{x: 0.2, y: 0}, {x: 0.3, y: 0}, {x: 0.05, y:0.667}, {x: -0.05, y:0.667}],
                            lhs:[{x: -0.2, y: 0}, {x: -0.3, y: 0}, {x: -0.05, y:0.667}, {x: 0.05, y:0.667}]
                            },

                        med:{
                            rhs:[{x: 0.3, y: 0}, {x: 0.4, y: 0}, {x: 0.05, y:1}, {x: -0.05, y:1}],
                                lhs:[{x: -0.3, y: 0}, {x: -0.4, y: 0}, {x: -0.05, y:1}, {x: 0.05, y:1}]
                            },

                        large:{
                            rhs:[{x: 0.4, y: 0}, {x: 0.5, y: 0}, {x: 0.05, y:1.333}, {x: -0.05, y:1.333}],
                                lhs:[{x: -0.4, y: 0}, {x: -0.5, y: 0}, {x: -0.05, y:1.333}, {x: 0.05, y:1.333}]
                            }
                    };



        cols = [0xff0000, 0x00ff00, 0x0000ff];

      ///////////////////
      //Create the pieces
      ///////////////////
      bodyDef.type = b2Body.b2_dynamicBody;

       // var hw = 0.1;    // "half width"
       // var hh = 0.5;    // "half height"
           

      for(var i = 0; i < 9; i++)
      {
        console.log('i',i);

        col = cols[Math.floor(i/3)];

        if (i%3 == 0)
        {
         raw_points = all_points.small;
        } else if (i%3 == 1)
        {
        raw_points = all_points.med;
        } else if (i%3 == 2)
        {
        raw_points = all_points.large;
        }

        var points = {rhs:[], lhs:[]};

        for (var j = 0; j < raw_points.rhs.length; j++) {
            var vec = new b2Vec2();
            vec.Set(raw_points.rhs[j].x, raw_points.rhs[j].y);
            points.rhs[j] = vec;

            var vec2 = new b2Vec2();
            vec2.Set(raw_points.lhs[raw_points.lhs.length-j-1].x, raw_points.lhs[raw_points.lhs.length-j-1].y);
            points.lhs[j] = vec2;
        }

        var rhsFixDef   = new b2FixtureDef();   // box  fixture definition
        rhsFixDef.shape = new b2PolygonShape();
        rhsFixDef.density = 1;
        rhsFixDef.shape.SetAsArray(points.rhs, points.rhs.length);


        var lhsFixDef   = new b2FixtureDef();   // box  fixture definition
        lhsFixDef.shape = new b2PolygonShape();
        lhsFixDef.density = 1;
        lhsFixDef.shape.SetAsArray(points.lhs, points.lhs.length);

        bodyDef.position.Set(Math.random()*7, -5 + Math.random()*5);


           //The box2d object
           var body = world.CreateBody(bodyDef);

            body.CreateFixture(rhsFixDef);    //rhs
            body.CreateFixture(lhsFixDef);    //lhs


           bodies.push(body);

           body.SetAngle(Math.PI);

           //The visualisation of it
           // var bm = new Bitmap(bxBD);  bm.x = bm.y = -100;
           var actor = new Sprite();
           //actor.addChild(bm);
           
           //Right hand side
           actor.graphics.beginFill(col, .5);
           // actor.graphics.drawRect(-hw*ratio,-hh*ratio,2*hw*ratio,2*hh*ratio);
            actor.graphics.moveTo(raw_points.rhs[0].x*ratio, raw_points.rhs[0].y*ratio);
            for (var j=1; j<raw_points.rhs.length; j++)
            {
                actor.graphics.lineTo(raw_points.rhs[j].x*ratio, raw_points.rhs[j].y*ratio);
            }
           actor.graphics.endFill();
            
            //Left hand side
            actor.graphics.beginFill(col, .5);

            actor.graphics.moveTo(raw_points.lhs[0].x*ratio, raw_points.lhs[0].y*ratio);
            for (var j=1; j<raw_points.rhs.length; j++)
            {
                actor.graphics.lineTo(raw_points.lhs[j].x*ratio, raw_points.lhs[j].y*ratio);
            }
           actor.graphics.endFill();

           //Surface
            actor.graphics.beginFill(col, .1);

            actor.graphics.moveTo(raw_points.rhs[1].x*ratio, raw_points.rhs[1].y*ratio);

            actor.graphics.lineTo(raw_points.rhs[2].x*ratio, raw_points.rhs[2].y*ratio);
            actor.graphics.lineTo(raw_points.lhs[2].x*ratio, raw_points.lhs[2].y*ratio);
            actor.graphics.lineTo(raw_points.lhs[1].x*ratio, raw_points.lhs[1].y*ratio);

           actor.graphics.endFill();

            actor.obj_ix = i;

           //actor.addEventListener(MouseEvent.MOUSE_MOVE, Jump);  
           stage.addChild(actor);
           actors.push(actor);
      }
 }
 
function onEF(e) 
{
    world.Step(1 / 60,  3,  3);
    world.ClearForces();

    if (e.target.mouseX > 0 | e.target.mouseY > 0) {
        mouse_initially_entered_frame = true;
    }

    if (mouse_initially_entered_frame == true) {
        xPos = e.target.mouseX;
        yPos = e.target.mouseY;
    }

    for(var i=0; i<actors.length; i++)
    {
        var body  = bodies[i];
        var actor = actors [i];
        var p = body.GetPosition();
        actor.x = p.x * 100;   // updating actor
        actor.y = p.y * 100;
        actor.rotation = body.GetAngle()*180/Math.PI;
    }

    if (idco != undefined) {

        var body = bodies[idco]; //Select the fist or controlled puck

        var tmp = body.GetLinearVelocity();
        //var fistSpeed = Math.sqrt(Math.pow(tmp.x, 2), Math.pow(tmp.y, 2))

        var xCO = body.GetPosition().x; //Position of controlled object
        var yCO = body.GetPosition().y; //Position of controlled object
        //TODO change this to position ON controlled object

        //This is pretty heuristic force increases rapidly for farther distances from cursor
        //but is also damped by the current velocity to prevent it getting too crazy
        var xVec = .2*Math.pow((xPos / ratio - xCO), 1); //fistSpeed; 
        var yVec = .2*Math.pow((yPos / ratio - yCO), 1); //fistSpeed;
        //console.log('trying to control', idco, xVec, yVec, xPos, yPos, ratio, xCO, yCO);
        var arm_force = new b2Vec2(xVec, yVec);

        var centre = body.GetWorldCenter();
        var position = body.GetPosition();

        // //Account for the rotation
        var current_angle = body.GetAngle();

        var mov2centre = {x:(centre.x - position.x) * Math.cos(offset_angle) - (centre.y - position.y) * Math.sin(offset_angle),
        y:(centre.x - position.x) * Math.sin(offset_angle) + (centre.y - position.y) * Math.cos(offset_angle)}

        var angle_change = current_angle - offset_angle;

        current_offset = {x:offset.x * Math.cos(angle_change) - offset.y * Math.sin(angle_change),
            y:offset.x * Math.sin(angle_change) + offset.y * Math.cos(angle_change)};
        

    

        var pinch_point = new b2Vec2(mov2centre.x + current_offset.x, mov2centre.y + current_offset.y);
                var pinch_point = new b2Vec2(current_offset.x, current_offset.y);

        body.ApplyImpulse(arm_force, pinch_point);
            // 
    }
}
  
function Jump(e)
{
       var a = e.currentTarget;  // current actor
       var i = actors.indexOf(a);
       //  cursor might be over ball bitmap, but not over a real ball
       if(i>=25 && Math.sqrt(a.mouseX*a.mouseX + a.mouseY*a.mouseY) > 100) return;
       bodies[i].ApplyImpulse(up, bodies[i].GetWorldCenter());
}

function AssumeControl(e) {

  //Reset damping parameter of previously controlled object if necessary
  if (e.target.obj_ix != undefined) {
    idco = e.target.obj_ix;
    bodies[idco].m_linearDamping = CO_damping;
    console.log('took control of', idco); //, e.target

    //GetWorldPoint( b2Vec2(1,1) );//GET THIS TO BE THE LOCAL MOUSE POSITION
    centre = bodies[idco].GetWorldCenter();
    position = bodies[idco].GetPosition();
    offset_angle = bodies[idco].GetAngle();
    
    appar_offset = {x:xPos/ratio - centre.x, y:yPos/ratio - centre.y};
    offset = {x:appar_offset.x * Math.cos(offset_angle) - appar_offset.y * Math.sin(offset_angle),
              y:appar_offset.x * Math.sin(offset_angle) + appar_offset.y * Math.cos(offset_angle)};

    mov2centre = {x:(centre.x - position.x) * Math.cos(offset_angle) - (centre.y - position.y) * Math.sin(offset_angle),
                    y:(centre.x - position.x) * Math.sin(offset_angle) + (centre.y - position.y) * Math.cos(offset_angle)}

    actors[idco].graphics.beginFill(0x000000, 1);
    actors[idco].graphics.drawCircle(0, 0, 3);
    actors[idco].graphics.drawCircle(0, 20, 1);
    actors[idco].graphics.drawCircle(mov2centre.x*ratio, mov2centre.y*ratio, 5);
    actors[idco].graphics.endFill();
    actors[idco].graphics.beginFill(0x336644, 1);
    actors[idco].graphics.drawCircle((mov2centre.x + offset.x)*ratio, (mov2centre.y + offset.y)*ratio, 7);
    actors[idco].graphics.endFill();


            console.log('offset vals', offset.x, offset.y, 'angles', 
            offset_angle, 
            'centre', centre, 'position', position, 'locs:', (mov2centre.y + offset.y)*ratio);

  } else {
    console.log('missed!', e.target);
  }


}

function RenegeControl(e) {


  //Reset damping parameter of previously controlled object if necessary
  if (idco != undefined) {

    bodies[idco].m_linearDamping = damping;
    //actors[idco].removeChild(bm); //Remove "controlled object" overlay e.target//e.target
    //console.log('released control of', idco);
    console.log('reneging!', idco);
    idco = undefined;

  }
}