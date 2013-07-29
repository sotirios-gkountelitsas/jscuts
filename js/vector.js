function Vec3(v){
	if(v === undefined){
		this.data = new Float32Array([0,0,0]);
	}else{
		this.data = v.slice();
	}
	this.getData = function(){
		return this.data;
	}
	this.setData = function(v){
		try{
			if((Array.isArray(v) && v.length != 3) || (typeof v === 'object' && typeof v !== 'null' && v.data.length != 3)){
				throw{
					name: "dimensionsException",
					message: "Dimensions do not agree"
				}
			}
		}catch(err){
			console.log(err);
		}
		this.data = v.slice();
		return this.data;
	}
	this.getElement = function(offset){
		return this.data[offset];
	}
	this.setElement = function(offset, value){
		this.data[offset] = value;
	}

	
	this.vectorAddition = function(b){
		try{
			if((Array.isArray(b) && b.length != 3) || (typeof b === 'object' && typeof b !== 'null' && b.data.length != 3)){
				throw{
					name: "dimensionsException",
					message: "Dimensions do not agree"
				}
			}
		}catch(err){
			console.log(err);
		}
		
		var temp = new Vec3();
		var a0 = this.data[0], a1 = this.data[1], a2 = this.data[2];
		var b0 = b.data[0], b1 = b.data[1], b2 = b.data[2];
			
		temp.data[0] = a0+b0;
		temp.data[1] = a1+b1;
		temp.data[2] = a2+b2;
		
		return temp;		
	}
	
	this.scalarMultiplication = function(scalar){
		try{
			if(typeof scalar !== 'number' || isNaN(scalar)){
				throw{
					name: 'typeException',
					message: 'Not a number'
				}
			}
		}catch(err){
			console.log(err);
		}
		var temp = new Vec3();		
		var a0 = this.data[0], a1 = this.data[1], a2 = this.data[2];	
			
		temp.data[0] = scalar*a0;
		temp.data[1] = scalar*a1;
		temp.data[2] = scalar*a2;
		
		return temp;	
	}
	
	this.vectorMultiplication1x3x3x1 = function(b){
		try{
			if((Array.isArray(b) && b.length != 3) || (typeof b === 'object' && typeof b !== 'null' && b.data.length != 3)){
				throw{
					name: "dimensionsException",
					message: "Dimensions do not agree"
				}
			}
		}catch(err){
			console.log(err);
		}
		
		var temp = 0;
		var a0 = this.data[0], a1 = this.data[1], a2 = this.data[2];
		var b0 = b.data[0], b1 = b.data[1], b2 = b.data[2];
			
		temp = a0*b0 + a1*b1 + a2*b2;
		
		return temp;		
	}
}