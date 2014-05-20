/*---------- variables ----------*/

var canvas, ctx, canvasy, cty;
var height, width;

var particles = [], fields = [], emitters = [];

/*---------- settings ----------*/

var maxParticles = 20000;
var emissionRate = 5;
var particleStyle = {
	color:'rgba(0,0,255,0.2)',
	basicSize:1,
	massMultiplier:1
};
var fieldStyle = {
	mode: 1,
	power: 1,
	resolution: 2,
	mass: 10,
	color: 'rgba(0,255,0,1)'
}

/*---------- events ----------*/

window.onload = function () {
	canvasy = document.getElementsByTagName('canvas')[0];
	cty = canvasy.getContext('2d');
	canvas = document.getElementsByTagName('canvas')[1];
	ctx = canvas.getContext('2d');

	updateResolution(false);

	generate();

	loop();
}

window.onresize = updateResolution;

window.onkeydown = function (e) {
	switch (e.keyCode) {
		case 71:generate();break;//g
		case 67:particles=[];break;//c
		case 72:particleStyle.color='highlight';break;//h
		case 78:particleStyle.color='rgba(0,0,255,0.2)';break;//n
		case 107:emissionRate++;break;//+
		case 109:emissionRate--;break;//-
		case 77:particleStyle.massMultiplier=particleStyle.massMultiplier?0:1;break;//m
		case 83:particleStyle.basicSize=particleStyle.basicSize==1?5:1;break;//s
		case 66:empty();break;//b
		case 70:fieldStyle.resolution=fieldStyle.resolution==1?2:1;fieldStyle.color=fieldStyle.resolution==1?"rgba(0,255,0,0.2)":"rgba(0,255,0,1)";drawOnce();break;//f
		default: console.log(e.keyCode);
	}
}

function updateResolution (noEvent) {
	height = window.innerHeight;
	width = window.innerWidth;
	
	canvas.height = height;
	canvas.width = width;
	
	canvasy.height = height;
	canvasy.width = width;

	noEvent && drawOnce();
}

window.onmousedown = add;

/*----------technical functions----------*/

function loop() {
	clear();
	update();
	draw();
	queue();
}
 
function clear() {
	ctx.clearRect(0, 0, width, height);
}
 
function update () {
	addNewParticles();
	plotParticles();
}

function queue() {
	window.requestAnimationFrame(loop);
}

function draw() {
	drawParticles(particleStyle);
}

function drawOnce(onlyDots) {
	if (!onlyDots) {
		drawField(fieldStyle);	
	}
	emitters.forEach(drawCircle);
	fields.forEach(drawCircle);
}

/*---------- particles ----------*/

function addNewParticles () {
	if (particles.length > maxParticles) return;

	for (var i = 0; i < emitters.length; i++) {
		for (var j = 0; j < emissionRate; j++) {
			particles.push(emitters[i].emitParticle());
		}
	}
}

function plotParticles () {
	var currentParticles = [];

	for (var i = 0; i < particles.length; i++) {
		var particle = particles[i];
		var pos = particle.position;

		if (pos.x < -width/2 || pos.x > width/2 || pos.y < -height/2 || pos.y > height/2) continue;

		particle.submitToFields(fields);

		particle.move();
		currentParticles.push(particle);
	}
	particles = currentParticles;
}

/*---------- draw ----------*/

function drawCircle(object) {
	var size = Math.abs(object.mass) || Math.abs(object.massSpread) || objectSize;
	cty.fillStyle = object.drawColor;
	cty.beginPath();
	cty.arc(width/2 + object.position.x, height/2 + object.position.y, size, 0, Math.PI * 2);
	cty.closePath();
	cty.fill();
	cty.stroke();
}

function drawParticles (options) {
	ctx.fillStyle = options.color;
	for (var i = 0; i < particles.length; i++) {
		if (options.color == 'highlight') {
			ctx.fillStyle = 'hsl('+particles[i].mass*18+',100%,50%)';	
		}

		var position = particles[i].position;
		var size = (options.basicSize)+particles[i].mass*(options.massMultiplier);

		ctx.fillRect(width/2 + position.x-size/2, height/2 + position.y-size/2, size, size);
	}
}

function drawField (options) {
	cty.clearRect(0,0,width,height);
	
	cty.beginPath();

	switch (options.mode) {
		case 0:
			var data = [];
			
			// calculate and draw vertical lines
			for (var x = 0; x < width/options.resolution; x++) {
				for (var y = 0; y < height/options.resolution; y++) {
					if (!x) data[y] = [];
					
					var totalAccelerationX = 0
					  , totalAccelerationY = 0;

					for (var i = 0; i < fields.length; i++) {
						var field = fields[i];

						var vectorX = field.position.x - x*options.resolution+width/2;
						var vectorY = field.position.y - y*options.resolution+height/2;

						if (field.strange && Math.sqrt(vectorX*vectorX+vectorY*vectorY) < options.mass*options.mass) {
							var force = -(Math.pow(field.mass,options.power)*options.mass) / (vectorX*vectorX+vectorY*vectorY);
						} else {
							var force = (Math.pow(field.mass,options.power)*options.mass) / (vectorX*vectorX+vectorY*vectorY);
						}

						totalAccelerationX += vectorX * force;
						totalAccelerationY += vectorY * force;
					}

					data[y][x] = {
						x: totalAccelerationX,
						y: totalAccelerationY
					};
					
					if (!y) {
						cty.moveTo(x*options.resolution-totalAccelerationX, y*options.resolution-totalAccelerationY)
					} else {
						cty.lineTo(x*options.resolution-totalAccelerationX, y*options.resolution-totalAccelerationY)
					}
				}
			}

			// draw horizontal lines
			for (var y = 0; y < data.length; y++) {
				for (var x = 0; x < data[y].length; x++) {
					if (!x) {
						cty.moveTo(-data[y][x].x, y*options.resolution);
					} else {
						cty.lineTo(x*options.resolution-data[y][x].x, y*options.resolution-data[y][x].y);
					}
				}
			}
		break;
		case 1:
			var data = [];

			// calculate vertices
			for (var x = 0; x < width/options.resolution; x++) {
				for (var y = 0; y < height/options.resolution; y++) {
					if (!x) data[y] = [];
					
					var totalAccelerationX = 0
					  , totalAccelerationY = 0;

					for (var i = 0; i < fields.length; i++) {
						var field = fields[i];

						var vectorX = field.position.x - x*options.resolution+width/2;
						var vectorY = field.position.y - y*options.resolution+height/2;

						if (field.strange && Math.sqrt(vectorX*vectorX+vectorY*vectorY) < options.mass*options.mass) {
							var force = -(Math.pow(field.mass,options.power)*options.mass) / (vectorX*vectorX+vectorY*vectorY);
						} else {
							var force = (Math.pow(field.mass,options.power)*options.mass) / (vectorX*vectorX+vectorY*vectorY);
						}

						totalAccelerationX += vectorX * force;
						totalAccelerationY += vectorY * force;
					}

					data[y][x] = {
						x: totalAccelerationX,
						y: totalAccelerationY
					};
					
					cty.moveTo(x*options.resolution, y*options.resolution);
					cty.lineTo(x*options.resolution-data[y][x].x,y*options.resolution-data[y][x].y);
				}
			}
		break;
		case 2:
			for (var ij = 0; ij < fields.length; ij++) {
				var x = fields[ij].position.x+5;
				var y = fields[ij].position.y+5;
				cty.moveTo(x, y);
				for (var j = 0; j < 200000; j++) {
					var totalAccelerationX = 0
					  , totalAccelerationY = 0;

					var g = 0;

					for (var i = 0; i < fields.length; i++) {
						var field = fields[i];

						var vectorX = field.position.x - x;
						var vectorY = field.position.y - y;

						if (field.strange && Math.sqrt(vectorX*vectorX+vectorY*vectorY) < options.mass*options.mass) {
							var force = -(Math.pow(field.mass,options.power)*options.mass) / (vectorX*vectorX+vectorY*vectorY);
						} else {
							var force = (Math.pow(field.mass,options.power)*options.mass) / (vectorX*vectorX+vectorY*vectorY);
						}

						totalAccelerationX += vectorX * force;
						totalAccelerationY += vectorY * force;
					}

					cty.lineTo(x, y);

					x += totalAccelerationX;
					y += totalAccelerationY;
				}
			}
		break;
		default:
			console.error("drawField: unknown mode " + options.mode);
	}

	cty.strokeStyle = options.color;
	cty.stroke();
}

/*---------- generator ----------*/

function generate () {
	emitters = [];
	fields = [];
	for (var i = 0; i < Math.random()*2+1; i++) {
		emitters.push(new Emitter(new Vector(width*Math.random()-width/2,height*Math.random()-height/2),new Vector.fromAngle(Math.PI,Math.random()*10),Math.PI*2,Math.random()*20+5));
	}
	for (var i = 0; i < Math.random()*10+5; i++) {
		fields.push(new Field(new Vector(width*Math.random()-width/2,height*Math.random()-height/2),Math.random()*20-10,Math.random()<0.1));
	}

	drawOnce();
}

function empty () {
	emitters = [];
	fields = [];
	particles = [];
	cty.clearRect(0,0,width,height);
}

function add (e) {
	var x = e.x-width/2;
	var y = e.y-height/2;
	var type = prompt("[f]ield, [e]mitter, or [p]articles?");
	switch (type) {
		case "e"://emitter
			var velocity = prompt("Velocity? [float]") || 5;
			var spread = prompt("Spread in degrees? [float]") || 360;
			var mass = prompt("Maximum particle mass? [float]") || 20;
			emitters.push(new Emitter(new Vector(x,y), new Vector.fromAngle(Math.PI,velocity), spread/180*Math.PI, mass));
			drawOnce(true);
		break;
		case "f"://field
			var mass = prompt("Mass? [float]") || 5;
			var strange = prompt("Strange? [boolean]")=="true" || false;
			fields.push(new Field(new Vector(x,y), mass, strange));
			drawOnce();
		break;
		case "p"://particle
			var amount = prompt("Amount? [integer]") || 50;
			var velocity = prompt("Velocity? [float]") || 0;
			var mass = prompt("Mass? [float]") || 5;
			for (var i = 0; i < amount; i++) {
				particles.push(new Particle(new Vector(x,y), new Vector.fromAngle(2*Math.PI*Math.random(), velocity), mass));
			}
		break;
	}
}