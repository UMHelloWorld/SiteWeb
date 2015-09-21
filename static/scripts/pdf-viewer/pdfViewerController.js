app.controller('pdf-viewer', function($scope, $http) {
    window.debugScope = $scope;

    $scope.$parent.currentPdfPage;
    var PdfSource;
    var DefaultQuality = 1.4;

    var draw = function(){
        if($scope.$parent.currentPdfPage<0)
            return;
        CanvasFunctions.makePdfCanvas(PdfSource, $scope.$parent.currentPdfPage, +$("#pdfPlace").width(), DefaultQuality, $("#pdf")[0], function(o){
            o.render(Function);
        });
    }
    $scope.$parent.drawPdf = draw;

    PDFJS.getDocument('/static/other/poly.pdf').then(function(pdf){
        PdfSource = pdf;
        $scope.$watch('$parent.currentPdfPage', draw);
        $scope.$parent.currentPdfPage = 1;
        $scope.safeApply();
    });

    $scope.annotations = [{
        position: {
            relSX: 0.2,
            relSY: 0.2,
            relEX: 0.4,
            relEY: 0.3,
        },
        page: 1,
        show: true
    }];
    $scope.areas = [];
    var buildAreas = function(){
        while($scope.areas.length)
            $scope.areas.pop();

        $scope.annotations.forEach(function(o){
            $scope.areas.push({
                position: {relSX: o.relSX, relSY: o.relSY, relEX: o.relEX, relEY: o.relEY},
                page: o.page
            });
        });

        var change = true;
        var isIn = function(Obj, value){
            return (value >= Obj.relSY) && (value <= Obj.relEY);
        }
        var fusionFirst = function(){
            for(var i in $scope.areas){
                var A = $scope.areas[i];
                for(var j in $scope.areas){
                    if(i!=j){
                        var B = $scope.areas[j];
                        if((A.page==B.page) && (isIn(A, B.relSY) || isIn(A, B.relEY))){
                            A.relSY = Math.min(B.relSY, A.relSY);
                            A.relEY = Math.min(B.relEY, A.relEY);
                            B.list.forEach(function(o){
                                if(A.list.indexOf(o)==-1)
                                    A.list.push(o);
                            });
                            $scope.areas.splice(j, 1);
                            return true;
                        }
                    }
                }
            }
        }
        while(fusionFirst());
    };

    $scope.paint = {};
    $scope.$watch('annotations', buildAreas, true);
    buildAreas();

    $scope.getStyleForAnnotation = function(input){
        input._cache = input._cache || {};
        input._cache.left    = (input.position.relSX * 100)+'%';
        input._cache.top     = (input.position.relSY * 100)+'%';
        input._cache.width   = ((input.position.relEX-input.position.relSX) * 100)+'%';
        input._cache.height  = ((input.position.relEY-input.position.relSY) * 100)+'%';
        return input._cache;
    }
    var transformAnnotationBeingWriten = function(cache, real, doNotConvertPercent){
        var o = $("#pdfPlace");
        var gridSize = 10;
        var gridify = function(input, max){
            return (max ? Math.ceil:Math.floor)(input / gridSize) * gridSize;
        };
        var propr = ['SX','SY','EX','EY'];
        propr.forEach(function(attr){ real['rel'+attr] = cache['_rel'+attr]; })
        var swap = function(v){var tmp = real['relS'+v]; real['relS'+v] = real['relE'+v]; real['relE'+v] = tmp;};
        if(real.relSX > real.relEX) swap('X');
        if(real.relSY > real.relEY) swap('Y');
        if(doNotConvertPercent)
            return;
        propr.forEach(function(attr){
            real['rel'+attr] = gridify(real['rel'+attr], attr[0]=='E') / ((attr[1]=='X') ? o.width() : o.height());
        });
        real.relEX = Math.min(real.relEX, 1);
        real.relEY = Math.min(real.relEY, 1);
    }
    var writingAnnotationMoveSpecific = null;
    $scope.writingAnnotationMove = function(event){
        if(writingAnnotationMoveSpecific)
            writingAnnotationMoveSpecific(event.offsetX, event.offsetY);
    }
    var stopAnnotation = null;
    $scope.beginAnnotation = function(e){
        if($scope.$parent.ableToDrawComment)
            (stopAnnotation || Function)();
        var annotation = {position: {}, show: true, newOne: true}
        var pos = {};
        $scope.$parent.ableToDrawComment = true;
        pos._relSX = pos._relEX = e.offsetX;
        pos._relSY = pos._relEY = e.offsetY;
        var where = $scope.annotations.length;
        transformAnnotationBeingWriten(pos, annotation.position);
        $scope.annotations.push(annotation);
        writingAnnotationMoveSpecific = function(x, y){
            pos._relEX = x;
            pos._relEY = y;
            transformAnnotationBeingWriten(pos, annotation.position);
        }
        propagate_writingAnnotationMoveSpecific = function(x, y){
            transformAnnotationBeingWriten(pos, annotation.position, true);
            writingAnnotationMoveSpecific(annotation.position.relSX + x, annotation.position.relSY + y)
        }
        stopAnnotation = function(){
            var o = $("#pdfPlace");
            writingAnnotationMoveSpecific = propagate_writingAnnotationMoveSpecific = null;
            var normalWidth = 1000;
            var nomralWidthCalc = (annotation.position.relEX - annotation.position.relSX) * normalWidth;
            var width = parseInt((annotation.position.relEX - annotation.position.relSX) * o.width());
            var height = parseInt((annotation.position.relEY - annotation.position.relSY) * o.height());

            var getCanvas = function(){
                var myCanvas = CanvasFunctions.makeCanvas(width, height, nomralWidthCalc, DefaultQuality);
                CanvasFunctions.drawPdfOn(PdfSource, $scope.$parent.currentPdfPage, myCanvas.canvas, {
                    x: annotation.position.relSX,
                    y: annotation.position.relSY,
                    w: (annotation.position.relEX - annotation.position.relSX),
                    h: (annotation.position.relEY - annotation.position.relSY)
                }, {}, DefaultQuality);
                return myCanvas;
            }
            myCanvas = getCanvas();

            var div = document.createElement('div');
            div.className = "paintArea";
            div.appendChild(myCanvas.canvas);
            $('body').append(div);
            $(div).css('position', 'absolute');
            $(div).css('left', $('#pdf').offset().left + annotation.position.relSX*o.width());
            $(div).css('top', $('#pdf').offset().top + annotation.position.relSY*o.height());
            $(div).css('z-index', '2000');
            // $(div).css('width', width);
            // $(div).css('height', height);
            $(div).css('background-color', 'white');
            $(div).css('transform-origin', 'left top');
            $(div).css('transform', 'scale('+(1/myCanvas.ratio)+')');
            $scope.$parent.ableToDrawComment = 'composing';
            var recept = $('#rightPanel .newComment .content .about .place div');
            recept.empty();
            recept.css('height', $(div).height());
            
            $(div).animate({
                left: recept.offset().left + recept.width()/2 - width/2,
                top: recept.offset().top,
                transform: 'scale(1)'
            }, 600, function(){
                var toDel = $('.paintArea');
                var div_inside = document.createElement('div');
                div_inside.className = "paintArea";
                div_inside.appendChild(getCanvas().canvas);
                $(div_inside).prependTo(recept);
                enableTab($('#rightPanel .writing textarea')[0]);
                textAreaAdjust($('#rightPanel .writing textarea')[0]);
                toDel.remove();
                // div.prependTo(recept);
                // $scope.$parent.paint = paintify(div);
                // console.log($scope.paint, $scope);
            });
            return $scope.annotations.pop();
        }
    }
    $scope.stopAnnotation = function(){
        // $scope.$parent.ableToDrawComment = false;
        (stopAnnotation || Function)();
        stopAnnotation = null;
    };
    var propagate_writingAnnotationMoveSpecific = null;
    $scope.propagate_writingAnnotationMove = function(e){
        if(propagate_writingAnnotationMoveSpecific)
            propagate_writingAnnotationMoveSpecific(e.offsetX, e.offsetY);
    };

    $scope.safeApply = function(fn) {var phase = this.$root.$$phase;if(phase == '$apply' || phase == '$digest') { if(fn && (typeof(fn) === 'function')) {fn();} } else {this.$apply(fn);}};
});







// $(function(){
//     var isActive = false;
//     var start = {x: 0, y: 0};
//     var end = {x: 0, y: 0};
//     var grid = {w: 36, h: 100};
//     var needUpdate = false;
//     var routine = null;
//     $('#makeComment').click(function(e){
//         console.log("XXXXXX");
//         isActive = false;
//         ctx.clearRect(0, 0, canvas.width, canvas.height);
//         getRealCoords();
//         if(Math.abs(start.y - end.y)<5 && Math.abs(end.x - start.x)<5)
//             return;
//         var comment = {
//             from: start.realY / dim.h,
//             to: end.realY / dim.h,
//             startX: start.realX / dim.w,
//             endX: end.realX / dim.w,
//             // img: ctx.getImageData(start.realX, start.realY, end.realX - start.realX, end.realY - start.realY),
//             dim: [end.realX - start.realX, end.realY - start.realY],
//             visu: [start.realX, start.realY]
//         };
//         scopePdfApp.writeComment(comment);
//         // addComment(comment);
//         clearInterval(routine);
//         ctx.clearRect(0, 0, canvas.width, canvas.height);
//     });
//     $('#makeComment').mousedown(function(e){
//         if(!scopePdfApp.ableToDrawComment)
//             return;
//         start.x = +e.offsetX;
//         start.y = +e.offsetY;
//         end.x   = +e.offsetX;
//         end.y   = +e.offsetY;
//         isActive = true;
//         console.log('here i am');
//         routine = setInterval(draw, 1000/30);
//         return false;
//     });
//     $('#makeComment').mousemove(function(e){
//         if(!isActive)
//             return false;
//         if(+e.offsetX==end.x && +e.offsetY==end.y)
//             return false;
//         end.x   = +e.offsetX;
//         end.y   = +e.offsetY;
//         needUpdate = true;
//         return false;
//     });

//     var getRealCoords = function(){
//         var deltaX = canvas.width/grid.w;
//         var deltaY = canvas.height/grid.h;
//         var c = {
//             sx: (start.x <= end.x) ? start.x : end.x,
//             sy: (start.y <= end.y) ? start.y : end.y,
//             ex: (start.x <= end.x) ? end.x : start.x,
//             ey: (start.y <= end.y) ? end.y : start.y
//         }
//         start.realX = Math.floor(c.sx/deltaX) * deltaX;
//         start.realY = Math.floor(c.sy/deltaY) * deltaY;
//         end.realX = Math.ceil(c.ex/deltaX) * deltaX;
//         end.realY = Math.ceil(c.ey/deltaY) * deltaY;
//     }

//     var canvas = document.getElementById('makeComment');
//     var ctx = canvas.getContext('2d');
//     var drawAZone = function(startX,startY,endX,endY, fill, stroke){
//         ctx.fillStyle = fill || 'rgba(0, 200, 0, 0.30)';
//         ctx.strokeStyle = stroke || 'rgba(0, 0, 0, 0.30)';
//         ctx.clearRect(startX, startY, endX-startX, endY-startY);
//         ctx.fillRect(startX, startY, endX-startX, endY-startY);
//         ctx.strokeRect(startX, startY, endX-startX, endY-startY);
//     }
//     var draw = function(){
//         if(!needUpdate)
//             return;
//         needUpdate = false;
//         ctx.clearRect(0, 0, canvas.width, canvas.height);

//         getRealCoords();

//         // ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
//         // for(var i=0; i<canvas.height; i+=deltaX)
//         //     ctx.fillRect(0, i+deltaX/2, canvas.width, 1);
//         // for(var i=0; i<canvas.width; i+=deltaY)
//         //     ctx.fillRect(i+deltaY/2, 0, 1, canvas.height);


//         // ctx.fillStyle = 'rgba(0, 200, 0, 0.15)';
//         // ctx.fillRect(start.x, start.y, end.x-start.x, end.y-start.y);

//         drawAZone(start.realX,start.realY,end.realX,end.realY);
//     }
//     scopePdfViewer.clear = function(){
//         ctx.clearRect(0, 0, canvas.width, canvas.height);
//     }
//     scopePdfViewer.drawComment = function(o, colorFill, colorStroke){
//         drawAZone(o.startX * dim.w, o.from * dim.h, o.endX * dim.w, o.to * dim.h, colorFill, colorStroke);
//         return false;
//     };
//     scopePdfViewer.draw = function(area, colorFill, colorStroke){
//         area.list.forEach(function(o){
//             scopePdfViewer.drawComment(o, colorFill, colorStroke);
//         });
//     }
// })