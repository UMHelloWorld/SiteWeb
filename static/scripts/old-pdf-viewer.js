// Fetch the PDF document from the URL using promises
//

PDFJS.getDocument('/static/other/poly.pdf').then(function(pdf) {
  // Using promise to fetch the page
  pdf.getPage(6).then(function(page) {
    var scale = 1.5;
    var viewport = page.getViewport(scale);

    //
    // Prepare canvas using PDF page dimensions
    //
    var canvas = document.getElementById('pdf');
    var context = canvas.getContext('2d');

    //- canvas.height = viewport.height;
    //- canvas.width = viewport.width;



    canvas.height = viewport.height;
    canvas.width = viewport.width;

    var ratio = 2;

    var oldWidth = canvas.width;
    var oldHeight = canvas.height;

    canvas.width = oldWidth * ratio;
    canvas.height = oldHeight * ratio;

    canvas.style.width = oldWidth + 'px';
    canvas.style.height = oldHeight + 'px';

    context.scale(ratio, ratio);

    //- context.scale(0.5, 0.5);
    //- context.fillStyle = "white";
    //- context.fillRect(0, 0, canvas.width, canvas.height);

    //
    // Render PDF page into canvas context
    //
    var renderContext = {
      canvasContext: context,
      viewport: viewport
    };
    //- page.render(renderContext);



    // var canvasOffset = $(canvas).offset();
    // var $textLayerDiv = jQuery("<div />")
    //   .addClass("textLayer")
    //   .css("height", viewport.height + "px")
    //   .css("width", viewport.width + "px")
    //   .offset({
    //       top: canvasOffset.top,
    //       left: canvasOffset.left
    //   });

    // $("body").append($textLayerDiv);

    page.getTextContent().then(function(textContent) {
    	console.log("textContent");
    	console.log(textContent);

    	// var textLayer = new TextLayerBuilder($textLayerDiv.get(0), 0); //The second zero is an index identifying
    	                                                               //the page. It is set to page.number - 1.
    	// textLayer.setTextContent(textContent);

    	var renderContext = {
    		canvasContext: context,
    		viewport: viewport
    	};
    	page.render(renderContext).then(function(){
    		//- console.log('rendered', textContent.items[0]);
    		//- context.fillStyle = 'rgba(255, 0, 0, 0.3)';
    		//- var currentMat = math.matrix([
    		//- 	[viewport.transform[0], viewport.transform[2], viewport.transform[4]],
    		//- 	[viewport.transform[1], viewport.transform[3], viewport.transform[5]],
    		//- 	[0, 0, 1],
    		//- ]);
    		//- context.transform(viewport.transform[0], viewport.transform[1], viewport.transform[2], viewport.transform[3], viewport.transform[4], viewport.transform[5]);
    		//- textContent.items.forEach(function(o){
    		//- 	context.save();
    		//- 	currentMat = math.multiply(currentMat, [
    		//- 		[1, o.transform[1], 1],
    		//- 		[o.transform[2], o.transform[4], o.transform[5]],
    		//- 		[0, 0, 1]
    		//- 	]);
    		//- 	context.transform(1, o.transform[1], o.transform[2], 1, o.transform[4], o.transform[5]);

    		//- 	//- console.log(currentMat);
    		//- 	//- console.log(o);
    		//- 	var style = textContent.styles[o.fontName];
    		//- 	context.font = 1 + 'px ' + style.fontFamily;
    		//- 	context.fillRect(0, 0, o.width, o.height);
    		//- 	// context.fillRect(o.transform[4], o.transform[5], 100, 10);
    		//- 	context.restore();
    		//- });
    	});
    });
  });
});