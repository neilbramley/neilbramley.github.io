//LINDA PARADOX will ball A miss the hole vs. will B hit A and A miss the hole?

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
var ratio = 50 * pixel_ratio; //1 meter == 100 pixels (worry about pixel_ratio later!)
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
	    
	    ///////////////
	    //Create ground
	    ///////////////
	    
	    ///LHS
	    bxFixDef.shape.SetAsBox(2.5, 0.3);//2m by 0.4m static box
	    bodyDef.position.Set(2.5, 10);//Places it in the bottom 1m of the window
	    var gr_bod_lhs = world.CreateBody(bodyDef).CreateFixture(bxFixDef);
	    bodyDef.position.Set(9.5, 10);//Places it in the bottom 1m of the window
	    var gr_bod_rhs = world.CreateBody(bodyDef).CreateFixture(bxFixDef);
	    //ground.SetUserData({type:"ground"});

	    var gr_actor_rhs = new Sprite();
	    gr_actor_rhs.graphics.beginFill(0x000000, .7);
	    gr_actor_rhs.graphics.drawRect(0,0, 5*ratio, 0.6*ratio);
	    gr_actor_rhs.graphics.endFill();
	    stage.addChild(gr_actor_rhs);
	    gr_actor_rhs.x=0;
	    gr_actor_rhs.y=9.7*ratio ;//- 0.15 * ratio;

		var gr_actor_lhs = new Sprite();
	    gr_actor_lhs.graphics.beginFill(0x000000, .7);
	    gr_actor_lhs.graphics.drawRect(0,0, 5*ratio, 0.6*ratio);
	    gr_actor_lhs.graphics.endFill();
	    stage.addChild(gr_actor_lhs);
	    gr_actor_lhs.x=7*ratio;
	    gr_actor_lhs.y=9.7*ratio ;//- 0.15 * ratio;
	
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
    var r = 0.5;//radius of balls in meters

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

