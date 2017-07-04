//LINDA PARADOX will ball A land in the bucket?

//Declaring some global variables
var world;
var stage = undefined;
var bodies = []; // instances of b2Body (from Box2D)
var actors = []; // instances of Bitmap (from IvanK)
var up;
var idco = undefined;
var CO_damping = 10;
var damping = 0.1;
var mouse_initially_entered_frame = false;
var pixel_ratio =  window.devicePixelRatio;
var ratio = 100 * pixel_ratio; //1 meter == 100 pixels (worry about pixel_ratio later!)
var half_ratio = ratio/3; //A smaller size for buttons (rescales life size pieces for the buttons);
var rotate = 0; //-1 for rotating anticlockwise, 1 for rotating clockwise, 0 for neither.
var f1 = new TextFormat("Helvetica", 25 * pixel_ratio, 0x000000, false, false, "right");
var removed = [];
var trialdata = [];
var n_red = 0;
var n_green = 0;
var n_blue = 0;
var starting_locs = [];
var ending_locs = [];
var current_locs = [];
var cols = [];
var userdata = [];
var removed = [];
var counter = 0;

//Declaring the Box2d functions I use
var   b2Vec2      = Box2D.Common.Math.b2Vec2,
b2BodyDef   = Box2D.Dynamics.b2BodyDef,
b2Body      = Box2D.Dynamics.b2Body,
b2FixtureDef    = Box2D.Dynamics.b2FixtureDef,
b2World     = Box2D.Dynamics.b2World,
b2PolygonShape  = Box2D.Collision.Shapes.b2PolygonShape,
b2CircleShape  = Box2D.Collision.Shapes.b2CircleShape,
b2ContactListener = Box2D.Dynamics.b2ContactListener;

var Color = net.brehaut.Color;
var timeout = 2;//Frames

function Start(params) 
{
    //Create the stage
    if (stage===undefined)
    {
    	stage = new Stage("c");

	    world = new b2World(new b2Vec2(0, 10),  true);//New world with normal gravity

	    world.SetContactListener(listener);
	    
	    var bxFixDef   = new b2FixtureDef();   // box  fixture definition
	    bxFixDef.shape = new b2PolygonShape();
	    bxFixDef.density = 1;
	    bxFixDef.restitution = 0.1;
	    bxFixDef.friction = 0.5;

	    var bodyDef = new b2BodyDef();
	    bodyDef.type = b2Body.b2_staticBody;
	    
	    /////////////////
	    // create ground
	    //////////////// 
	    bxFixDef.shape.SetAsBox(10, 0.1);//10m by 1m static box
	    bodyDef.position.Set(0, 6);//Places it in the bottom 1m of the window
	    var ground = world.CreateBody(bodyDef).CreateFixture(bxFixDef);
	    ground.SetUserData({type:"ground"});

	    var s = new Sprite();
	    s.graphics.beginFill(0x000000, .7);
	    s.graphics.drawRect(0,0, 6*ratio, 0.1*ratio);
	    s.graphics.endFill();
	    stage.addChild(s);
	    s.y=6*ratio - 0.1 * ratio;

		/////////////////
		//Create bucket
		/////////////////
		//NB Polygons must be anticlockwise
		
		var raw_points = { lhs:[{x:-0.5, y:0.5},{x:-0.3, y:0.5},
		{x:-0.5, y:-0.5},{x:-0.7, y:-0.5}
		],
		rhs:[{x:0.5,y:0.5},{x:0.3,y:0.5},
		{x:0.5,y:-0.5},{x:0.7,y:-0.5}
		],
		b:[{x:-0.5,y:0.7},{x:0.5,y:0.7},
		{x:0.5,y:0.5},{x:-0.5,y:0.5}
		]};

		var points = {lhs:[], rhs:[], b:[]};
		for (var j = 0; j < raw_points.rhs.length; j++) {

			var vec = new b2Vec2();
			vec.Set(raw_points.rhs[j].x, raw_points.rhs[j].y);
			points.rhs[j] = vec;

			var vec2 = new b2Vec2();
			vec2.Set(raw_points.lhs[raw_points.lhs.length-j-1].x, raw_points.lhs[raw_points.lhs.length-j-1].y);
			points.lhs[j] = vec2;

			var vec3 = new b2Vec2();
			vec3.Set(raw_points.b[raw_points.b.length-j-1].x, raw_points.b[raw_points.b.length-j-1].y);
			points.b[j] = vec3;
		}

	    // left wall
	    var lhsFixDef   = new b2FixtureDef();   // box  fixture definition
	    lhsFixDef.shape = new b2PolygonShape();
	    lhsFixDef.density = 1;
	    //lhsFixDef.restitution = 0.1; 
	    lhsFixDef.shape.SetAsArray(points.lhs, points.lhs.length);
	    // right wall
	    var rhsFixDef   = new b2FixtureDef();   // box  fixture definition
	    rhsFixDef.shape = new b2PolygonShape();
	    rhsFixDef.density = 1;
	    //rhsFixDef.restitution = 0.1; 
	    rhsFixDef.shape.SetAsArray(points.rhs, points.rhs.length);
	    //Bottom
	     var bFixDef   = new b2FixtureDef();   // box  fixture definition
	    bFixDef.shape = new b2PolygonShape();
	    bFixDef.density = 1;
	    //bFixDef.restitution = 0.1; 
	    //bFixDef.shape.SetAsBox(1, 0.1);
	    console.log('points.b', points.b);
	    bFixDef.shape.SetAsArray(points.b, points.b.length);

	    
		
		bodyDef.type = b2Body.b2_staticBody;
		bodyDef.position.Set((stage.stageWidth/ratio)/2, 5.2);
		// var bucketlhs = world.CreateBody(bodyDef).CreateFixture(lhsFixDef);
		// var bucketrhs = world.CreateBody(bodyDef).CreateFixture(rhsFixDef);
		// var bucketbottom = world.CreateBody(bodyDef);
		// bucketbottom.CreateFixture(bFixDef);
	    
	    //All one object
	    var bucket = world.CreateBody(bodyDef);
	    bucket.CreateFixture(lhsFixDef);    //lhs
	    bucket.CreateFixture(rhsFixDef);    //rhs
	   	bucket.CreateFixture(bFixDef);    //lhs
	   	//bodies.push(bucket);

		var buckActor = new Sprite();

	    //Right hand side
	    buckActor.graphics.beginFill(0x000000, 0.5);
	    buckActor.graphics.moveTo(raw_points.rhs[0].x*ratio, raw_points.rhs[0].y*ratio);
	    for (var j=1; j<raw_points.rhs.length; j++)
	    {
	        buckActor.graphics.lineTo(raw_points.rhs[j].x*ratio, raw_points.rhs[j].y*ratio);
	    }
	    buckActor.graphics.endFill();

	    //Left hand side
	    buckActor.graphics.beginFill(0x000000, 0.5);

	    buckActor.graphics.moveTo(raw_points.lhs[0].x*ratio, raw_points.lhs[0].y*ratio);
	    for (var j=1; j<raw_points.lhs.length; j++)
	    {
	        buckActor.graphics.lineTo(raw_points.lhs[j].x*ratio, raw_points.lhs[j].y*ratio);
	    }
	    buckActor.graphics.endFill();

	    //Bottom
	    buckActor.graphics.beginFill(0x000000, 0.5);

	    buckActor.graphics.moveTo(raw_points.b[0].x*ratio, raw_points.b[0].y*ratio);
	    for (var j=1; j<raw_points.b.length; j++)
	    {
	        buckActor.graphics.lineTo(raw_points.b[j].x*ratio, raw_points.b[j].y*ratio);
	    }
	    buckActor.graphics.endFill();

	    //Surface
	    buckActor.graphics.beginFill(0x000000, 0.1);

	    buckActor.graphics.moveTo(raw_points.rhs[1].x*ratio, raw_points.rhs[1].y*ratio);

	    buckActor.graphics.lineTo(raw_points.rhs[2].x*ratio, raw_points.rhs[2].y*ratio);
	    buckActor.graphics.lineTo(raw_points.lhs[2].x*ratio, raw_points.lhs[2].y*ratio);
	    buckActor.graphics.lineTo(raw_points.lhs[1].x*ratio, raw_points.lhs[1].y*ratio);

	    buckActor.graphics.endFill();

	    stage.addChild(buckActor);
	    //console.log('bucket part bodies', bucketbottom);
	    buckActor.x = bucket.GetPosition().x*ratio;
	    buckActor.y = bucket.GetPosition().y*ratio;
	    //actors.push(buckActor);

	} else {
		for (var i=0; i<bodies.length; ++i)
		{
			stage.removeChild(actors[i]);
			world.DestroyBody(bodies[i]);
		}
	}
	
	counter = 0;
	timeout = params[2].t;
    




	/////////////////
    //Add the balls
    /////////////////
    //2 random hues
    var hues = [Math.floor(Math.random() * 360)];
    hues.push(hues[0] + 180);
    var labels = ['A','B'];
    var img = '';
    var r = 0.25;//radius of balls in meters

    var fixDef = new b2FixtureDef;
	fixDef.density = 1; // Set the density
	fixDef.friction = 0.1; // Set the friction
	fixDef.restitution = 0.5; // Set the restitution - bounciness
	fixDef.shape = new b2CircleShape;	// Define the shape of the fixture
	fixDef.shape.SetRadius(r);

	for (var i=0; i<2; i++)
	{
	    //BODY
	    var bodyDef = new b2BodyDef;
	    bodyDef.type = b2Body.b2_dynamicBody;
		// Set the position of the body
		bodyDef.position.x = -r/2;//params[i].x;
		bodyDef.position.y = -r/2;//Does this centre things?params[i].y;
		var b = world.CreateBody(bodyDef);
		b.CreateFixture(fixDef);
		b.SetUserData('ball' + i);

		var loc = new b2Vec2(params[i].x, params[i].y);
		var lin_vel = new b2Vec2(params[i].v * Math.cos(params[i].a),
		                     params[i].v * Math.sin(params[i].a));

		console.log('i',i, 'params', params[i], 'velocities',
		            params[i].v *  Math.cos(params[i].a),
		            params[i].v * Math.sin(params[i].a));

		b.SetPosition(loc);
		b.SetLinearVelocity(lin_vel);
		bodies.push(b);

	    //ACTOR
	    var actor = new Sprite();

		//Inefficient way to get from HSL colours to javascript (single integer) via RGB.
		var tmp = Color({hue: hues[i], saturation: 0.8, lightness:0.7});
		var tmp2 = hexToRgb(tmp);
		var color = tmp2.r;
		color = (color << 8) + tmp2.g;
		color = (color << 8) + tmp2.b;

		actor.graphics.beginFill(color, 1);
		actor.graphics.drawCircle(0, 0, r * ratio);
		actor.graphics.endFill();

		var t1 = new TextField();
		t1.selectable = false; // default is true
		t1.setTextFormat(f1);
		t1.text = labels[i];
		t1.width = t1.textWidth;
		t1.height = t1.textHeight;
		t1.obj_ix = actors.length;
		actor.addChild(t1);
		t1.x = -t1.textWidth / 2;
		t1.y = -t1.textHeight / 2;//-25;

		stage.addChild(actor);
		actor.obj_ix = actors.length;
		actors.push(actor);
	}

    stage.addEventListener(Event.ENTER_FRAME, onEF);
}


function onEF(e) 
{
	world.Step(1 / 60,  3,  3);
	world.ClearForces();
	counter++;

	for(var i=0; i<actors.length; i++)
	{
		var body  = bodies[i];
		var actor = actors [i];
		var p = body.GetPosition();
        actor.x = p.x * ratio;   // updating actor
        actor.y = p.y * ratio;
        actor.rotation = body.GetAngle()*180/Math.PI;
    }
    if (Math.random()<0.1)
    {
    	console.log('still physicsing', counter);
    }

    if ((counter/60)>timeout)
    {
    	stage.removeEventListener(Event.ENTER_FRAME, onEF);
    	parent.document.getElementById('startBtnTask4').disabled = false;
    }
}




//////////////
//Store Contact
//////////////

var listener = new b2ContactListener();
listener.BeginContact = function(contact) {
	var tmp = [];
	var tmp2 = [contact.GetFixtureA().GetBody().GetUserData(),
    contact.GetFixtureB().GetBody().GetUserData()];//.sort(); //Contact entities
};

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

