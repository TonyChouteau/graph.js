/**
 * Graph library made by Tony Chouteau
 */

(function () {
	//==============================
	//	Constructor and Variables
	//==============================

	/**
	 * @constructor Graph
	 * @aka G
	 * Define Graph object.
	 */
	let Graph = function () {};

	/**
	 * @variables
	 * Defines main constants of the Graph object.
	 */
	Graph.DEFAULT = {
		SIZE: [500, 500],
		TYPES: [
			'scatter',
			/*"line",
			"area",
			"column",
			"bar",
			"pie",
			"bubble",
			"scatter",
			"stacked"*/
		],
		FONT_DECORATION: '',
		FONT_SIZE: 10,
		FONT_FAMILY: 'Arial',
		ROUND: 2,
		SCALE: [9, 5],
		BACKGROUND_COLOR: 'white',
		LEGEND_COLOR: "black",
		DRAW_AXIS: true,
	};

	//==============================
	//	Setup methods
	//==============================

	/**
	 * @method setCanvas(canvas?: HTMLElement<canvas>)
	 * Set the canvas that'll be used to draw chart, if no argument given, a canvas is created and added to the body.
	 */
	Graph.setCanvas = function (canvas) {
		if (canvas) {
			this.canvas = document.getElementById(target);
		} else {
			this.canvas = document.createElement('canvas');
			document.body.append(this.canvas);
		}
		this.ctx = this.canvas.getContext('2d');
	};

	/**
	 * @method setSize(size: [width, height])
	 * Set the size of the canvas.
	 */
	Graph.setSize = function (size) {
		if (size) {
			this.canvas.width = size[0];
			this.canvas.height = size[1];
		} else {
			this.canvas.width = this.DEFAULT.SIZE[0];
			this.canvas.height = this.DEFAULT.SIZE[1];
		}
		this.width = this.canvas.width;
		this.height = this.canvas.height;
	};

	/**
	 * @method setFont(decoration: string, size: int, family: string)
	 * Set the font to use.
	 */
	Graph.setFont = function (decoration, size, family) {
		this.fontDecoration = decoration || this.DEFAULT.FONT_DECORATION;
		this.fontSize = size || this.DEFAULT.FONT_SIZE;
		this.fontFamily = family || this.DEFAULT.FONT_FAMILY;

		this.ctx.font = this.fontDecoration + ' ' + this.fontSize + 'px ' + this.fontFamily;
	};

	/**
	 * @method setup(options: SetupOptions)
	 * Setup the Graph object to draw.
	 */
	Graph.setup = function (options) {
		this.setCanvas(options.canvas);
		this.setSize(options.size);
		this.setFont(options.fontDecoration, options.fontSize, options.fontFamily);

		this.scale = options.scale || this.DEFAULT.SCALE;
		this.round = options.round || this.DEFAULT.ROUND;

		this.drawAxisLine = options.drawAxisLine || this.DEFAULT.DRAW_AXIS;
		this.drawAxisArrow = options.drawAxisArrow || this.DEFAULT.DRAW_AXIS;
		this.drawAxisLabel = options.drawAxisLabel || this.DEFAULT.DRAW_AXIS;

		this.debug = options.debug || false;
	};

	//==============================
	//	Utils methods
	//==============================

	/**
	 * @methods getBound(data: Array[])
	 * Get bounds (max and min) of each dimension of the dataset.
	 */
	Graph.computeData = function (options) {
		this.bounds = [];
		this.minMax = [];
		for (let axis in options.data) {
			let min = Infinity;
			let max = -Infinity;
			for (let id in options.data[axis]) {
				let elt = options.data[axis][id];
				if (elt < min) {
					min = elt;
				}
				if (elt > max) {
					max = elt;
				}
			}
			this.minMax.push({
				min: min,
				max: max,
			});
			this.bounds.push({
				min: Math.floor(min / 10) * 10,
				max: Math.ceil(max / 10) * 10,
			});
		}
		this.bounds = options.bounds || this.bounds;
	};

	Graph.getDrawingValues = function () {
		let delta = this.measure('x');
		let textWidth = Math.max(
			this.measure(Math.floor(this.bounds[1].min * 10) / 10) + delta,
			this.measure(Math.floor(this.bounds[1].max * 10) / 10) + delta
		);
		this.drawingValues = {
			baseWidth: textWidth + delta,
			baseHeight: this.fontSize,
		};

		this.drawingBounds = [[], []];
	};

	/**
	 * @methods log(msg: string), warn(msg: string), err(msg: string)
	 * Method for printing in the console : messages, warnings or errors.
	 */
	let log = (msg) => {
		console.log(msg);
	};
	let warn = (msg) => {
		console.warn(msg);
	};
	let err = (msg) => {
		console.error(msg);
	};

	Graph.measure = function (str) {
		return this.ctx.measureText(str).width;
	};

	//==============================
	//	Canvas Drawing methods
	//==============================

	/**
	 * @method background(options)
	 * Draw background of canvas
	 */
	Graph.background = function (options) {
		this.ctx.fillStyle = options.backgroundColor || this.DEFAULT.BACKGROUND_COLOR;
		this.ctx.fillRect(0, 0, this.width, this.height);
	};

	/**
	 * @methods drawXAxis(options)
	 * Draw X axis in the canvas.
	 */
	Graph.drawXAxis = function (options) {
		let baseWidth = this.drawingValues.baseWidth;
		let baseHeight = this.drawingValues.baseHeight;

		if (this.drawAxisLine) {
			// Draw Line
			this.ctx.beginPath();
			this.ctx.moveTo(baseWidth - 5, this.height - baseHeight * (2 + 1 / 3));
			this.ctx.lineTo(this.width - baseHeight, this.height - baseHeight * (2 + 1 / 3));
			this.ctx.stroke();
		}

		if (this.drawAxisArrow) {
			//Draw Arrow Spike
			this.ctx.beginPath();
			this.ctx.moveTo(this.width - baseHeight, this.height - baseHeight * (2 + 1 / 3));
			this.ctx.lineTo(this.width - baseHeight * 1.5, this.height - baseHeight * (2 + 1 / 3) + this.fontSize * 0.5);
			this.ctx.moveTo(this.width - baseHeight, this.height - baseHeight * (2 + 1 / 3));
			this.ctx.lineTo(this.width - baseHeight * 1.5, this.height - baseHeight * (2 + 1 / 3) - this.fontSize * 0.5);
			this.ctx.stroke();
		}

		if (this.drawAxisLabel) {
			//Draw Legend
			this.ctx.beginPath();
			for (let i = 0; i < this.scale[0]; i++) {
				let data = ((this.bounds[0].max - this.bounds[0].min) / (this.scale[0] - 1)) * i + this.bounds[0].min;
				let x = baseWidth + ((this.width - baseHeight - baseWidth * 1.5) / (this.scale[0] - 1)) * i;
				let dataXDelta = this.measure(data + '') / 2;
				this.ctx.fillText(Math.floor(data * 10) / 10, x - dataXDelta, this.height - baseHeight);
				this.ctx.moveTo(x, this.height - baseHeight * (2 + 1 / 3) - 5);
				this.ctx.lineTo(x, this.height - baseHeight * (2 + 1 / 3) + 5);
			}
			this.ctx.stroke();
		}
	};

	/**
	 * @methods drawYAxis(options)
	 * Draw Y axis in the canvas.
	 */
	Graph.drawYAxis = function (options) {
		let baseWidth = this.drawingValues.baseWidth;
		let baseHeight = this.drawingValues.baseHeight;

		if (this.drawAxisLine) {
			// Draw Line
			this.ctx.beginPath();
			this.ctx.moveTo(baseWidth, this.height - baseHeight * (2 + 1 / 3) + 5);
			this.ctx.lineTo(baseWidth, baseHeight / 2);
			this.ctx.stroke();
		}

		if (this.drawAxisArrow) {
			//Draw Arrow Spike
			this.ctx.beginPath();
			this.ctx.moveTo(baseWidth, baseHeight / 2);
			this.ctx.lineTo(baseWidth + baseHeight * 0.5, baseHeight);
			this.ctx.moveTo(baseWidth, baseHeight / 2);
			this.ctx.lineTo(baseWidth - baseHeight * 0.5, baseHeight);
			this.ctx.stroke();
		}

		if (this.drawAxisLabel) {
			//Draw Legend
			this.ctx.beginPath();
			for (let i = 0; i < this.scale[1]; i++) {
				let data = ((this.bounds[1].max - this.bounds[1].min) / (this.scale[1] - 1)) * i + this.bounds[1].min;
				let y = this.height - (baseHeight * 2 + ((this.height - baseHeight * 4) / (this.scale[1] - 1)) * i);
				this.ctx.fillText(Math.floor(data * 10) / 10, 0, y);
				this.ctx.moveTo(baseWidth - 5, y - baseHeight / 3);
				this.ctx.lineTo(baseWidth + 5, y - baseHeight / 3);
			}
			this.ctx.stroke();
		}
	};

	/**
	 * @methods drawLegend(options)
	 * Draw legend in the canvas.
	 */
	Graph.drawLegend = function (options) {

		this.ctx.fillStyle = options.legendColor || this.DEFAULT.LEGEND_COLOR;
		this.ctx.strokeStyle = options.legendColor || this.DEFAULT.LEGEND_COLOR;

		this.drawYAxis(options);
		this.drawXAxis(options);
	};

	//==============================
	//	Plots methods
	//==============================

	/**
	 * @methods scatter(data: [int[], int[]], options: ScatterPlotOptions)
	 * Plot in scatter mode with options.
	 */
	Graph.scatter = function (args) {
		let options = args || {};

		this.canvas || this.setup(options);

		let data = options.data;
		if (!data || data.length !== 2) {
			err('Data must be in the format : [x, y] with x and y are arrays of numbers');
			return;
		}

		this.debug && console.log('Scatter Plot');

		this.computeData(options);
		this.getDrawingValues(options);
		this.background(options);
		this.drawLegend(options);

		return this;
	};

	/**
	 * @methods plot(data: [int[], int[], ...], options: PlotOptions)
	 * Plot with options.
	 */
	Graph.plot = function (args) {
		let options = args || {};

		const types = this.DEFAULT.TYPES;
		for (let id in types) {
			types[id] === options.type && this[options.type](options);
		}

		return this;
	};

	//==============================
	//	Factory
	//==============================

	// Export without conflict the Graph object to window.
	let oldG = window.G;
	if (oldG) {
		window.oldG = oldG;
	}

	window.G = Graph;
})();
