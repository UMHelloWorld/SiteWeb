window.CanvasFunctions = {
    makeCanvas: function(width, height, realWidth, quality, useOldCanvas){
        var canvas = useOldCanvas || document.createElement('canvas');
        var ratio = realWidth / width;
        width *= ratio;
        height*= ratio;
        width = parseInt(width);
        height = parseInt(height);
        canvas.width    = width * quality;
        canvas.height   = height * quality;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        return {canvas: canvas, ratio: ratio};
    },
    makePdfCanvas: function(PDF, pageNumber, realWidth, quality, useOldCanvas, callback){
        PDF.getPage(pageNumber).then(function(page) {
            var viewport    = page.getViewport(1.5);
            var data = {
                width: viewport.width,
                height: viewport.height,
                realWidth: realWidth,
                quality: quality
            };
            var res = CanvasFunctions.makeCanvas(viewport.width, viewport.height, realWidth, quality, useOldCanvas);
            var context     = res.canvas.getContext('2d');
            context.scale(res.ratio * quality, res.ratio * quality);
            data.canvas = res.canvas;
            data.ratio = res.ratio;
            callback({
                render: function(callback){
                    page.render({canvasContext: context, viewport: viewport}).then((callback||Function).bind(null, data));
                },
                data: data
            });
        });
    },
    drawPdfOn: function(PDF, page, canvas, sourceRectPercent, destRect, initialQuality){
        var x   = parseInt(((destRect||{}).x || 0));
        var y   = parseInt(((destRect||{}).y || 0));
        var w   = parseInt(((destRect||{}).w || canvas.width));
        var h   = parseInt(((destRect||{}).h || canvas.height));
        CanvasFunctions.makePdfCanvas(PDF, page, 1000, initialQuality, null, function(o){
            var ctx = canvas.getContext('2d');
            o.render(function(PDF){
                var sx  = parseInt(((sourceRectPercent||{}).x || 0) * PDF.canvas.width);
                var sy  = parseInt(((sourceRectPercent||{}).y || 0) * PDF.canvas.height);
                var sw  = parseInt(((sourceRectPercent||{}).w || 1) * PDF.canvas.width);
                var sh  = parseInt(((sourceRectPercent||{}).h || 1) * PDF.canvas.height);
                console.log(PDF, sx, sy, sw, sh, x, y, w, h);
                ctx.drawImage(PDF.canvas, sx, sy, sw, sh, x, y, w, h);
            });
        });
    }
};