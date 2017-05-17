//////////////////////////////////////////////////////////
//Two objects ricochet in a box (will one exit left?)
//When unpacked with a more likely option we get an overestimation
//Of probability relative to packed?
//////////////////////////////////////////////////////////

//Declaring some global variables
var stage = undefined;
var world;
var bodies = []; // instances of b2Body (from Box2D)
var actors = []; // graphical visualisations of the dynamic bodies (from IvanK)
var wall_bodies = []; //  instances of static scenery (from Box2D)
var wall_actors = []; //  instances of static scenery (from Box2D)

var pixel_ratio =  window.devicePixelRatio;
var ratio = 100 * pixel_ratio; //1 meter == 100 pixels (worry about pixel_ratio later!)
//var f1 = new TextFormat("Helvetica", 25 * pixel_ratio, 0x000000, false, false, "right");
var f1 = new TextFormat("Helvetica", 15 * pixel_ratio, 0x000000, true, false, false);

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
var timeout = 1000;//Frames

function Start(params) 
{

    pixel_ratio =  window.devicePixelRatio;//Update the pixel ratio in case they zoomed
    ratio = 100 * pixel_ratio;

	wp = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)*pixel_ratio;//pixel width of iframe
    hp = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)*pixel_ratio;//pixel height of iframe
    w = wp/ratio;
    h = hp/ratio;
    console.log('wp', wp, 'hp', hp, 'w', w, 'h', h);

    counter = 0;

    //Create the stage (if necessary)
    if (stage===undefined)
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

	    //world.SetContactListener(listener);

		//////////////
		//WALLS
		//////////////
		
		//BODY
		var bxFixDef   = new b2FixtureDef();
		bxFixDef.shape = new b2PolygonShape();
		bxFixDef.density = 0;
		bxFixDef.friction = .1;
		bxFixDef.restitution = .98;

		var wallDef = new b2BodyDef();
		wallDef.type = b2Body.b2_staticBody;

	    var pos = [[1,1],[1,3],[5,1],[5,3],[3,0.5],[3,3.5]];
	    var dim = [[0.2, 1.2],[0.2, 1.2],[0.2, 1.2],[0.2, 1.2],[4,0.2],[4,0.2]];
	    var wall_name = ['ul','ll','ur','lr','t','b'];//Wall name: upper/lower, right/left, top/bottom

	    bxFixDef.shape.SetAsBox(0.2/2, 1/2);//.2 by 1 meter static box (these are half measures)
	    wallDef.position.Set(1.5, 1);

	   	for (var i=0; i<pos.length; ++i)
	   	{
		    bxFixDef.shape.SetAsBox(dim[i][0]/2, dim[i][1]/2);//.2 by 1 meter static box (these are half measures)
	    	wallDef.position.Set(pos[i][0], pos[i][1]);
	    	b = world.CreateBody(wallDef).CreateFixture(bxFixDef).SetUserData(wall_name[i]);
	    	
	   		wall_bodies.push(b);
	   		
	   		s = new Sprite();
		    s.graphics.beginFill(0x000000, .7);
		    s.graphics.drawRect(-dim[i][0]*ratio/2, -dim[i][1]*ratio/2,
		                        dim[i][0]*ratio, dim[i][1]*ratio);
		    s.graphics.endFill();
		    stage.addChild(s);
		    s.x=pos[i][0]*ratio;
		    s.y=pos[i][1]*ratio;
		    console.log(i, s.x, s.y);

		    s.wall_ix = wall_name[i];
		    wall_actors.push(s);
	   	}
	    console.log('wall_bodies', wall_bodies, 'wall_actors', wall_actors);


    } else {
    	//Remove the existing objects
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


    stage.addEventListener(Event.ENTER_FRAME, onEF);

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
	}

    stage.addEventListener(Event.ENTER_FRAME, onEF);
}



function onEF(e) 
{
	world.Step(1 / 60,  3,  3);
	world.ClearForces();
	
	var out = 0;

	counter++;

	for(var i=0; i<actors.length; i++)
	{
		var body  = bodies[i];
		var actor = actors [i];
		var p = body.GetPosition();
        actor.x = p.x * ratio;   // update actor
        actor.y = p.y * ratio;
        actor.rotation = 0;//Should they spin? body.GetAngle()*180/Math.PI;

        if ( (p.x>(w+1) || p.x<(-1)) || (p.y>(h+1) ||  p.y<(-1)) )
        {
    	    if (counter/60===Math.round(counter/60))
    		{
        		console.log('one went out!', i, p.x, p.y, w, h);
        	}
        	out++;
        }
    }

    //Occasionally let us know if you're still moving
    if (counter/60===Math.round(counter/60))
    {
		console.log(counter, out);
    }


    if (out>=bodies.length || counter>timeout)
    {
    	console.log('stopping', out, counter);
    	stage.removeEventListener(Event.ENTER_FRAME, onEF);
	    
	    parent.ResetTask2();
    }
}





// ///////////////
// //Store Contact
// ///////////////

// //USE IF WE WANT TO STORE CONTACT TIMES BETWEEN OBJECTS
// function getSensorContact(contact) {

// 	console.log('collision! (getSensorContact)', contact);

// 	var fixtureA = contact.GetFixtureA();
// 	var fixtureB = contact.GetFixtureB();

// 	var sensorA = fixtureA.IsSensor();
// 	var sensorB = fixtureB.IsSensor();

// 	if (!(sensorA || sensorB))
// 	return false;

// 	var bodyA = fixtureA.GetBody();
// 	var bodyB = fixtureB.GetBody();

// 	if (sensorA) { // bodyB should be added/removed to the buoyancy controller
// 	return {
// 		sensor: bodyA,
// 		body: bodyB
// 	};
// 	} else { // bodyA should be added/removed to the buoyancy controller
// 	return {
// 		sensor: bodyB,
// 		body: bodyA
// 	};
// 	}
// }


// var listener = new b2ContactListener();
// listener.BeginContact = function(contact) {
// 	var tmp = [];
// 	var tmp2 = [contact.GetFixtureA().GetBody().GetUserData(),
//     contact.GetFixtureB().GetBody().GetUserData()];//.sort(); //Contact entities

//     console.log('collision! (listenter.BeginContact)', tmp2);
// };

// listener.EndContact = function(contact) {
// 	var contactEntities = getSensorContact(contact);
//     console.log('collision! (listener)', contact);
// 	if (contactEntities) {
// 		var sensor = contactEntities.sensor;
// 		if (sensor.GetUserData()) {
// 			var userData = sensor.GetUserData();
// 			if (userData.controller) {
// 				userData.controller.RemoveBody(contactEntities.body);
// 			}
// 		}
// 	}
// };



//Something for constructing hex colours from RGB colours
function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}



