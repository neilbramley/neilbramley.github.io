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


//Declaring the Box2d functions I use
var   b2Vec2      = Box2D.Common.Math.b2Vec2,
b2BodyDef   = Box2D.Dynamics.b2BodyDef,
b2Body      = Box2D.Dynamics.b2Body,
b2FixtureDef    = Box2D.Dynamics.b2FixtureDef,
b2World     = Box2D.Dynamics.b2World,
b2PolygonShape  = Box2D.Collision.Shapes.b2PolygonShape,
b2ContactListener = Box2D.Dynamics.b2ContactListener;

//Stuff that I've commented out but am reluctant to delete
// b2CircleShape   = Box2D.Collision.Shapes.b2CircleShape,
// I decided that 1 meter = 100 pixels
//up = new b2Vec2(0, -1);

function LoadWorld(params) 
{
    //Create the stage
    if (stage===undefined)
    {
    	stage = new Stage("c");

	    //stage.addEventListener(Event.ENTER_FRAME, onEF);
	    stage.addEventListener(MouseEvent.MOUSE_DOWN, AssumeControl);
	    stage.addEventListener(MouseEvent.MOUSE_UP, RenegeControl);
	    stage.addEventListener(KeyboardEvent.KEY_DOWN, RotateOn);
	    stage.addEventListener(KeyboardEvent.KEY_UP, RotateOff);
	    //stage.addEventListener(MouseEvent.RIGHT_CLICK, RemovePiece, false); 
	    parent.document.getElementById('task3_frame').addEventListener("mouseout", RenegeControl);

	    world = new b2World(new b2Vec2(0, 10),  true);//New world with normal gravity

	    world.SetContactListener(listener);

	    var bxFixDef   = new b2FixtureDef();   // box  fixture definition
	    bxFixDef.shape = new b2PolygonShape();
	    bxFixDef.density = 1;
	    //bxFixDef.restitution = 0.25;
	    bxFixDef.friction = 0.5;///???

	    var bodyDef = new b2BodyDef();
	    bodyDef.type = b2Body.b2_staticBody;

	    // create ground
	    bxFixDef.shape.SetAsBox(10, 0.2);//10m by 1m static box
	    bodyDef.position.Set(0, 4);//Places it in the bottom 1m of the window
	    var ground = world.CreateBody(bodyDef).CreateFixture(bxFixDef);
	        ground.SetUserData({type:"ground"});

	    var s = new Sprite();
	    s.graphics.beginFill(0x000000, .7);
	    s.graphics.drawRect(0,0, 6*ratio, 0.1*ratio);
	    s.graphics.endFill();
	    stage.addChild(s);
	    //s.x=(stage.stageWidth)/2
	    s.y=4*ratio - 0.05 * ratio;



	    bxFixDef.shape.SetAsBox(1, 100);//1 meter wide by 100 meter high walls
	    // left wall
	    bodyDef.position.Set(-1, 3);
	    world.CreateBody(bodyDef).CreateFixture(bxFixDef);
	    // right wall
	    bodyDef.position.Set(stage.stageWidth/ratio+1, 3);
	    world.CreateBody(bodyDef).CreateFixture(bxFixDef);
    } else {
    	for (var i=0; i<bodies.length; ++i)
    	{
	    	stage.removeChild(actors[i]);
			world.DestroyBody(bodies[i]);
    	}
    }
    

    // Both images are supposed to be 200 x 200 px
    //var bxBD = new BitmapData("../images/box.png");

   
    //The colours of the blocks
    coloptions = [0xff0000, 0x00ff00, 0x0000ff];
    dims = [{w:1/2, h:1/4}, {w:1/4,h:1/4}, {w:1/2, h:1/8}];
	bodies = [];
	actors = [];
    userdata = [];
    removed = [];//Track indices of deleted objects (maybe remove this)
    cols = [];

    console.log('params', params)

    //Colour i
    for (var i=0; i<params.length; i++)
    {
    	removed.push([]);
    	userdata.push([]);
    	//Shape j
	    for (var j=0; j<params[i].length; j++)
		{
            removed[i].push([]);
            userdata[i].push([]);
            for (var k=0; k<params[i][j]; k++)
            {
                console.log('ping', i, j, k, '\n')

                //cols[i].push(coloptions[i]);
                userdata[i][j].push({col:['red','green','blue'][i], col_ix:i, shape:j, ix:bodies.length});
                removed[i][j].push(false);

                /////////////////
                //Add the blocks
                /////////////////
                console.log('colour', i, 'shape', j, bodies.length);

                var bodyDef = new b2BodyDef();
                bodyDef.type = b2Body.b2_dynamicBody;

                var blFixDef   = new b2FixtureDef();   // box  fixture definition
                blFixDef.shape = new b2PolygonShape();


                blFixDef.shape.SetAsBox(dims[j].w, dims[j].h);//One meter by one meter
                blFixDef.density = 1;
                blFixDef.restitution = 0.1;

                bodyDef.position.Set(Math.random()*4+1, Math.random()*3);

                //////////////////
                //The Box2d object
                //////////////////
                   
                var body = world.CreateBody(bodyDef);

                body.CreateFixture(blFixDef);
                bodies.push(body);

                //body.SetAngle(Math.PI + Math.random()*0.1 - 0.05);
                body.SetAngularDamping(.1);
                body.SetUserData(userdata[i][j]);

                /////////////////////////
                //The visualization of them
                /////////////////////////
                var actor = new Sprite();
                actor.graphics.beginFill(coloptions[i], .7);
                actor.graphics.drawRect(-dims[j].w*ratio,-dims[j].h*ratio, dims[j].w*ratio*2, dims[j].h*ratio*2);
                actor.graphics.endFill();
                
                actor.obj_ix = actors.length;
                
                // actor.graphics.drawRect(-hw*ratio,-hh*ratio,2*hw*ratio,2*hh*ratio);
                pos = body.GetPosition();
                console.log('i', i, 'pos', pos);

                stage.addChild(actor);
                actor.x = pos.x*ratio;
                actor.y = pos.y*ratio;
                actors.push(actor);
            }
            
		}
    }



    


}

function StartPhysics()
{
	current_locs = [];
	starting_locs = [];
	ending_locs = [];
	for (var i=0; i<bodies.length; i++)
	{
		starting_locs.push({ix:bodies[i].GetUserData().ix,
			color:bodies[i].GetUserData().col, shape:bodies[i].GetUserData().shape,
			x:bodies[i].GetPosition().x,
			y:bodies[i].GetPosition().y, a:bodies[i].GetAngle()});
	}

	parent.document.getElementById("conditiondetails").value = 'Current locations:\n' +
	JSON.stringify(current_locs) + '\n\nStarting locations:\n' +
	 JSON.stringify(starting_locs) + '\n\nEnding locations:\n' + 
	JSON.stringify(ending_locs);

	stage.addEventListener(Event.ENTER_FRAME, onEF);
}

function StopPhysics()
{
	current_locs = [];
	ending_locs = [];
	for (var i=0; i<bodies.length; i++)
	{
		ending_locs.push({ix:bodies[i].GetUserData().ix,
			color:bodies[i].GetUserData().col, shape:bodies[i].GetUserData().shape,
			x:bodies[i].GetPosition().x, y:bodies[i].GetPosition().y,
			a:bodies[i].GetAngle()});
	}
	stage.removeEventListener(Event.ENTER_FRAME, onEF);

	parent.document.getElementById("conditiondetails").value = 'Current locations:\n' +
	JSON.stringify(current_locs) + '\n\nStarting locations:\n' +
	 JSON.stringify(starting_locs) + '\n\n\nEnding locations:\n' + 
	JSON.stringify(ending_locs);
}

function ResetPhysics()
{
	stage.removeEventListener(Event.ENTER_FRAME, onEF);

	console.log('starting_locs', starting_locs);
	
	for (var i=0; i<bodies.length; i++)
	{
		var loc = new b2Vec2(starting_locs[i].x, starting_locs[i].y);
		bodies[i].SetPosition(loc);
		bodies[i].SetAngle(starting_locs[i].a);

		actors[i].x = starting_locs[i].x*ratio;
		actors[i].y = starting_locs[i].y*ratio;
		actors[i].rotation = bodies[i].GetAngle()*180/Math.PI;
		//Why disappear?
	}

}

function onEF(e) 
{
    world.Step(1 / 60,  3,  3);
    world.ClearForces();

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
    	console.log('still physicsing');
    }
}
  
// function RemovePiece(e)
// {
// 	console.log('remove piece triggered');
// 	var ix = e.target.obj_ix;
//     if (ix != undefined) {
// 		stage.removeChild(actors[ix]);
// 		world.DestroyBody(bodies[ix]);
// 		removed[ix] = true;
// 		// actors[ix] = null;
// 		// bodies[ix] = null;
//     } else {
//         console.log('missed removal!', e.target);
//     }
// }

function AssumeControl(e) {

    //Reset damping parameter of previously controlled object if necessary
    if (e.target.obj_ix != undefined) {

        idco = e.target.obj_ix;
        console.log('took control of', idco, bodies[idco].m_userData); //, e.target

        stage.addEventListener(Event.ENTER_FRAME, Move);
        
    } else {
        console.log('missed!', e.target);
    }
}

//Reset damping parameter of previously controlled object if necessary
function RenegeControl(e) {
    if (idco != undefined) {
        console.log('reneging!', idco);

        for (var i=0; i<bodies.length; ++i)
	    {
	    	if (bodies[i].IsAwake()==false)
	    	{
	    		console.log('waking ', i, 'up');
	    		bodies[i].SetAwake(true);
	    	}
	    }

		current_locs = [];
		for (var i=0; i<bodies.length; i++)
		{
			current_locs.push({ix:bodies[i].GetUserData().ix,
				color:bodies[i].GetUserData().col, shape:bodies[i].GetUserData().shape,
				x:bodies[i].GetPosition().x, y:bodies[i].GetPosition().y,
				a:bodies[i].GetAngle()});
		}
		parent.document.getElementById("conditiondetails").value = 'Current locations:\n' +
		JSON.stringify(current_locs) + 
		'\n\nStarting locations:\n' +
		 JSON.stringify(starting_locs) + '\n\n\nEnding locations:\n' + 
		JSON.stringify(ending_locs);

        idco = undefined;
    }

    stage.removeEventListener(Event.ENTER_FRAME, Move);
}

function Move (e) {
    xPos = e.target.mouseX;
    yPos = e.target.mouseY;
    actors[idco].x = xPos;
    actors[idco].y = yPos;
    var loc = new b2Vec2(xPos/ratio, yPos/ratio);
    bodies[idco].SetPosition(loc);
}

function RotateOn(e){
    if(e.keyCode == 88 | e.keyCode == 39)
    {
    	//39
    	if (rotate!=1)  {console.log('pressing right');}
        rotate=1;
        angle = bodies[idco].GetAngle();
        console.log('angle',angle);
        bodies[idco].SetAngle(angle + 0.05);
        console.log('angle after', bodies[idco].GetAngle())
		actors[idco].rotation = bodies[idco].GetAngle()*180/Math.PI;
    } else if (e.keyCode == 90 | e.keyCode == 37)
    {
    	//37
		if (rotate!=-1)  {console.log('pressing left');}
        rotate=-1;
        angle = bodies[idco].GetAngle();
        console.log('angle',angle);
        bodies[idco].SetAngle(angle - 0.05)
		actors[idco].rotation = bodies[idco].GetAngle()*180/Math.PI;
    } else {
        rotate=0;
        console.log('pressing something else');
    }
}

function RotateOff(e){
  rotate=0;
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

