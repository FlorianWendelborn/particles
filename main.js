// based on http://html5hub.com/build-a-javascript-particle-system/

var canvas, ctx, canvasy, cty;
var height, width;

var particles = [], fields = [], emitters = [];

var maxParticles = 20000;
var emissionRate = 5;

function drawOnce() {
	drawField(3);
	emitters.forEach(drawCircle);
	fields.forEach(drawCircle);
}

function draw() {
	drawParticles('rgba(0,0,255,0.2)',1,1);
}

window.onload = function () {
	canvasy = document.getElementsByTagName('canvas')[0];
	cty = canvasy.getContext('2d');
	canvas = document.getElementsByTagName('canvas')[1];
	ctx = canvas.getContext('2d');
	
	height = window.innerHeight;
	width = window.innerWidth;
	
	canvas.height = height;
	canvas.width = width;
	
	canvasy.height = height;
	canvasy.width = width;
	
	particles = [
		
	];
	// emitters = [
	// 	new Emitter(new Vector(200,0),new Vector.fromAngle(Math.PI,1),Math.PI/32,10)
	// ];
	// fields = [
	// 	new Field(new Vector(0,0),10, true)
	// ];
	for (var i = 0; i < Math.random()*2+1; i++) {
		emitters.push(new Emitter(new Vector(width*Math.random()-width/2,height*Math.random()-height/2),new Vector.fromAngle(Math.PI,Math.random()*10),Math.PI*2,Math.random()*20+5));
	}
	for (var i = 0; i < Math.random()*10+5; i++) {
		fields.push(new Field(new Vector(width*Math.random()-width/2,height*Math.random()-height/2),Math.random()*20-10,Math.random()<0.1));
	}
	
	drawOnce();
	loop();
}
window.onresize = function () {
	height = window.innerHeight;
	width = window.innerWidth;
	canvas.height = height;
	canvas.width = width;
	
	canvasy.height = height;
	canvasy.width = width;
	drawOnce();
}

function Vector (x, y) {
	this.x = x || 0;
	this.y = y || 0;
}
Vector.fromAngle = function (angle, magnitude) {
	return new Vector(magnitude * Math.cos(angle), magnitude * Math.sin(angle));
};
Vector.prototype.add = function (vector) {
	this.x += vector.x;
	this.y += vector.y;
}
Vector.prototype.getMagnitude = function () {
	return Math.sqrt(this.x * this.x + this.y * this.y);
}
Vector.prototype.getAngle = function () {
	return Math.atan2(this.x,this.y);
}

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

function Particle (point, velocity, acceleration, mass) {
	this.position = point || new Vector(0,0);
	this.velocity = velocity || new Vector(0,0);
	this.acceleration = acceleration || new Vector(0,0);
	this.mass = (mass===undefined)?1:mass;
	this.move = function () {
		this.velocity.add(this.acceleration);
		this.position.add(this.velocity);
	}
}
Particle.prototype.submitToFields = function (fields) {
	// our starting acceleration this frame
	var totalAccelerationX = 0;
	var totalAccelerationY = 0;

	// for each passed field
	for (var i = 0; i < fields.length; i++) {
		var field = fields[i];

		var vectorX = field.position.x - this.position.x;
		var vectorY = field.position.y - this.position.y;

		if (field.strange && Math.sqrt(vectorX*vectorX+vectorY*vectorY) < this.mass*this.mass) {
			var force = -(field.mass*this.mass) / (vectorX*vectorX+vectorY*vectorY);
		} else {
			var force = (field.mass*this.mass) / (vectorX*vectorX+vectorY*vectorY);
		}

		totalAccelerationX += vectorX * force;
		totalAccelerationY += vectorY * force;
	}

	// update our particle's acceleration
	this.acceleration = new Vector(totalAccelerationX, totalAccelerationY);
};

function Emitter (point, velocity, spread, massSpread) {
	this.position = point || new Vector(0,0);
	this.velocity = velocity || new Vector(0,0);
	this.spread = spread || Math.PI / 32;
	this.drawColor = 'blue';
	this.massSpread = (massSpread===undefined)?1:massSpread;
	this.emitParticle = function () {
		var angle = this.velocity.getAngle() + this.spread - (Math.random()*this.spread*2);
		var magnitude = this.velocity.getMagnitude();
		var position = new Vector(this.position.x,this.position.y);
		var velocity = Vector.fromAngle(angle,magnitude);
		var mass = this.massSpread*Math.random();
		return new Particle(position, velocity, new Vector(0,0), mass);
	}
}

function Field(point, mass, strange) {
	console.log(point, mass, strange);
	this.position = point || new Vector(0,0);
	this.strange = strange || false;
	this.setMass(mass);
}
Field.prototype.setMass = function (mass) {
	this.mass = mass || 100;
	this.drawColor = (this.strange)?'purple':(mass < 0)?'#f00':'#0f0';
}

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

function drawCircle(object) {
	var size = Math.abs(object.mass) || Math.abs(object.massSpread) || objectSize;
	cty.fillStyle = object.drawColor;
	cty.beginPath();
	cty.arc(width/2 + object.position.x, height/2 + object.position.y, size, 0, Math.PI * 2);
	cty.closePath();
	cty.fill();
	cty.stroke();
}

function drawParticles (color, basicSize, factor) {
	ctx.fillStyle = color;
	for (var i = 0; i < particles.length; i++) {
		//ctx.fillStyle = 'hsl('+particles[i].mass*18+',100%,50%)';
		var position = particles[i].position;
		var size = (basicSize)+particles[i].mass*(factor);

		ctx.fillRect(width/2 + position.x-size/2, height/2 + position.y-size/2, size, size);
	}
}
function drawField (resolution) {
	for (var x = -width/resolution/2; x < width/resolution/2; x++) {
		for (var y = -width/resolution/2; y < height/resolution/2; y++) {
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