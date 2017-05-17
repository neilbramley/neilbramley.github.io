//////////////////////////////////////////////////////////
//Two objects travel at different angles etc toward a wall
//Which arrives first?
//TODO add distractor objects for contrast effects?
//////////////////////////////////////////////////////////

//Declaring some global variables
var stage = undefined;
var world;
var bodies = []; // instances of b2Body (from Box2D)
var actors = []; // instances of Bitmap (from IvanK)
var up;
var pixel_ratio =  window.devicePixelRatio;
var ratio = 100 * pixel_ratio; //1 meter == 100 pixels (worry about pixel_ratio later!)
//var f1 = new TextFormat("Helvetica", 25 * pixel_ratio, 0x000000, false, false, "right");
var f1 = new TextFormat("Helvetica", 15 * pixel_ratio, 0x000000, true, false, false);
var global_params = [];
var hit_wall = [false, false];

var wp=0, hp=0, w=0 ,h=0, counter=0;

//Declaring the Box2d functions I use
var   b2Vec2      = Box2D.Common.Math.b2Vec2,
b2BodyDef   = Box2D.Dynamics.b2BodyDef,
b2Body      = Box2D.Dynamics.b2Body,
b2FixtureDef    = Box2D.Dynamics.b2FixtureDef,
b2World     = Box2D.Dynamics.b2World,
b2PolygonShape  = Box2D.Collision.Shapes.b2PolygonShape,
b2CircleShape  = Box2D.Collision.Shapes.b2CircleShape,
b2ContactListener = Box2D.Dynamics.b2ContactListener;

//Something to do with defining colors
var Color = net.brehaut.Color;
//Trial length
var timeout = 120;//Frames (60 per second)

function Start(params) 
{
	global_params = params;

    pixel_ratio =  window.devicePixelRatio;//Update the pixel ratio in case they zoomed
    ratio = 100 * pixel_ratio;

	wp = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)*pixel_ratio;//pixel width of iframe
    hp = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)*pixel_ratio;//pixel height of iframe
    w = wp/ratio;
    h = hp/ratio;
    hit_wall = [false, false];

    console.log('wp', wp, 'hp', hp, 'w', w, 'h', h);

    counter = 0;

    //Create the stage (if necessary)
    if (stage==undefined)
    {
    	stage = new Stage("c");

    	////////////
	    //Background
	    ////////////
	    // var bg = new Bitmap( new BitmapData("border.png") );
	    // bg.scaleX = bg.scaleY = stage.stageHeight/512;
	    // stage.addChild(bg);
	    
	    ///////////////// 
	    //Track the mouse
		/////////////////
		info_box = new TextField();

	    info_box.selectable = false; // default is true
	    info_box.setTextFormat(f1);
	    info_box.text = "                             ";
	    info_box.width = info_box.textWidth;
	    info_box.height = info_box.textHeight;
	    stage.addChild(info_box);
	    info_box.x = (4/5)*wp - info_box.width/2;//0;
	    info_box.y = (4/5)*hp;

	    document.onmousemove = function(e){
	        mouseX = e.pageX;
	        mouseY = e.pageY;
	        //elementMouseIsOver = document.elementFromPoint(mouseX, mouseY);
	        //console.log(elementMouseIsOver);
	        info_box.text = 'x:' + mouseX/100 + ' y:' + mouseY/100;
	    };

	    /////////////
	    //BOX2D WORLD
	    /////////////
	    world = new b2World(new b2Vec2(0, 0),  true);

	    world.SetContactListener(listener);

		//////////////
		//CENTRAL WALL
		//////////////
		
		//BODY
		var bxFixDef   = new b2FixtureDef();
		bxFixDef.shape = new b2PolygonShape();
		bxFixDef.density = 0;
		bxFixDef.friction = .1;
		bxFixDef.restitution = .98;

		var wallDef = new b2BodyDef();
		wallDef.type = b2Body.b2_staticBody;

	    bxFixDef.shape.SetAsBox(0.1, h/2);//1 by "h" meter static box
	    wallDef.position.Set(w/2, h/2);
	    var wall = world.CreateBody(wallDef)
	    wall.CreateFixture(bxFixDef);
    	wall.SetUserData("wall");
 
	    //ACTOR
	    var s = new Sprite();
	    s.graphics.beginFill(0x000000, .7);
	    s.graphics.drawRect(0,0, 0.2*ratio, hp);
	    s.graphics.endFill();
	    stage.addChild(s);
	    s.x=wp/2 - s.width/2;
	    //s.y=(stage.stageHeight) - 1.5 * ratio;


    } else {
    	//Remove any existing objects
    	while(bodies.length>0)
    	{
			var b = bodies.pop();
			world.DestroyBody(b);
    	}

    	while(actors.length>0)
    	{
    		var a = actors.pop();
    		stage.removeChild(a);
    	}
    }


    ///////////
    //ADD BALLS
    ///////////
    
    //2 random hues
    var hues = [Math.floor(Math.random() * 360)];
    hues.push(hues[0] + 180);
    var labels = ['A','B'];
    var img = '';
    var r = 0.25;//radius of balls in meters

    var fixDef = new b2FixtureDef;
	fixDef.density = 1; // Set the density
	fixDef.friction = 0.1; // Set the friction
	fixDef.restitution = 0.98; // Set the restitution - bounciness
	fixDef.shape = new b2CircleShape;	// Define the shape of the fixture
	fixDef.shape.SetRadius(r);

	for (var i=0; i<params.length; i++)
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
		actor.x = bodies[i].x*ratio;
		actor.y = bodies[i].y*ratio;
	}

	//Wait a second then get started
	setTimeout(startEnterFrame, 500);
}

function startEnterFrame()
{
	stage.addEventListener(Event.ENTER_FRAME, onEF);
}

function resetTask()
{
	//Remove any existing objects
	while(bodies.length>0)
	{
		var b = bodies.pop();
		world.DestroyBody(b);
	}

	while(actors.length>0)
	{
		var a = actors.pop();
		stage.removeChild(a);
	}

    parent.ResetTask1();
}

function chooseWinner(e)
{
	var choice = e.target.obj_ix;
	alert('You chose ball ' + ['A','B'][choice] + '.  Were you right? Let\'s find out.' );
	//Now start it up again to see the true outcome
	stage.addEventListener(Event.ENTER_FRAME, onEF);
}

function onEF(e) 
{
	world.Step(1 / 60,  3,  3);
	world.ClearForces();
	
	// var out = 0;

	counter++;

	for(var i=0; i<actors.length; i++)
	{
		var body  = bodies[i];
		var actor = actors [i];
		var p = body.GetPosition();
        actor.x = p.x * ratio;   // update actor
        actor.y = p.y * ratio;
        actor.rotation = 0;//Should they spin? body.GetAngle()*180/Math.PI;

    }

    //Occasionally let us know if you're still moving
    if (counter/60===Math.round(counter/60))
    {
		console.log(counter);
    }

    //TODO fix criteria for when to pause
    if (counter===60)
    {
    	stage.removeEventListener(Event.ENTER_FRAME, onEF);
    	for (var i = 0; i<actors.length; ++i)
    	{
    		actors[i].addEventListener(MouseEvent.CLICK, chooseWinner);
    	}
    }

    if (hit_wall[0]===true & hit_wall[1]===true)
    {
		console.log('Restarting clip');

		stage.removeEventListener(Event.ENTER_FRAME, onEF);

		for (var i = 0; i<bodies.length; ++i)
		{
			var loc = new b2Vec2(global_params[i].x, global_params[i].y);
			var lin_vel = new b2Vec2(global_params[i].v * Math.cos(global_params[i].a),
		                     global_params[i].v * Math.sin(global_params[i].a));

			bodies[i].SetPosition(loc);
			bodies[i].SetLinearVelocity(lin_vel);	
		}
		hit_wall = [false, false];

		setTimeout(startEnterFrame, 500);
    }

    if (counter>=timeout)
    {
    	console.log('Stopping clip', counter);

    	stage.removeEventListener(Event.ENTER_FRAME, onEF);
    	setTimeout(resetTask, 500);

    }
}

   	



// ///////////////
// //Store Contact
// ///////////////

// //USE IF WE WANT TO STORE CONTACT TIMES BETWEEN OBJECTS
function getSensorContact(contact) {

	var fixtureA = contact.GetFixtureA();
	var fixtureB = contact.GetFixtureB();

	var sensorA = fixtureA.IsSensor();
	var sensorB = fixtureB.IsSensor();

	if (!(sensorA || sensorB))
	return false;

	var bodyA = fixtureA.GetBody();
	var bodyB = fixtureB.GetBody();

	if (sensorA) { // bodyB should be added/removed to the buoyancy controller
	return {
		sensor: bodyA,
		body: bodyB
	};
	} else { // bodyA should be added/removed to the buoyancy controller
	return {
		sensor: bodyB,
		body: bodyA
	};
	}
}


var listener = new b2ContactListener();
listener.BeginContact = function(contact) {
	var tmp = [];
	var tmp2 = [contact.GetFixtureA().GetBody().GetUserData(),
    contact.GetFixtureB().GetBody().GetUserData()];//.sort(); //Contact entities

    if (tmp2[1]==='ball0')
    {
    	hit_wall[0] = true;
    }

    if (tmp2[1]==='ball1')
    {
    	hit_wall[1]= true;
    }
};

listener.EndContact = function(contact) {
	var contactEntities = getSensorContact(contact);
    console.log('collision! (listener)', contact);
	if (contactEntities) {
		var sensor = contactEntities.sensor;
		if (sensor.GetUserData()) {
			var userData = sensor.GetUserData();
			if (userData.controller) {
				userData.controller.RemoveBody(contactEntities.body);
			}
		}
	}
};



//Something for constructing hex colours from RGB colours
function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}



