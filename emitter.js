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