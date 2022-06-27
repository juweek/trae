/*
A lot of code taken from https://codepen.io/juweek/pen/RwMbygj
*/


/*
------------------------------
METHOD: come up with utility functions
------------------------------
*/

const Between = (min, max) => {
	return Math.random() * (max, min) + max;
  };

/*
------------------------------
METHOD: instatiate the canvas, set the context, etc
------------------------------
*/
  class RorschachTest {
	constructor() {
	  // Main canvas
	  this.canvas = document.querySelector("canvas");
	  this.ctx = this.canvas.getContext("2d");
  
	  // Buffer canvas
	  this.bufferCanvas = document.createElement("canvas");
	  this.bufferCtx = this.bufferCanvas.getContext("2d");
  
	  // fetch the outlines of the shapes
	  let assetManifest = {
		one: "https://raw.githubusercontent.com/juweek/datasets/main/images/palm3.png",
		two: "https://raw.githubusercontent.com/juweek/datasets/main/images/fingerprint.png",
		three: "https://raw.githubusercontent.com/juweek/datasets/main/images/palm2.png"
		
	  };
  
	  //load the assets in a way that's easy to play with
	  let loader = new AssetLoader(assetManifest);
	  loader.preload().then((data) => {
		this.assets = data;
		this.currentAssetIndex = 0;
		this.init();
	  });
	}
  
	//set the necessary variables
	init() {
	  this.blobs = [];
	  this.currentAsset = null;
  
	  // Make blobs
	  for (let i = 0; i < 300; i++) {
		let blob = new Blob(this.bufferCanvas, this.bufferCtx);
		this.blobs.push(blob);
	  }
  
	  // add a listener for resizing
	  window.addEventListener("resize", () => {
		this.resize();
	  });

	  document.body.addEventListener("click", () => {
		let total = Object.keys(this.assets).length;
		this.currentAssetIndex++;
		if (this.currentAssetIndex > total - 1) {
		  this.currentAssetIndex = 0;
		}
		this.setCurrentAsset();
	  });
  
	  // kick off the rorschach test 
	  this.resize();
	  this.setCurrentAsset();
	  this.render();
	}
  
	//add in the current background for the rorschach test 
	setCurrentAsset() {
	  this.blobs.forEach((b) => {
		b.transition();
	  });
	  setTimeout(() => {
		let asset = Object.keys(this.assets)[this.currentAssetIndex];
		this.wrh =
		  this.assets[asset].asset.width / this.assets[asset].asset.height;
		this.currentAsset = this.assets[asset];
	  }, 1500);
	}
  
	//render the rorschach test. first, check to see that there is an asset loaded. then, clear the context.
	render() {
	  if (this.currentAsset !== null) {
		const newWidth = this.canvas.width;
		const newHeight = newWidth / this.wrh;
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  
		//there is a blob class for each of your blobs; have them update depending on stats
		this.blobs.forEach((b) => {
		  b.update();
		});
  
		// Take the buffer, cut it in half and flip it to mirror
		this.bufferCtx.save();
		this.bufferCtx.translate(this.bufferCanvas.width / 2, 0);
		this.bufferCtx.scale(-1, 1);
		this.bufferCtx.drawImage(
		  this.bufferCanvas,
		  (this.bufferCanvas.width / 2) * -1,
		  0
		);
		this.bufferCtx.restore();
  
		// Restore the context and write the buffer and mask
		this.ctx.save();
		this.ctx.drawImage(this.currentAsset.asset, 0, 0, newWidth, newHeight);
		this.ctx.globalCompositeOperation = "source-in";
		this.ctx.drawImage(this.bufferCanvas, 0, 0);
		this.ctx.restore();
  
		this.bufferCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	  }
	  requestAnimationFrame(() => {
		this.render();
	  });
	}
  
	resize() {
	  this.canvas.width = 450;
	  this.canvas.height = 600;
  
	  this.bufferCanvas.width = 450;
	  this.bufferCanvas.height = 600;
	}
  }
  
  /*
------------------------------
METHOD: there will be hundreds of blobs per  rorschach test 
------------------------------
*/
  class Blob {
	// construct the context with the canvas in mind
	constructor(canvas, ctx) {
	  this.ctx = ctx;
	  this.canvas = canvas;
  
	  this.options = {
		radius: 0,
		x: canvas.width / 2,
		y: canvas.height / 2,
		opacity: 1
	  };
	  this.tween = null;
	}
  // keep the blobs within bounds
	get targetWidth() {
	  let ran = Between(-50, 50);
	  return this.canvas.width + ran / 2;
	}
	get targetHeight() {
	  let ran = Between(-50, 50);
	  return this.canvas.height - ran;
	}
  
	// the update function that causes the blobs to continuously move around. this is where the player stats will come in handy
	update() {
	  this.ctx.fillStyle = `rgba(0,0,0, ${this.options.opacity})`;
	  this.ctx.beginPath();
	  this.ctx.arc(
		this.options.x,
		this.options.y,
		this.options.radius,
		0,
		2 * Math.PI
	  );
	  this.ctx.fill();
	}
  
	// this is where the blobs will increase in size. what causes a blob to increase? points per touch? 
	grow() {
	  if (this.tween) this.tween.kill();
	  this.tween = TweenMax.to(this.options, Between(0.5, 1), {
		radius: Between(5, 8),
		x: Between(-this.targetWidth, this.targetWidth),
		y: Between(-this.targetHeight, this.targetHeight),
		opacity: 1,
		onComplete: () => {
		  this.live();
		}
	  });
	}
  
	// this is similar to the GROW function, but notice that the tween method id between 10 and 15 instead of .5 and 1
	live() {
	  if (this.tween) this.tween.kill();
	  this.tween = TweenMax.to(this.options, Between(10, 15), {
		radius: Between(5, 8),
		x: Between(-this.targetWidth, this.targetWidth),
		y: Between(-this.targetHeight, this.targetHeight),
		opacity: 1,
		onComplete: () => {
		  this.live();
		}
	  });
	}
  
	transition() {
	  if (this.tween) this.tween.kill();
	  this.tween = TweenMax.to(this.options, 1, {
		opacity: 0,
		radius: 15,
		onComplete: () => {
		  this.options = {
			radius: 0,
			x: this.canvas.width / 2,
			y: this.canvas.height / 2,
			opacity: 1
		  };
		  setTimeout(() => {
			this.grow();
		  }, 500);
		}
	  });
	}
  }
 
    /*
------------------------------
METHOD: load in the assets (the silhouettes) as necessary
------------------------------
*/
  class AssetLoader {
	constructor(manifest) {
	  this.assets = manifest;
	}
  
	preload() {
	  const _files = [];
	  return new Promise((resolve, reject) => {
		for (const [key, value] of Object.entries(this.assets)) {
		  const file = value;
		  _files.push(this.load(key, file));
		}
  
		Promise.all(_files).then((data) => {
		  resolve(this.assets);
		});
	  });
	}
  
	load(key, file) {
	  return new Promise((resolve, reject) => {
		this.loadImage(file).then((data) => {
		  this.assets[key] = {
			asset: data,
			path: file
		  };
		  resolve(data);
		});
	  });
	}
  
	loadImage(file) {
	  return new Promise((resolve, reject) => {
		const image = new Image();
		image.onload = (event) => {
		  resolve(event.target);
		};
		image.src = file;
	  });
	}
  }
  
  new RorschachTest();
  