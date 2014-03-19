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