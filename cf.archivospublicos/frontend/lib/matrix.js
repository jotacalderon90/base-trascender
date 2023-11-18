(function(){
	const matrix = function(){
		$('body').append('<canvas id="default_matrix_canvas"></canvas>');
		this.neo();
		this.start();
	}
	matrix.prototype.start = function(){
		this.velocidad = 33;
		this.opacity = 0.2;
		$("#default_matrix_canvas").css("opacity",this.opacity);	
		$("#default_matrix_canvas").css("position",'absolute');	
		$("#default_matrix_canvas").css("z-index",'200');	
		setInterval(()=>{this.draw()}, this.velocidad);	
	}
	//jc:2020.06.11:14:30:
	//las funciones neo y draw fueron extraidas de la siguiente url: 
	//https://thecodeplayer.com/walkthrough/matrix-rain-animation-html5-canvas-javascript	
	matrix.prototype.neo = function(){
		this.c = document.getElementById("default_matrix_canvas");
		this.ctx = this.c.getContext("2d");
		
		this.c.height = window.innerHeight+15;//???esos 15
		this.c.width = window.innerWidth;
		//chinese characters - taken from the unicode charset
		this.chinese = "田由甲申甴电甶男甸甹町画甼甽甾甿畀畁畂畃畄畅畆畇畈畉畊畋界畍畎畏畐畑";//
		//converting the string into an array of single characters
		this.chinese = this.chinese.split("");
		this.font_size = 10;
		this.columns = this.c.width/this.font_size; //number of columns for the rain
		//an array of drops - one per column
		this.drops = [];
		//x below is the x coordinate
		//1 = y co-ordinate of the drop(same for every drop initially)
		for(let x = 0; x < this.columns; x++){
			this.drops[x] = 1; 
		}
	}
	matrix.prototype.draw = function(){
		//drawing the characters
		//Black BG for the canvas
		//translucent BG to show trail
		this.ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
		this.ctx.fillRect(0, 0, this.c.width, this.c.height );
		this.ctx.fillStyle = "#0F0"; //green text
		this.ctx.font = this.font_size + "px arial";
		//looping over drops
		for(let i = 0; i < this.drops.length; i++){
			//a random chinese character to print
			var text = this.chinese[Math.floor(Math.random()*this.chinese.length)];
			//x = i*font_size, y = value of drops[i]*font_size
			this.ctx.fillText(text, i*this.font_size, this.drops[i]*this.font_size);
			
			//sending the drop back to the top randomly after it has crossed the screen
			//adding a randomness to the reset to make the drops scattered on the Y axis
			if(this.drops[i]*this.font_size > this.c.height  && Math.random() > 0.975){
				this.drops[i] = 0;				
			}			
			//incrementing Y coordinate
			this.drops[i]++;
		}
	}
	
	new matrix();
	
})();