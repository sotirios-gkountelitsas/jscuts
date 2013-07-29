function Mat3x3(m){
	if(m === undefined){
		this.data = new Float32Array([0,0,0,0,0,0,0,0,0]);
	}else{
		this.data = m.slice();
	}
	this.getData = function(){
		return this.data;
	}
	this.setData = function(m){
		try{
			if((Array.isArray(b) && b.length != 9) || (typeof b === 'object' && typeof b !== 'null' && b.data.length != 9)){
				throw{
					name: "dimensionsException",
					message: "Dimensions do not agree"
				}
			}
		}catch(err){
			console.log(err);
		}
		this.data = m.slice();
	}
	this.getElement = function(row, column){
		var offset = row*3 + column;
		return this.data[offset];
	}
	this.setElement = function(row, column, value){
		var offset = row*3 + column;
		this.data[offset] = value;
	}
	this.identity = function(){
		this.data[0] = 1;
		this.data[1] = 0;
		this.data[2] = 0;
		this.data[3] = 0;
		this.data[4] = 1;
		this.data[5] = 0;
		this.data[6] = 0;
		this.data[7] = 1;
	}
	this.transpose = function(){
		var temp = new Float32Array([0,0,0,0,0,0,0,0,0]);
	
		var a00 = this.data[0], a01 = this.data[1], a02 = this.data[2],
			a10 = this.data[3], a11 = this.data[4], a12 = this.data[5],
			a20 = this.data[6], a21 = this.data[7], a22 = this.data[8];
			
		temp[0] = a00;
		temp[1] = a10;
		temp[2] = a20;
		temp[3] = a01;
		temp[4] = a11;
		temp[5] = a21;
		temp[6] = a02;
		temp[7] = a12;
		temp[8] = a22;
		
		return temp;
	}
	this.determinant = function(){	
		var det = 0;
		var a00 = this.data[0], a01 = this.data[1], a02 = this.data[2],
			a10 = this.data[3], a11 = this.data[4], a12 = this.data[5],
			a20 = this.data[6], a21 = this.data[7], a22 = this.data[8];
		
		// Laplace expansion
		det = a00*((a11*a22) - (a12*a21)) - a01*((a10*a22)-(a12*a20)) + a02*((a10*a21)-(a11*a20));
		
		return det;
	}
	this.inverse = function(){
		var temp = new Mat3x3();
		var det = 0;
		var a00 = this.data[0], a01 = this.data[1], a02 = this.data[2],
			a10 = this.data[3], a11 = this.data[4], a12 = this.data[5],
			a20 = this.data[6], a21 = this.data[7], a22 = this.data[8];
		
		//determinant
		det = a00*((a11*a22) - (a12*a21)) - a01*((a10*a22)-(a12*a20)) + a02*((a10*a21)-(a11*a20));

		try{
			if (det == 0) {
				throw {
					name: 'inverseMatrixException',
					message: 'determinant is zero, therefore there is no inverse'
				}
			}
		}catch(err){
			console.log(err);
		}
		

		
		var m00 = a11*a22 - a21*a12;
		var m01 = -(a01*a22 - a21*a02); 
		var m02 = a01*a12 - a11*a02;
		var m10 = -(a10*a22 - a20*a12);
		var m11 = a00*a22 - a20*a02;
		var m12 = -(a00*a12 - a10*a02);
		var m20 = a10*a21 - a20*a11;
		var m21 = -(a00*a21 - a20*a01);
		var m22 = a00*a11 - a10*a01;
		
		temp.data[0] = m00/det;
		temp.data[1] = m01/det;
		temp.data[2] = m02/det;
		temp.data[3] = m10/det;
		temp.data[4] = m11/det;
		temp.data[5] = m12/det;
		temp.data[6] = m20/det;
		temp.data[7] = m21/det;
		temp.data[8] = m22/det;
		
		return temp;
	}
	
	this.matrixMultiplication = function(b){
		try{
			if((Array.isArray(b) && b.length != 9) || (typeof b === 'object' && typeof b !== 'null' && b.data.length != 9)){
				throw{
					name: "dimensionsException",
					message: "Dimensions do not agree"
				}
			}
		}catch(err){
			console.log(err);
		}
		var temp = new Mat3x3();
		
		var a00 = this.data[0], a01 = this.data[1], a02 = this.data[2],
			a10 = this.data[3], a11 = this.data[4], a12 = this.data[5],
			a20 = this.data[6], a21 = this.data[7], a22 = this.data[8];
		
		var b00 = b.data[0], b01 = b.data[1], b02 = b.data[2],
			b10 = b.data[3], b11 = b.data[4], b12 = b.data[5],
			b20 = b.data[6], b21 = b.data[7], b22 = b.data[8];
			
		temp.data[0] = a00*b00 + a01*b10 + a02*b20;
		temp.data[1] = a00*b01 + a01*b11 + a02*b21;
		temp.data[2] = a00*b02 + a01*b12 + a02*b22;
		temp.data[3] = a10*b00 + a11*b10 + a12*b20;
		temp.data[4] = a10*b01 + a11*b11 + a12*b21;
		temp.data[5] = a10*b02 + a11*b12 + a12*b22;
		temp.data[6] = a20*b00 + a21*b10 + a22*b20;
		temp.data[7] = a20*b01 + a21*b11 + a22*b21;
		temp.data[8] = a20*b02 + a21*b12 + a22*b22;
		
		return temp;
		
	}
	
	this.matrixAddition = function(b){
		try{
			if((Array.isArray(b) && b.length != 9) || (typeof b === 'object' && typeof b !== 'null' && b.data.length != 9)){
				throw{
					name: "dimensionsException",
					message: "Dimensions do not agree"
				}
			}
		}catch(err){
			console.log(err);
		}
		
		var temp = new Mat3x3();
		
		var a00 = this.data[0], a01 = this.data[1], a02 = this.data[2],
			a10 = this.data[3], a11 = this.data[4], a12 = this.data[5],
			a20 = this.data[6], a21 = this.data[7], a22 = this.data[8];
		
		var b00 = b.data[0], b01 = b.data[1], b02 = b.data[2],
			b10 = b.data[3], b11 = b.data[4], b12 = b.data[5],
			b20 = b.data[6], b21 = b.data[7], b22 = b.data[8];
			
		temp.data[0] = a00+b00;
		temp.data[1] = a01+b01;
		temp.data[2] = a02+b02;
		temp.data[3] = a10+b10;
		temp.data[4] = a11+b11;
		temp.data[5] = a12+b12;
		temp.data[6] = a20+b20;
		temp.data[7] = a21+b21;
		temp.data[8] = a22+b22;
		
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
		var temp = new Mat3x3();
		
		var a00 = this.data[0], a01 = this.data[1], a02 = this.data[2],
			a10 = this.data[3], a11 = this.data[4], a12 = this.data[5],
			a20 = this.data[6], a21 = this.data[7], a22 = this.data[8];
		
			
		temp.data[0] = scalar*a00;
		temp.data[1] = scalar*a01;
		temp.data[2] = scalar*a02;
		temp.data[3] = scalar*a10;
		temp.data[4] = scalar*a11;
		temp.data[5] = scalar*a12;
		temp.data[6] = scalar*a20;
		temp.data[7] = scalar*a21;
		temp.data[8] = scalar*a22;
		
		return temp;	
		
		
	}
	
	this.leftVecMultiplication = function(vector){
		try{
			if((Array.isArray(vector) && vector.length != 3) || (typeof vector === 'object' && typeof vector !== 'null' && vector.data.length != 3)){
				throw{
					name: "dimensionsException",
					message: "Dimensions do not agree"
				}
			}
		}catch(err){
			console.log(err);
		}
		
		var temp = new Vec3();
		
		var a00 = this.data[0], a01 = this.data[1], a02 = this.data[2],
			a10 = this.data[3], a11 = this.data[4], a12 = this.data[5],
			a20 = this.data[6], a21 = this.data[7], a22 = this.data[8];
			
		var b0 = vector.data[0], b1 = vector.data[1], b2 = vector.data[2];
			
		temp.data[0] = b0*a00 + b1*a10 + b2*a20;
		temp.data[1] = b0*a01 + b1*a11 + b2*a21;
		temp.data[2] = b0*a02 + b1*a12 + b2*a22;
		
		return termp;
		
	}
	
	this.rightVecMultiplication = function(vector){
		try{
			if((Array.isArray(vector) && vector.length != 3) || (typeof vector === 'object' && typeof vector !== 'null' && vector.data.length != 3)){
				throw{
					name: "dimensionsException",
					message: "Dimensions do not agree"
				}
			}
		}catch(err){
			console.log(err);
		}
		
		var temp = new Vec3();
		
		var a00 = this.data[0], a01 = this.data[1], a02 = this.data[2],
			a10 = this.data[3], a11 = this.data[4], a12 = this.data[5],
			a20 = this.data[6], a21 = this.data[7], a22 = this.data[8];
			
		var b0 = vector.data[0], b1 = vector.data[1], b2 = vector.data[2];
			
		temp.data[0] = a00*b0 + a01*b1 + a02*b2;
		temp.data[1] = a10*b0 + a11*b1 + a12*b2;
		temp.data[2] = a20*b0 + a21*b1 + a22*b2;
		
		return temp;
		
	}
}