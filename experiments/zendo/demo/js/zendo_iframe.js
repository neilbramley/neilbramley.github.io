//Declaring some global variables
var world;
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

function Start() 
{
    //Create the stage
    stage = new Stage("c");

    //var pixel_ratio =  window.devicePixelRatio;

    stage.addEventListener(Event.ENTER_FRAME, onEF);
    stage.addEventListener(MouseEvent.MOUSE_DOWN, AssumeControl);
    stage.addEventListener(MouseEvent.MOUSE_UP, RenegeControl);
    stage.addEventListener(KeyboardEvent.KEY_DOWN, RotateOn);
    stage.addEventListener(KeyboardEvent.KEY_UP, RotateOff);
    stage.addEventListener(MouseEvent.RIGHT_CLICK, RemovePiece, false); 
    parent.document.getElementById('game_frame').addEventListener("mouseout", RenegeControl);

    // background
    // var bg = new Bitmap( new BitmapData("border.png") );
    // bg.scaleX = bg.scaleY = stage.stageHeight/512;
    // stage.addChild(bg);

    world = new b2World(new b2Vec2(0, 10),  true);

    world.SetContactListener(listener);

    var bxFixDef   = new b2FixtureDef();   // box  fixture definition
    bxFixDef.shape = new b2PolygonShape();
    bxFixDef.density = 1;
    bxFixDef.friction = 1.5;

    var bodyDef = new b2BodyDef();
    bodyDef.type = b2Body.b2_staticBody;

    // create ground
    bxFixDef.shape.SetAsBox(10, 1.5);//10m by 1m static box
    bodyDef.position.Set(0, stage.stageHeight/ratio);//Places it in the bottom 1m of the window
    var ground = world.CreateBody(bodyDef).CreateFixture(bxFixDef);
    
    var s = new Sprite();
    s.graphics.beginFill(0x000000, .7);
    s.graphics.drawRect(0,0, 10*ratio, 0.05*ratio);
    s.graphics.endFill();
    stage.addChild(s);
    //s.x=(stage.stageWidth)/2
    s.y=(stage.stageHeight) - 1.5 * ratio;

    ground.SetUserData({type:"ground"});

    bxFixDef.shape.SetAsBox(1, 100);//1 meter wide by 100 meter high walls
    // left wall
    bodyDef.position.Set(-1, 3);
    world.CreateBody(bodyDef).CreateFixture(bxFixDef);
    // right wall
    bodyDef.position.Set(stage.stageWidth/ratio+1, 3);
    world.CreateBody(bodyDef).CreateFixture(bxFixDef);

    // Both images are supposed to be 200 x 200 px
    //var bxBD = new BitmapData("../images/box.png");

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

                //The colours of the blocks
    cols = [0xff0000, 0x00ff00, 0x0000ff];


    var btn = new Sprite();

    //////////////
    //Add test a button
    
    btn.graphics.beginFill(0x000000, 1);
    btn.graphics.drawRoundRect(-1*half_ratio, -.5*half_ratio, 2*half_ratio, half_ratio, 6, 6);
    btn.graphics.endFill();

    btn.graphics.beginFill(0xeeeeee, 1);
    btn.graphics.drawRoundRect(-1*half_ratio+2, -.5*half_ratio + 1, 2*half_ratio-4, half_ratio-2, 3, 3);
    btn.graphics.endFill();

    var t1 = new TextField();
    t1.selectable = false; // default is true
    t1.setTextFormat(f1);
    t1.text = 'Test';
    t1.width = t1.textWidth;
    t1.height = t1.textHeight;
    //t1.obj_ix = actors.length;
    btn.addChild(t1);
    t1.x = -t1.textWidth / 2;
    t1.y = -t1.textHeight / 2;//-25;

    btn.buttonMode = true;

    stage.addChild(btn);

    btn.x = stage.stageWidth * (11/12);
    btn.y = stage.stageHeight * (13/15);

    btn.addEventListener(MouseEvent.CLICK, TestDevice);
    btn.addEventListener(MouseEvent.MOUSE_OVER, onMOv);
    btn.addEventListener(MouseEvent.MOUSE_OUT , onMOu);    ///////////////////
    //Create the pieces
    ///////////////////



    /////////////////
    //Add the piece buttons
    /////////////////
    piece_buttons = [];
    for (var i=0; i<9; i++)
    {

        //Set the colour and local coordinates
        col = cols[Math.floor(i/3)];
        points = [all_points.small, all_points.med, all_points.large][i%3];

        var s = new Sprite();

        
        //Frame
        s.graphics.beginFill(0xeeeeee, .5);
        s.graphics.drawRect(-1*half_ratio, -.3*half_ratio, 2*half_ratio, 2*half_ratio);
        s.graphics.endFill();

        s.graphics.lineStyle(1, 0x000000);
        s.graphics.moveTo(-1*half_ratio, -.3*half_ratio);
        s.graphics.lineTo(1*half_ratio, -.3*half_ratio);
        s.graphics.lineTo(1*half_ratio, 1.7*half_ratio);
        s.graphics.lineTo(-1*half_ratio, 1.7*half_ratio);
        s.graphics.lineTo(-1*half_ratio, -.3*half_ratio);

        //Right hand side
        s.graphics.beginFill(col, .5);
        s.graphics.moveTo(points.rhs[0].x*half_ratio, points.rhs[0].y*half_ratio);
        for (var j=1; j<points.rhs.length; j++)
        {s.graphics.lineTo(points.rhs[j].x*half_ratio, points.rhs[j].y*half_ratio);}
        s.graphics.endFill();

        //Left hand side
        s.graphics.beginFill(col, .5);
        s.graphics.moveTo(points.lhs[0].x*half_ratio, points.lhs[0].y*half_ratio);
        for (var j=1; j<points.rhs.length; j++)
        {s.graphics.lineTo(points.lhs[j].x*half_ratio, points.lhs[j].y*half_ratio);}
        s.graphics.endFill();

        //Surface
        s.graphics.beginFill(col, .1);
        s.graphics.moveTo(points.rhs[1].x*half_ratio, points.rhs[1].y*half_ratio);
        s.graphics.lineTo(points.rhs[2].x*half_ratio, points.rhs[2].y*half_ratio);
        s.graphics.lineTo(points.lhs[2].x*half_ratio, points.lhs[2].y*half_ratio);
        s.graphics.lineTo(points.lhs[1].x*half_ratio, points.lhs[1].y*half_ratio);
        s.graphics.endFill();
        s.button_ix = i;
        
        //Place the button
        s.x = 0.4*ratio + 0.75*ratio * i;
        s.y = 5.8*ratio;

        s.rotation = 180; //Flips it the right way up

        s.buttonMode = true;



        stage.addChild(s);
        //WHY WON'T YOU REGISTER A CLICK/ SEEMS TO BE COVERD BY STAGE
        ////May be related to the weird width thing (make the canvas a particular width)
        s.addEventListener(MouseEvent.CLICK, AddPiece);

        piece_buttons.push(s);
    }

}

function AddPiece(e)
{
    console.log('clickedonpiece', e.target.button_ix);
    //Piece type is a number between 1 and 9 corresponding to the button below
    if (e.target.button_ix!=undefined)
    {
        piece_type = e.target.button_ix;

        console.log('piece_type', piece_type, 'col',Math.floor(piece_type/3), 'size', piece_type%3);

        col = cols[Math.floor(piece_type/3)];
        raw_points = [all_points.small, all_points.med, all_points.large][piece_type%3];

        var points = {rhs:[], lhs:[]};

        for (var j = 0; j < raw_points.rhs.length; j++) {

            var vec = new b2Vec2();
            vec.Set(raw_points.rhs[j].x, raw_points.rhs[j].y);
            points.rhs[j] = vec;

            var vec2 = new b2Vec2();
            vec2.Set(raw_points.lhs[raw_points.lhs.length-j-1].x, raw_points.lhs[raw_points.lhs.length-j-1].y);
            points.lhs[j] = vec2;
        }
        
        var bodyDef = new b2BodyDef();
        bodyDef.type = b2Body.b2_dynamicBody;

        var rhsFixDef   = new b2FixtureDef();   // box  fixture definition
        rhsFixDef.shape = new b2PolygonShape();
        rhsFixDef.density = 1;
        rhsFixDef.restitution = 0.1; 
        rhsFixDef.shape.SetAsArray(points.rhs, points.rhs.length);


        var lhsFixDef   = new b2FixtureDef();   // box  fixture definition
        lhsFixDef.shape = new b2PolygonShape();
        lhsFixDef.density = 1;
        rhsFixDef.restitution = 0.1; 
        lhsFixDef.shape.SetAsArray(points.lhs, points.lhs.length);



        bodyDef.position.Set(Math.random()*7, -5 + Math.random()*5);

        //////////////////
        //The Box2d object
        //////////////////
           
        var body = world.CreateBody(bodyDef);

        body.CreateFixture(rhsFixDef);    //rhs
        body.CreateFixture(lhsFixDef);    //lhs

        //console.log('masses', ComputeMass(body));

        bodies.push(body);

        body.SetAngle(Math.PI + Math.random()*0.1 - 0.05);

        //body.SetLinearDamping(1);
        body.SetAngularDamping(.1);
        body.SetUserData({type:"piece", size:['small','medium','large'][piece_type%3],
        color:['red','green','blue'][Math.floor(piece_type/3)],
        id:(bodies.length-1)});

        /////////////////////////
        //The visualization of them
        /////////////////////////
        var actor = new Sprite();

           
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

        actor.obj_ix = actors.length;//TODO THINK MORE CAREFULLY ABOUT INDEXING

        //actor.addEventListener(MouseEvent.MOUSE_MOVE, Jump);  
        stage.addChild(actor);
        actors.push(actor);
		
		removed.push(false);

        console.log('added:', piece_type);
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
        actor.x = p.x * ratio;   // updating actor
        actor.y = p.y * ratio;
        actor.rotation = body.GetAngle()*180/Math.PI;
    }

    if (idco != undefined) {

        var body = bodies[idco]; //Select the fist or controlled puck

        var tmp = body.GetLinearVelocity();
        //var fistSpeed = Math.sqrt(Math.pow(tmp.x, 2), Math.pow(tmp.y, 2))

        var xCO = body.GetPosition().x; //Position of controlled object
        var yCO = body.GetPosition().y; //Position of controlled object

        //This is pretty heuristic force increases rapidly for farther distances from cursor
        //but is also damped by the current velocity to prevent it getting too crazy
        var xVec = .2*Math.pow((xPos / ratio - xCO), 1); //fistSpeed; 
        var yVec = .2*Math.pow((yPos / ratio - yCO), 1); //fistSpeed;
        //console.log('trying to control', idco, xVec, yVec, xPos, yPos, ratio, xCO, yCO);
        var arm_force = new b2Vec2(xVec, yVec);

        var centre = body.GetWorldCenter();
       

        body.ApplyImpulse(arm_force, centre);

        if (rotate!=0)
        {
          body.ApplyTorque(rotate * body.GetMass());//Apply a spin when key is pressed (proportional to mass of object)
        } else {
        	//body.ApplyTorque(-0.1 * body.GetAngularVelocity());
        }

        if (body.GetAngularVelocity()>8)
        {
          
          body.SetAngularVelocity(8);

        } else if ( body.GetAngularVelocity() < (-8))
        {
          body.SetAngularVelocity(-8);
        }

        //console.log('angular velocity', body.GetAngularVelocity());
    }
}
  
function RemovePiece(e)
{
	console.log('remove piece triggered');
	var ix = e.target.obj_ix;
    if (ix != undefined) {
		stage.removeChild(actors[ix]);
		world.DestroyBody(bodies[ix]);
		removed[ix] = true;
		// actors[ix] = null;
		// bodies[ix] = null;
    } else {
        console.log('missed removal!', e.target);
    }
}

function AssumeControl(e) {

    //Reset damping parameter of previously controlled object if necessary
    if (e.target.obj_ix != undefined) {

        idco = e.target.obj_ix;
        console.log('took control of', idco, bodies[idco].m_userData); //, e.target
        bodies[idco].m_linearDamping = CO_damping;

        //We want high angular damping for the conrtolled object so it doesn't spin too much
        bodies[idco].SetAngularDamping(2);

    } else {
        console.log('missed!', e.target);
    }
}

//Reset damping parameter of previously controlled object if necessary
function RenegeControl(e) {
    if (idco != undefined) {
        bodies[idco].m_linearDamping = damping;
        bodies[idco].SetAngularDamping(.1);
        console.log('reneging!', idco);
        idco = undefined;
    }
}

function RotateOn(e){
    if(e.keyCode == 88 | e.keyCode == 39)
    {
    	//39
    	if (rotate!=1)  {console.log('pressing right');}
        rotate=1;


    } else if (e.keyCode == 90 | e.keyCode == 37)
    {
    	//37
		if (rotate!=-1)  {console.log('pressing left');}
        rotate=-1;
        
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

}

function onMOv(e){
    e.target.alpha = 1.0;
    //TODO FIX THE HIGHLIGHTING\
}

function onMOu(e){ e.target.alpha = 0.7; }

function TestDevice(e){

	var atRestCheck = true;
	for (i=0; i<bodies.length; i++)
   	{
   		if (bodies[i].IsAwake()===true & removed[i]===false)
   		{
   			atRestCheck=false;
   		}
   	}

    if (atRestCheck==true)
    {
    	stage.removeEventListener(Event.ENTER_FRAME, onEF);

	    console.log('performing a test!');

	    //dataURL = c.toDataURL("image/png");
	    //console.log('dataURL',dataURL); NOW WHAT

	    var positions = [];
	   	var rotations = [];
	    var ids = [];
	    var contact = [];
	    var colors = [];
	    var sizes = [];
	   	
	   	for (i=0; i<bodies.length; i++)
	   	{
	   		if (removed[i]===false)
	   		{
	   			body = bodies[i];
	   			positions.push(body.GetPosition());
	   			rotations.push(body.GetAngle());
	   			ids.push(body.GetUserData().id);
	   			colors.push(body.GetUserData().color);
	   			sizes.push(body.GetUserData().size);
	   			contact.push([]);
	   			tmp = body.GetContactList();
				for (var c = body.GetContactList(); c!=null; c = c.next)
				{
					console.log('c inside',c, c.other.GetUserData(), c.contact.IsTouching());
					if (c.other.GetUserData()!=null & c.contact.IsTouching()==true)
					{
						contact[i].push(c.other.GetUserData());
					}
				}
				stage.removeChild(actors[i]);
				world.DestroyBody(bodies[i]);
	   		}

	   	}

	   	console.log('positions', positions, 'rotations', rotations, 'ids', ids, 'contact', contact);


	   	trialdata.push({positions:positions, rotations:rotations, ids:ids, colors:colors,
	   		sizes:sizes, contact:contact});
	   	

	   	var buddah_nature = CurrentRule(trialdata[trialdata.length-1]);
	   	actors = [];
	   	bodies = [];

	   	DrawHistory(trialdata);

	   	//Do some stuff here
	    stage.addEventListener(Event.ENTER_FRAME, onEF);
    } else {
    	console.log("cant test, objects not at rest");
    }
    

};

function DrawHistory(td, bn)
{
	trial_pics = [];
	
	//Loop over trials
	for (t=0; t<td.length; t++)
	{
		bn = CurrentRule(td[t]);

		var trial_pic = new Sprite();
        trial_pics.push(trial_pic);

		//Frame
		trial_pics[t].graphics.lineStyle(3, 0x777777);
        trial_pics[t].graphics.moveTo(0, 0);
        trial_pics[t].graphics.lineTo(stage.stageWidth, 0);
        trial_pics[t].graphics.lineTo(stage.stageWidth, stage.stageHeight);
        trial_pics[t].graphics.lineTo(0, stage.stageHeight);
        trial_pics[t].graphics.endFill();
		
		//Floor
		trial_pics[t].graphics.lineStyle(3, 0x222222);
		trial_pics[t].graphics.moveTo(0, (stage.stageHeight) - 1.5 * ratio);
		trial_pics[t].graphics.lineTo(stage.stageWidth, (stage.stageHeight) - 1.5 * ratio);
		trial_pics[t].graphics.endFill();


		var objects = [];
		//Loop over objects
		for (i = 0; i<td[t].positions.length; i++)
		{

			if (td[t].colors[i]=='red') {col=cols[0];}
			else if (td[t].colors[i]=='green') {col=cols[1];}
			else if (td[t].colors[i]=='blue') {col=cols[2];}

			if (td[t].sizes[i]=='small') {raw_points=all_points.small;}
			else if (td[t].sizes[i]=='medium') {raw_points=all_points.med;}
			else if (td[t].sizes[i]=='large') {raw_points=all_points.large;}

			console.log('raw_points', raw_points, 'col',col);
			

			objects.push(new Sprite());

			//Right hand side
	        objects[i].graphics.beginFill(col, .5);
	        // obj.graphics.drawRect(-hw*ratio,-hh*ratio,2*hw*ratio,2*hh*ratio);
	        objects[i].graphics.moveTo(raw_points.rhs[0].x*ratio, raw_points.rhs[0].y*ratio);
	        for (var j=1; j<raw_points.rhs.length; j++)
	        {
	            objects[i].graphics.lineTo(raw_points.rhs[j].x*ratio, raw_points.rhs[j].y*ratio);
	        }
	        objects[i].graphics.endFill();

	        //Left hand side
	        objects[i].graphics.beginFill(col, .5);

	        objects[i].graphics.moveTo(raw_points.lhs[0].x*ratio, raw_points.lhs[0].y*ratio);
	        for (var j=1; j<raw_points.rhs.length; j++)
	        {
	            objects[i].graphics.lineTo(raw_points.lhs[j].x*ratio, raw_points.lhs[j].y*ratio);
	        }
	        objects[i].graphics.endFill();

	        //Surface
	        objects[i].graphics.beginFill(col, .1);

	        objects[i].graphics.moveTo(raw_points.rhs[1].x*ratio, raw_points.rhs[1].y*ratio);

	        objects[i].graphics.lineTo(raw_points.rhs[2].x*ratio, raw_points.rhs[2].y*ratio);
	        objects[i].graphics.lineTo(raw_points.lhs[2].x*ratio, raw_points.lhs[2].y*ratio);
	        objects[i].graphics.lineTo(raw_points.lhs[1].x*ratio, raw_points.lhs[1].y*ratio);

	        objects[i].graphics.endFill();
	        trial_pics[t].addChild(objects[i]);

	        objects[i].x = ratio*td[t].positions[i].x;
	        objects[i].y = ratio*td[t].positions[i].y;
	        objects[i].rotation = td[t].rotations[i]*180/Math.PI;

		}

		objects.push(new Sprite());
		if (bn===true)
		{

			objects[objects.length-1].graphics.beginFill(0x55ffff);
		} else if (bn===false)
		{
			objects[objects.length-1].graphics.beginFill(0xff55ff);
		}
		objects[objects.length-1].graphics.drawCircle(0,0,100);
		objects[objects.length-1].graphics.endFill();
		trial_pics[t].addChild(objects[objects.length-1]);
		objects[objects.length-1].x=50;
		objects[objects.length-1].y=50;

		        //actor.addEventListener(MouseEvent.MOUSE_MOVE, Jump);  

        stage.addChild(trial_pics[t]);
        trial_pics[t].width = stage.stageWidth/5;
        trial_pics[t].height = stage.stageHeight/5;
        trial_pics[t].x=t*(stage.stageWidth/5);

	}      
        
}

function CurrentRule(td)
{
	console.log('td',td);

	//Temporary rule There must be exactly 2 blues
	count = 0;
	for (i=0; i<td.colors.length; i++)
	{
		if (td.colors[i]==='blue')
		{
			count++;
		}
	}

	if (count===2)
	{
		return true;
	} else {
		return false;
	}
}

  // tmp.push(data.timeline.length + 1); //Store latest frame
  // tmp.push(data.events.length + 1); //Store event number
  // var d = new Date();
  // tmp.push(d.getTime());

  // tmp.push(tmp2[0]);
  // tmp.push(tmp2[1]);

  // for (var i = 0; i < actors.length; i++) {

  //   if (body.m_userData.bodyType == "dynamic") {
  //   tmp.push(Math.round(p.x * 1000) / 1000);
  //   tmp.push(Math.round(p.y * 1000) / 1000);
  //   tmp.push(Math.round(body.m_linearVelocity.x * 1000) / 1000);
  //   tmp.push(Math.round(body.m_linearVelocity.y * 1000) / 1000);
  //   }
  // }

  //console.log('AB:',[contact.GetFixtureA().GetBody().GetUserData().name,
  //contact.GetFixtureB().GetBody().GetUserData().name].sort());

   //console.log('contact!', tmp2);

  //Patch stuff
  // var contactEntities = getSensorContact(contact);

  // if (contactEntities) {
  //   console.log('inner', contactEntities.sensor, contactEntities.sensor.GetUserData())
  //   var sensor = contactEntities.sensor;
  //   if (sensor.GetUserData()) {
  //     var userData = sensor.GetUserData();
  //     if (userData.controller) {
  //       console.log('inner inner', userData.controller)
  //       userData.controller.AddBody(contactEntities.body);

  //     }
  //   }
// }
