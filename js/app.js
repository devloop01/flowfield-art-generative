console.clear();

const GUI = new dat.GUI();

let settings = {
	types: {
		full: true,
		circle: false,
		heart: false,
	},
	colorConfig: {
		whiteOnBlack: true,
		blackOnWhite: false,
	},
	totalNumberOfParticles: 360,
	scale: 40,
	radius: {
		initial: 80,
		min: 20,
		max: 100,
	},
	stroke_color_default: true,
	colorize_stroke: false,
	randomize_stroke_color: false,
	strokeColor: {
		r: 255,
		g: 0,
		b: 0,
	},
	noFill: false,
	randomRadius: false,
	redraw: () => {
		resetAndInit();
	},
	save: () => {
		saveCanvas(canvas);
	},
};

let colorConfig = {
	background: "rgb(0,0,0)",
	stroke: 255,
	fill: "rgb(0,0,0)",
};

let cols,
	scale,
	rows,
	particles = [],
	flowFields;

let canvas;

function setup() {
	canvas = createCanvas(innerWidth, innerHeight);
	resetAndInit();
}

function init() {
	scale = settings.scale;
	cols = floor(width / scale) + 2;
	rows = floor(height / scale) + 2;
	flowFields = new Array(cols * rows);

	for (let i = 0; i < settings.totalNumberOfParticles; i++) {
		let x, y, radius;
		if (settings.types.full) {
			x = random(width);
			y = random(height);
		} else if (settings.types.circle) {
			x = Math.cos(i) * 100 + width / 2;
			y = Math.sin(i) * 100 + height / 2;
		} else if (settings.types.heart) {
			let r = 15;
			x = r * 16 * pow(sin(i), 3) + width / 2;
			y = -r * (13 * cos(i) - 5 * cos(2 * i) - 2 * cos(3 * i) - cos(4 * i)) + height / 2;
		}
		if (settings.randomRadius) {
			radius = randomIntegerFromRange(settings.radius.min, settings.radius.max);
		} else {
			radius = settings.radius.initial;
		}
		particles.push(new Particle(x, y, radius));
	}
}

let increment = 0.1,
	start = 0,
	zoffset = 0,
	framecount = 0;

function draw() {
	let xoffset = start;
	for (let x = 0; x < cols; x++) {
		let yoffset = start;
		for (let y = 0; y < rows; y++) {
			let index = x + y * cols;
			let angle = noise(xoffset, yoffset, zoffset) * TWO_PI * 2;
			let vector = p5.Vector.fromAngle(angle);
			flowFields[index] = vector;
			vector.setMag(1);
			yoffset += increment;
		}
		xoffset += increment;
		zoffset += 0.001;
	}
	particles.forEach((particle, index) => {
		particle.update();
		particle.follow(flowFields);
		if (!particle.radius <= 0) {
			let strokeVal = {
				r: null,
				g: null,
				b: null,
				a: map(abs(framecount * 4), 0, 255, 0, 100),
			};
			let fillVal = settings.noFill == true ? null : colorConfig.fill;
			if (settings.stroke_color_default) {
				strokeVal.r = colorConfig.stroke;
				strokeVal.g = colorConfig.stroke;
				strokeVal.b = colorConfig.stroke;
			}
			if (settings.colorize_stroke) {
				strokeVal.r = settings.strokeColor.r;
				strokeVal.g = settings.strokeColor.g;
				strokeVal.b = settings.strokeColor.b;
			}
			if (settings.randomize_stroke_color) {
				let rd = PI * noise(index);
				strokeVal.r = particle.position.x * cos(rd);
				strokeVal.g = particle.position.y * sin(rd);
				strokeVal.b = sin(cos(strokeVal.r * strokeVal.g));
			}

			particle.draw(strokeVal, fillVal);
		}
	});

	framecount++;
}

function windowResized() {
	resizeCanvas(innerWidth, innerHeight);
	resetAndInit();
}

function resetCanvas() {
	background(`${colorConfig.background}`);
	framecount = 0;
	particles = [];
}

function resetAndInit() {
	resetCanvas();
	init();
}

function checkColorConfig() {
	if (settings.colorConfig.whiteOnBlack) {
		colorConfig.background = "rgb(0,0,0)";
		colorConfig.fill = "rgb(0,0,0)";
		colorConfig.stroke = 255;
	} else if (settings.colorConfig.blackOnWhite) {
		colorConfig.background = "rgb(255,255,255)";
		colorConfig.fill = "rgb(255,255,255)";
		colorConfig.stroke = 0;
	}
	background(`${colorConfig.background}`);
}

// All dat.GUI Code ----------
let typesFolder = GUI.addFolder("Types");
addCheckbox(typesFolder, settings.types, "full", "Full");
addCheckbox(typesFolder, settings.types, "circle", "circle");
addCheckbox(typesFolder, settings.types, "heart", "Heart");

let colorFolder = GUI.addFolder("Color Config");
addCheckbox(colorFolder, settings.colorConfig, "whiteOnBlack", "White On Black");
addCheckbox(colorFolder, settings.colorConfig, "blackOnWhite", "Black On White");

GUI.add(settings, "totalNumberOfParticles", 10, 360 * 2)
	.name("Particles")
	.onChange(resetAndInit);

GUI.add(settings, "scale", 10, 50)
	.name("Scale")
	.onChange(resetAndInit);

GUI.add(settings.radius, "initial", settings.radius.min, settings.radius.max)
	.step(10)
	.name("Radius")
	.onChange(resetAndInit);

let strokeColorFolder = GUI.addFolder("Stroke Color");
addController(strokeColorFolder, settings.strokeColor, "r", 0, 255, "Red");
addController(strokeColorFolder, settings.strokeColor, "g", 0, 255, "Green");
addController(strokeColorFolder, settings.strokeColor, "b", 0, 255, "Blue");
let limitedPropsList = ["stroke_color_default", "colorize_stroke", "randomize_stroke_color"];
addCheckbox(strokeColorFolder, settings, "stroke_color_default", "Default", limitedPropsList);
addCheckbox(strokeColorFolder, settings, "colorize_stroke", "Color Stroke", limitedPropsList);
addCheckbox(strokeColorFolder, settings, "randomize_stroke_color", "Randomize", limitedPropsList);

GUI.add(settings, "noFill")
	.name("No Fill")
	.onChange(resetAndInit);

GUI.add(settings, "randomRadius")
	.name("Random Radius")
	.onChange(resetAndInit);

GUI.add(settings, "redraw").name("RE-DRAW");
GUI.add(settings, "save").name("SAVE");

function addCheckbox(container, object, prop, name = prop, limitedProps) {
	container
		.add(object, prop)
		.name(name)
		.listen()
		.onChange(function() {
			if (limitedProps) {
				setChecked(object, prop, limitedProps);
			} else {
				setChecked(object, prop);
			}
			resetAndInit();
			checkColorConfig();
		});
}

function addController(container, object, prop, min, max, name = prop) {
	container
		.add(object, prop, min, max)
		.name(name)
		.onChange(resetAndInit);
}

// UTILS ----------

function setChecked(object, prop, limitedProps) {
	if (limitedProps) {
		limitedProps.forEach(p => {
			if (p == prop) {
				object[p] = true;
			} else {
				object[p] = false;
			}
		});
	} else {
		for (let p in object) {
			if (typeof p != Function || typeof p != Number) {
				object[p] = false;
			}
		}
		object[prop] = true;
	}
}

function saveCanvas(canvas) {
	saveCanvas(canvas, "flowfield_art", "jpg");
}

function randomIntegerFromRange(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}
