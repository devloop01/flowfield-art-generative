class Particle {
	constructor(x, y, radius) {
		this.position = createVector(x, y);
		this.velocity = createVector(0, 0);
		this.acceleration = createVector(0, 0);
		this.maxspeed = 3;
		this.radius = radius;
		this.radiusDecrement = 1;
	}
	draw(s, f) {
		strokeWeight(0.8);
		this.applyStroke(s);
		if (f != null) {
			fill(`${f}`);
		} else {
			noFill();
		}
		this.radius -= this.radiusDecrement;
		ellipse(this.position.x, this.position.y, this.radius);
	}
	update() {
		this.position.add(this.velocity);
		this.velocity.add(this.acceleration);
		this.acceleration.mult(0);
		this.velocity.limit(this.maxspeed);
	}
	applyForce(force) {
		this.acceleration.add(force);
	}
	follow(vectors) {
		let x = floor(this.position.x / scale);
		let y = floor(this.position.y / scale);
		let index = x + y * cols;
		let force = vectors[index];
		this.applyForce(force);
	}
	applyStroke(c) {
		stroke(c.r, c.g, c.b, c.a);
	}
}
