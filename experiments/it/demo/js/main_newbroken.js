// Javascript for demo of intervention and time

/////////////
//Definitions
/////////////


var N = 2 //How many nodes
var density = 1 //What proportion of the nodes should be connected on average if drawing connections at random.
var nodeRadius = 15; //How many pixals big should the nodes be?
var locMode = 'random'; //Or else equi = equally spaced
var arrowAngle = 15 * (Math.PI / 180);
console.log(arrowAngle);
///////////
//Functions
///////////

function Start() {

	pixel_ratio = window.devicePixelRatio;
	nodeRadius = nodeRadius * pixel_ratio;
	console.log(pixel_ratio);

	//Set up stage on the canvas
	stage = new Stage("c");
	s = new Sprite();
	stage.addChild(s);

	c.width = 600;
	c.height = 400;
	stage.canvas.width = 600;
	stage.canvas.height = 400;

	console.log('c', c, '\n s', s, '\n stage', stage, stage.canvas);
	console.log(c.width, stage.stageWidth, stage.canvas.width);

	locations = SelectLocations(N, [0, c.width], [0, c.height], locMode, nodeRadius);

	network = GenerateNetwork(N, density);

	edges = DrawNetwork(locations, network, nodeRadius, arrowAngle);

	nodes = DrawNodes(locations, nodeRadius);


}


//Select locations for the nodes
function SelectLocations(N, xrange, yrange, locMode, nodeRadius) {
	if (locMode == 'random') {
		var locations = [];
		var count = 0;

		while (count < N) {
			proposal = [Math.round(Math.random() * (xrange[1] - xrange[0]) + xrange[0]) * pixel_ratio,
				Math.round(Math.random() * (yrange[1] - yrange[0]) + yrange[0]) * pixel_ratio
			]

			var check = 0;
			for (var i = 0; i < (locations.length); i++) {
				//Non overlapping
				check = check + (Math.abs(proposal[0] - locations[i][0]) > (nodeRadius * 2) &
					Math.abs(proposal[1] - locations[i][1]) > (nodeRadius * 2)) * 1;

				//Not too near the edge

				//
			}

			console.log('check', check, 'locations.length', locations.length);

			if (check == locations.length) {
				locations.push(proposal);
				count = count + 1;
			} else {
				console.log('too close', locations, proposal);
			}
		}
	}

	return locations;
}

function GenerateNetwork(N, density) {
	var network = [];

	for (var i = 0; i < N; i++) {
		network[i] = [];

		for (var j = 0; j < N; j++) {

			if (Math.random() < density & i != j) {
				console.log(i, j)
				network[i][j] = 1;

			} else {
				network[i][j] = 0;
			}

		}
	}
	console.log('network', network);

	return network;
}

function DrawNetwork(locations, network, d, t) {
	var edges = [];
	for (var i = 0; i < locations.length; i++) {
		edges[i] = [];

		for (var j = 0; j < locations.length; j++) {
			e = new Sprite();

			if (i != j) {

				theta = Math.atan((locations[j][1] - locations[i][1]) / (locations[j][0] - locations[i][0]))

				var x0 = 0//d * Math.cos(theta);
				var y0 = 0//d * Math.sin(theta);

				var x1 = (locations[j][0] - locations[i][0])// - d * cos(theta);
				var y1 = (locations[j][1] - locations[i][1])// - d * sin(theta);
				
				var l = Math.sqrt(Math.pow(x1-x0,2) + Math.pow(y1-y0, 2));
				
				var arh = [[],[]];

				
   				arh[0][0] = x1 - [(x1-x0) * Math.cos(t) - (y1-y0) * Math.sin(t)]* (d/l)
     			arh[0][1] = y1 - [(y1-y0) * Math.cos(t) + (x1-x0) * Math.sin(t)]* (d/l)

   				arh[1][0] = x1 - [(x1-x0) * Math.cos(t) + (y1-y0) * Math.sin(t)]* (d/l)
     			arh[1][1] = y1 - [(y1-y0) * Math.cos(t) - (x1-x0) * Math.sin(t)]* (d/l)

     			console.log('i', i, 'j', j, x0,y0,x1,y1,'l',l,[x1,y1,  arh[0][0],arh[0][1],  arh[1][0],arh[1][1]]);


				e.graphics.lineStyle(3, 0x000000);

				e.graphics.moveTo(0, 0);

				e.graphics.lineTo(locations[j][0] - locations[i][0], locations[j][1] - locations[i][1]);

               //  "buffered" triangle
               e.graphics.beginFill(0x000000);
               e.graphics.drawTriangles([x1,y1,  arh[0][0],arh[0][1],  arh[1][0],arh[1][1]], [0,1,2]);
               e.graphics.endFill();


				// e.graphics.moveTo(w, h);
				// e.graphs.lineTo(s[0][0],s[0][1]);

				// e.graphics.moveTo(w, h);
				// e.graphs.lineTo(s[1][0],s[1][1]);
			}



			//Draw a triangle half a node-width from the head end
			//Create all the shapes as sprites but only make some visible (i.e. move this to draw nodes)
			edges[i][j] = e;

			if (network[i][j] == 1) {

				e.visible = true;
			} else {
				e.visible = false;
			}

			stage.addChild(e);

			e.x = locations[i][0]
			e.y = locations[i][1]

			console.log('drawing', i, j)


		}
	}
	console.log('edges', edges);
	return edges;
}


//Draws N nodes randomly on the canvas
//Stores their locations/ids somehow
function DrawNodes(locations, nodeRadius) {
	var nodes = [];
	for (var i = 0; i < locations.length; i++) {
		var color = Math.floor(Math.random() * 0xffffff);
		b = new Sprite();
		b.graphics.beginFill(color, 0.6);
		b.graphics.drawCircle(0, 0, nodeRadius); //(Math.random()*c.width, Math.random()*c.height
		b.graphics.endFill();
		stage.addChild(b);

		//console.log(b)
		b.x = locations[i][0];
		b.y = locations[i][1];

		nodes.push(b);
	}
	console.log('nodes', nodes)
	return nodes;
}



function Stop() {

}

function Pause() {

}

function Resume() {

}