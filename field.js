function Field(point, mass, strange) {
	this.position = point || new Vector(0,0);
	this.strange = strange || false;
	this.setMass(mass);
}
Field.prototype.setMass = function (mass) {
	this.mass = mass || 100;
	this.drawColor = (this.strange)?'purple':(mass < 0)?'#f00':'#0f0';
}