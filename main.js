// based on http://html5hub.com/build-a-javascript-particle-system/

/*---------- variables ----------*/

var canvas, ctx, canvasy, cty;
var height, width;

var particles = [], fields = [], emitters = [];

/*---------- settings ----------*/

var maxParticles = 20000;
var emissionRate = 5;

/*---------- events ----------*/

window.onload = function () {
	canvasy = document.getElementsByTagName('canvas')[0];
	cty = canvasy.getContext('2d');
	canvas = document.getElementsByTagName('canvas')[1];
	ctx = canvas.getContext('2d');

	updateResolution(false);

	for (var i = 0; i < Math.random()*2+1; i++) {
		emitters.push(new Emitter(new Vector(width*Math.random()-width/2,height*Math.random()-height/2),new Vector.fromAngle(Math.PI,Math.random()*10),Math.PI*2,Math.random()*20+5));
	}
	for (var i = 0; i < Math.random()*10+5; i++) {
		fields.push(new Field(new Vector(width*Math.random()-width/2,height*Math.random()-height/2),Math.random()*20-10,Math.random()<0.1));
	}
	
	drawOnce();
	loop();
}

window.onresize = updateResolution;

function updateResolution (noEvent) {
	height = window.innerHeight;
	width = window.innerWidth;
	
	canvas.height = height;
	canvas.width = width;
	
	canvasy.height = height;
	canvasy.width = width;

	noEvent && drawOnce();
}

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
	drawParticles({color:'rgba(0,0,255,0.2)',basicSize:1,massMultiplier:1});
}

function drawOnce() {
	drawField(3);
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

function drawField (resolution) {
	for (var x = -Math.floor(width/resolution/2); x < Math.floor(width/resolution/2); x++) {
		for (var y = -Math.floor(width/resolution/2); y < Math.floor(height/resolution/2); y++) {
			var g = 0;
			
			for (var i = 0; i < fields.length; i++) {
				var field = fields[i];
				var distance = Math.sqrt(Math.pow(field.position.x - x*resolution,2)+Math.pow(field.position.y - y*resolution,2));
				g += (field.mass*500000)/(distance*distance);
			}

			cty.fillStyle = 'rgb('+Math.floor(128-g)+','+Math.floor(128+g)+',0)';
			cty.fillRect(Math.floor(x*resolution+(width/2)),Math.floor(y*resolution+(height/2)),resolution,resolution);
		}
	}
}