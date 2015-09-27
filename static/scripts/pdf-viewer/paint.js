window.paintify = function(div) {
	//http://codetheory.in/html5-canvas-drawing-lines-with-smooth-edges/

	var canvasBackground = $(div).find('canvas')[0];
	var canvas = document.createElement('canvas');
	div.appendChild(canvas);
	var ctx = canvas.getContext('2d');
	
	var div_style = getComputedStyle(canvasBackground);
	canvas.width = parseInt(div_style.getPropertyValue('width'));
	canvas.height = parseInt(div_style.getPropertyValue('height'));
	
	// Creating a tmp canvas
	var tmp_canvas = document.createElement('canvas');
	var tmp_ctx = tmp_canvas.getContext('2d');
	tmp_canvas.width = canvas.width;
	tmp_canvas.height = canvas.height;
	
	div.appendChild(tmp_canvas);

	tmp_canvas.style.zIndex = 100;
	canvas.style.zIndex = 99;

	var mouse = {x: 0, y: 0};
	var last_mouse = {x: 0, y: 0};
	

	// Pencil Points
	var ppts = [];
	
	/* Mouse Capturing Work */
	tmp_canvas.addEventListener('mousemove', function(e) {
		mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
		mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;
	}, false);
	
	
	/* Drawing on Paint App */
	var pencilName = "";
	var size = 1;
	tmp_ctx.lineWidth = 1;
	tmp_ctx.lineJoin = 'round';
	tmp_ctx.lineCap = 'round';
	tmp_ctx.strokeStyle = 'black';
	tmp_ctx.fillStyle = 'black';
	
	tmp_canvas.addEventListener('mousedown', function(e) {
		tmp_canvas.addEventListener('mousemove', onPaint, false);
		
		mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
		mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;
		
		ppts.push({x: mouse.x, y: mouse.y});
		
		onPaint();
	}, false);
	
	tmp_canvas.addEventListener('mouseup', function() {
		tmp_canvas.removeEventListener('mousemove', onPaint, false);
		
		// Writing down to real canvas now
		ctx.drawImage(tmp_canvas, 0, 0);
		// Clearing tmp canvas
		tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
		
		// Emptying up Pencil Points
		ppts = [];
	}, false);

	var erase = function(x, y){
		var coef = 2;
		ctx.clearRect(x - size * coef, y - size * coef, size * coef * 2, size * coef * 2);
	}
	
	var onPaint = function() {
		if(pencilName=='eraser')
			return erase(mouse.x, mouse.y);

		// Saving all the points in an array
		ppts.push({x: mouse.x, y: mouse.y});
		
		if (ppts.length < 3) {
			var b = ppts[0];
			tmp_ctx.beginPath();
			//ctx.moveTo(b.x, b.y);
			//ctx.lineTo(b.x+50, b.y+50);
			tmp_ctx.arc(b.x, b.y, tmp_ctx.lineWidth / 2, 0, Math.PI * 2, !0);
			tmp_ctx.fill();
			tmp_ctx.closePath();
			
			return;
		}
		
		// Tmp canvas is always cleared up before drawing.
		tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
		
		tmp_ctx.beginPath();
		tmp_ctx.moveTo(ppts[0].x, ppts[0].y);
		
		for (var i = 1; i < ppts.length - 2; i++) {
			var c = (ppts[i].x + ppts[i + 1].x) / 2;
			var d = (ppts[i].y + ppts[i + 1].y) / 2;
			
			tmp_ctx.quadraticCurveTo(ppts[i].x, ppts[i].y, c, d);
		}
		
		// For the last 2 points
		tmp_ctx.quadraticCurveTo(
			ppts[i].x,
			ppts[i].y,
			ppts[i + 1].x,
			ppts[i + 1].y
		);
		tmp_ctx.stroke();
		
	};
	
	update = function(){
		tmp_ctx.lineWidth = size * ((pencilName=="highlighter") ? 4 : 1);
	}
	var changeColor
	return {
		changeColor: (changeColor = function(color){
			tmp_ctx.strokeStyle = tmp_ctx.fillStyle = color;
			update();
		}),
		changeSize: function(s){
			size = s;
			update();
		},
		use: function(alpha, name, color){
			if(color)
				changeColor(color);
			pencilName = name;
			tmp_ctx.globalAlpha = alpha;
			update();
		}
	}
};
