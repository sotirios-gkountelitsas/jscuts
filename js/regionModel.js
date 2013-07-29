function histogram(binNumber){
	this.bins = binNumber;
	this.data = new Float32Array(this.bins*this.bins*this.bins); //three dimensional histogram
	this.train = function(imageData, seeds){
		var rIndex = 0;
		var gIndex = 0;
		var bIndex = 0;
		var offset = 0;
		var counter = 0;
		
		for(i=0; i<imageData.length; i=i+4){
			//histogram indexes
			rIndex = imageData[i+0];
			gIndex = imageData[i+1];
			bIndex = imageData[i+2];
			
			if(seeds[i/4] == 1){
				//3dimesnional to 1dimensional form
				offset = rIndex*(this.bins*this.bins) + gIndex*this.bins + bIndex;
				this.data[offset]++;
				
				//training pixel counter
				counter++;
			}
		}
		
		// normalize histogram so that sum(this.data) = 1 (probability distribution)
		for(i=0; i<this.data.length; i++){
			this.data[i] = this.data[i]/imageData.length;
		}
		
	}
	
	this.getProbability = function(rIndex,gIndex,bIndex){
		var offset = rIndex*(this.bins*this.bins) + gIndex*this.bins + bIndex;
		return this.data[offset];
	}
}

function gaussian1D(){
	this.mean = 0;
	this.standardDeviation = 0;
	this.variance = 0;
	this.train = function(imageData, seeds){
		var counter = 0;
		
		// find mean
		for(i=0; i<imageData.length; i++){
			if(seeds[i]==1){
				this.mean += imageData[i];
				counter++;
			}
		}
		this.mean = this.mean/counter;
		
		// find variance
		for(i=0; i<imageData.length; i++){
			if(seeds[i]==1){
				this.variance += (imageData[i] - this.mean)*(imageData[i] - this.mean);
			}
		}
		this.variance = this.variance/counter;	
	}
	this.getProbability = function(color){
		var result = 0;
		
		result = (1/Math.sqrt(2*Math.PI*this.variance))*Math.exp(-Math.pow((color - this.mean),2)/(2*this.variance));
		
		return result;
	}
	
	this.standardDeviation = Math.sqrt(this.variance);
}

function gaussian3D(){
	this.mean = new Vec3();
	this.covariance = new Mat3x3();
	this.invCovariance = new Mat3x3();
	this.invCovDet = 0;
	this.train = function(imageData, seeds){
		var counter = 0;
		var R = 0;
		var G = 0;
		var B = 0;
		
		// find mean
		for(i=0; i<imageData.length; i=i+4){
			if(seeds[i/4]==1){
				R = imageData[i+0];
				G = imageData[i+1];
				B = imageData[i+2];
				
				this.mean.data[0] += R;
				this.mean.data[1] += G;
				this.mean.data[2] += B;
				
				counter++;
			}
		}
		

		
		this.mean.data[0] = this.mean.data[0]/counter;
		this.mean.data[1] = this.mean.data[1]/counter;
		this.mean.data[2] = this.mean.data[2]/counter;
		
		// find covariance
		for(i=0; i<imageData.length; i=i+4){
			if(seeds[i/4]==1){
				R = imageData[i+0];
				G = imageData[i+1];
				B = imageData[i+2];
				
				this.covariance.data[0] += (R - this.mean.data[0])*(R - this.mean.data[0]);
				this.covariance.data[1] += (R - this.mean.data[0])*(G - this.mean.data[1]);
				this.covariance.data[2] += (R - this.mean.data[0])*(B - this.mean.data[2]);
				this.covariance.data[3] += (G - this.mean.data[1])*(R - this.mean.data[0]);
				this.covariance.data[4] += (G - this.mean.data[1])*(G - this.mean.data[1]);
				this.covariance.data[5] += (G - this.mean.data[1])*(B - this.mean.data[2]);
				this.covariance.data[6] += (B - this.mean.data[2])*(R - this.mean.data[0]);
				this.covariance.data[7] += (B - this.mean.data[2])*(G - this.mean.data[1]);
				this.covariance.data[8] += (B - this.mean.data[2])*(B - this.mean.data[2]);
			}	
		}
		this.covariance.data[0] = this.covariance.data[0]/counter;
		this.covariance.data[1] = this.covariance.data[1]/counter;
		this.covariance.data[2] = this.covariance.data[2]/counter;
		this.covariance.data[3] = this.covariance.data[3]/counter;
		this.covariance.data[4] = this.covariance.data[4]/counter;
		this.covariance.data[5] = this.covariance.data[5]/counter;
		this.covariance.data[6] = this.covariance.data[6]/counter;
		this.covariance.data[7] = this.covariance.data[7]/counter;
		this.covariance.data[8] = this.covariance.data[8]/counter;
		
		// inverse covariance
		this.invCovariance = this.covariance.inverse();
		
		// determinant of inverse covariance
		this.invCovDet = this.invCovariance.determinant();	
	}
	this.getProbability = function(R, G, B){
		var leftVec = new Vec3([R, G, B]);
		var rightVec = new Vec3();
		var temp = new Vec3();
		var expArg = 0;
		var probability = 0; 
		
		temp.data[0] = R - this.mean.data[0];
		temp.data[1] = G - this.mean.data[1];
		temp.data[2] = B - this.mean.data[2];
		
		leftVec.data[0] = R - this.mean.data[0];
		leftVec.data[1] = G - this.mean.data[1];
		leftVec.data[2] = B - this.mean.data[2];
		
		rightVec = this.invCovariance.rightVecMultiplication(temp);
		
		expArg = leftVec.vectorMultiplication1x3x3x1(rightVec);
		expArg = -0.5*expArg;
		
		
		probability = (Math.pow(2*Math.PI, -(3/2))*Math.pow(this.invCovDet, -(1/2)))*Math.exp(expArg);
		
		
		return probability;
	}
}

function hybridGMM(){
	this.weights = new Float32Array(512); 
	this.gaussians = [];
	this.train = function(imageData, seeds){
		
		//init variables
		var counter = 0;
		var binRegionSize = new Int32Array(512);
		var R = 0;
		var G = 0;
		var B = 0;
		var Rbin = 0;
		var Gbin = 0;
		var Bbin = 0;
		var bin = 0;
		var binSize = 32;
		
		for(var i=0; i<512; i++){
			//this.weights[i] = 0;
			this.gaussians[i] = new gaussian3D();
			binRegionSize[i] = 0;
			
			//init covariances
			this.gaussians[i].covariance.data[0] = 0;
			this.gaussians[i].covariance.data[1] = 0;
			this.gaussians[i].covariance.data[2] = 0;
			this.gaussians[i].covariance.data[3] = 0;
			this.gaussians[i].covariance.data[4] = 0;
			this.gaussians[i].covariance.data[5] = 0;
			this.gaussians[i].covariance.data[6] = 0;
			this.gaussians[i].covariance.data[7] = 0;
			this.gaussians[i].covariance.data[8] = 0;
			
			//init means
			this.gaussians[i].mean.data[0] = 0;
			this.gaussians[i].mean.data[1] = 0;
			this.gaussians[i].mean.data[2] = 0;
		}
		
		//console.log("This is the mean "+this.gaussians[15].mean.data[0] );
		
		//find means of gaussians
		for(var i=0; i<imageData.length; i=i+4){
			if(seeds[i/4]==1){
				R = imageData[i+0];
				G = imageData[i+1];
				B = imageData[i+2];
				
				//integer division in javascript
				Rbin = (R/binSize)>>0;
				Gbin = (G/binSize)>>0;
				Bbin = (B/binSize)>>0;
				
				bin = 64*Rbin + 8*Gbin + Bbin;
				
				this.gaussians[bin].mean.data[0] += R;
				this.gaussians[bin].mean.data[1] += G;
				this.gaussians[bin].mean.data[2] += B;
				
				binRegionSize[bin]++; 
				counter++;
			}
		}
		
		for(var i=0; i<binRegionSize.length; i++){
			if(binRegionSize[i]>0){
				this.gaussians[i].mean.data[0] = this.gaussians[i].mean.data[0]/binRegionSize[i];
				this.gaussians[i].mean.data[1] = this.gaussians[i].mean.data[1]/binRegionSize[i];
				this.gaussians[i].mean.data[2] = this.gaussians[i].mean.data[2]/binRegionSize[i];
			}
		}
		

		
		
		//find covariances of gaussians
		for(var i=0; i<imageData.length; i=i+4){
			if(seeds[i/4]==1){
				R = imageData[i+0];
				G = imageData[i+1];
				B = imageData[i+2];
				
				//integer division in javascript
				Rbin = (R/binSize)>>0;
				Gbin = (G/binSize)>>0;
				Bbin = (B/binSize)>>0;
				
				bin = 64*Rbin + 8*Gbin + Bbin;
				
				this.gaussians[bin].covariance.data[0] += (R - this.gaussians[bin].mean.data[0])*(R - this.gaussians[bin].mean.data[0]);
				this.gaussians[bin].covariance.data[1] += (R - this.gaussians[bin].mean.data[0])*(G - this.gaussians[bin].mean.data[1]);
				this.gaussians[bin].covariance.data[2] += (R - this.gaussians[bin].mean.data[0])*(B - this.gaussians[bin].mean.data[2]);
				this.gaussians[bin].covariance.data[3] += (G - this.gaussians[bin].mean.data[1])*(R - this.gaussians[bin].mean.data[0]);
				this.gaussians[bin].covariance.data[4] += (G - this.gaussians[bin].mean.data[1])*(G - this.gaussians[bin].mean.data[1]);
				this.gaussians[bin].covariance.data[5] += (G - this.gaussians[bin].mean.data[1])*(B - this.gaussians[bin].mean.data[2]);
				this.gaussians[bin].covariance.data[6] += (B - this.gaussians[bin].mean.data[2])*(R - this.gaussians[bin].mean.data[0]);
				this.gaussians[bin].covariance.data[7] += (B - this.gaussians[bin].mean.data[2])*(G - this.gaussians[bin].mean.data[1]);
				this.gaussians[bin].covariance.data[8] += (B - this.gaussians[bin].mean.data[2])*(B - this.gaussians[bin].mean.data[2]);
			}
		}
		
		for(var i=0; i<binRegionSize.length; i++){
			if(binRegionSize[i]>0){
				//Running into a singular covariance matrix is problematic. So we'll add a small epsilon
				//value to the diagonal elements to ensure a positive definite covariance matrix.
				this.gaussians[i].covariance.data[0] = this.gaussians[i].covariance.data[0] + 2;
				this.gaussians[i].covariance.data[4] = this.gaussians[i].covariance.data[4] + 2;
				this.gaussians[i].covariance.data[8] = this.gaussians[i].covariance.data[8] + 2;
				
				this.gaussians[i].covariance.data[0] = this.gaussians[i].covariance.data[0]/binRegionSize[i];
				this.gaussians[i].covariance.data[1] = this.gaussians[i].covariance.data[1]/binRegionSize[i];
				this.gaussians[i].covariance.data[2] = this.gaussians[i].covariance.data[2]/binRegionSize[i];
				this.gaussians[i].covariance.data[3] = this.gaussians[i].covariance.data[3]/binRegionSize[i];
				this.gaussians[i].covariance.data[4] = this.gaussians[i].covariance.data[4]/binRegionSize[i];
				this.gaussians[i].covariance.data[5] = this.gaussians[i].covariance.data[5]/binRegionSize[i];
				this.gaussians[i].covariance.data[6] = this.gaussians[i].covariance.data[6]/binRegionSize[i];
				this.gaussians[i].covariance.data[7] = this.gaussians[i].covariance.data[7]/binRegionSize[i];
				this.gaussians[i].covariance.data[8] = this.gaussians[i].covariance.data[8]/binRegionSize[i];


				
			
				//compute weights for every gaussian
				this.weights[i] = (binRegionSize[i]/counter);
					
				// inverse covariance for every gaussian
				this.gaussians[i].invCovariance = this.gaussians[i].covariance.inverse();
			
				// determinant of inverse covariance of every gaussian
				this.gaussians[i].invCovDet = this.gaussians[i].invCovariance.determinant();
			}	
		}	
	}

	this.getProbability = function(R, G, B){
		var Rbin = 0;
		var Gbin = 0;
		var Bbin = 0;
		var binSize = 32;
		var bin = 0;
		var probability = 0;
		
		//integer division in javascript
		Rbin = (R/binSize)>>0;
		Gbin = (G/binSize)>>0;
		Bbin = (B/binSize)>>0;
		
		//neighbouring bins in the 3D space
		if(Rbin < 7){
			bin = (Rbin+1)*64 + Gbin*8 + Bbin;
			probability += this.weights[bin]*this.getBinProbability(bin, R, G, B);
		}
		if(Rbin > 0){
			bin = (Rbin-1)*64 + Gbin*8 + Bbin;
			probability += this.weights[bin]*this.getBinProbability(bin, R, G, B);
		}
		
		if(Gbin < 7){
			bin = Rbin*64 + (Gbin+1)*8 + Bbin;
			probability += this.weights[bin]*this.getBinProbability(bin, R, G, B);
		}
		if(Gbin > 0){
			bin = Rbin*64 + (Gbin-1)*8 + Bbin;
			probability += this.weights[bin]*this.getBinProbability(bin, R, G, B);
		}
		
		if(Bbin < 7){
			bin = Rbin*64 + Gbin*8 + (Bbin+1);
			probability += this.weights[bin]*this.getBinProbability(bin, R, G, B);
		}
		if(Bbin > 0){
			bin = Rbin*64 + Gbin*8 + (Bbin-1);
			probability += this.weights[bin]*this.getBinProbability(bin, R, G, B);
		}
		
		bin = Rbin*64 + Gbin*8 + Bbin;
		probability += this.weights[bin]*this.getBinProbability(bin, R, G, B);
		
		return probability;
		
	}
	this.getBinProbability = function(bin, R, G, B){
		var leftVec = new Vec3([R, G, B]);
		var rightVec = new Vec3();
		var temp = new Vec3();
		var expArg = 0;
		var probability = 0; 
		//console.log("this is bin inside bin probability "+bin);
		
		if(this.weights[bin]>0){
			temp.data[0] = R - this.gaussians[bin].mean.data[0];
			temp.data[1] = G - this.gaussians[bin].mean.data[1];
			temp.data[2] = B - this.gaussians[bin].mean.data[2];

			leftVec.data[0] = R - this.gaussians[bin].mean.data[0];
			leftVec.data[1] = G - this.gaussians[bin].mean.data[1];
			leftVec.data[2] = B - this.gaussians[bin].mean.data[2];

			
			rightVec = this.gaussians[bin].invCovariance.rightVecMultiplication(temp);
			

			
			expArg = leftVec.vectorMultiplication1x3x3x1(rightVec);

			expArg = -0.5*expArg;

			
			
			probability = (Math.pow(2*Math.PI, -(3/2))*Math.pow(this.gaussians[bin].invCovDet, -(1/2)))*Math.exp(expArg);
		}
		
		
		return probability;
	}
}