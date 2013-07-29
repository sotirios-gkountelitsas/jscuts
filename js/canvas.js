// image object
var imageObj = new Image();
imageObj.src = 'color0025.png';

var originalImageData; // original image data container
var drawFlag = false;  // flag to control if draw mode is active
var fgSeeds = new Int8Array(320*240); //foreground seeds array
var bgSeeds = new Int8Array(320*240); //background seeds array
var imgW = 0; // image width
var imgH = 0; // image height
var regionModel = '';

// get canvas
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");




window.onload = function(){
var imgData;

//draw image
ctx.drawImage(imageObj, 0, 0);
//get canvas data
imgData = ctx.getImageData(0, 0, imageObj.width, imageObj.height);
//get image width and height
imgW = imgData.width;
imgH = imgData.height;

// make a copy of the data
originalImageData = ctx.createImageData(imgW, imgH);
originalImageData.data.set(imgData.data);
}



// mouseMove event
canvas.addEventListener('mousemove', function(evt) {
	var mousePos;
	
	if(drawFlag){
		mousePos = getMousePos(canvas, evt);
		draw(mousePos.x, mousePos.y, 5);
	}
}, false);

// mouseDown event

canvas.addEventListener('mousedown', function(evt){
	var mousePos;
	
	drawFlag = true;
	mousePos = getMousePos(canvas, evt);
	draw(mousePos.x, mousePos.y, 5);
}, false);

// mouseUp event

canvas.addEventListener('mouseup', function(evt){
	 drawFlag = false;
}, false);

// get mouse position in canvas

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top
        };
}

// function to draw a circle
function draw(centerX, centerY, radius) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.stroke();
}

// foreground seeds color
function foregroundColor(){
	ctx.fillStyle = '#00ff00';
    ctx.strokeStyle = '#00ff00';
}

// background seeds color
function backgroundColor(){
	ctx.fillStyle = '#ff0000';
    ctx.strokeStyle = '#ff0000';
}

// initialize models
function initModels(){
	// get region term type
	regionTerm = document.getElementById("regionTerm").value;
	
	
	// create and train region models
	if(regionTerm == 'hist'){
		// histogram model
		var foregroundHist = new histogram(256);
		var backgroundHist = new histogram(256);
		
		foregroundHist.train(originalImageData.data, fgSeeds);
		backgroundHist.train(originalImageData.data, bgSeeds);
			
		return{
			foreground: foregroundHist,
			background: backgroundHist
		};
	}else if(regionTerm == '3DG'){
		// 3 dimensional gaussian model
		var foregroundGaussian3D = new gaussian3D();
		var backgroundGaussian3D = new gaussian3D();
		
		foregroundGaussian3D.train(originalImageData.data, fgSeeds);
		backgroundGaussian3D.train(originalImageData.data, bgSeeds);
			
		return{
			foreground: foregroundGaussian3D,
			background: backgroundGaussian3D
		};
	}else{
		// ToF cut custom gaussian mixture model
		var foregroundGMM = new hybridGMM();
		var backgroundGMM = new hybridGMM();
	
		foregroundGMM.train(originalImageData.data, fgSeeds);
		backgroundGMM.train(originalImageData.data, bgSeeds);
		
		return{
			foreground: foregroundGMM,
			background: backgroundGMM
		};
	}


}



//compute seeds
function computeSeeds() { 
	var imgData = ctx.getImageData(0, 0, imgW, imgH);
	var R = 0;
	var G = 0;
	var B = 0;
	for(i=0; i<imgData.data.length; i=i+4){
		R = imgData.data[i+0];
		G = imgData.data[i+1];
		B = imgData.data[i+2];

		if(R==0 && G==255 && B==0){		//background seeds
			fgSeeds[i/4] = 1;
		}else if(R==255 && G==0 && B==0){//foreground seeds
			bgSeeds[i/4] = 1;
		}
	}
}


// draw image based on region term allone
function drawImage(foregroundModel, backgroundModel){
	var canvas = document.getElementById("myCanvas");
	var ctx = canvas.getContext("2d");
	var drawImageData = ctx.createImageData(imgW, imgH);
	var length = drawImageData.data.length;
	var R = 0;
	var G = 0;
	var B = 0;
	
	var tempDrawData = drawImageData.data;
	var tempOriginalData = originalImageData.data;

	for(i=0; i<length; i=i+4){
		R = tempOriginalData[i+0];
		G = tempOriginalData[i+1];
		B = tempOriginalData[i+2];
		
		if(foregroundModel.getProbability(R,G,B) > backgroundModel.getProbability(R,G,B)){
			tempDrawData[i+0] = 255;
			tempDrawData[i+1] = 255;
			tempDrawData[i+2] = 255;
			tempDrawData[i+3] = 255;
		}else{
			tempDrawData[i+0] = 0;
			tempDrawData[i+1] = 0;
			tempDrawData[i+2] = 0;
			tempDrawData[i+3] = 255;
		}
	}
	
	drawImageData.data = tempDrawData;
	ctx.putImageData(drawImageData,0,0);
}

// compute segmentation
function segmentation(){
	computeSeeds();
	regionModel = initModels();
	drawImage(regionModel.foreground, regionModel.background);
}

// function to restore image back to the original
function restoreImage() {	
	ctx.putImageData(originalImageData,0,0);
}







// Miscellaneous functions

//function to set an array to a specific value
function newFilledArray(length, val) {
    var temp = [];
    for (var i = 0; i < length; i++) {
        temp[i] = val;
    }
	// return by value and not by reference
    return temp.slice();
}


 