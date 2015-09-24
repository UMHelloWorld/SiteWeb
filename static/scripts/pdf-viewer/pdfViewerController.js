


app.controller('pdf-viewer', function($scope, $http, annotations) {
    window.debugScope = $scope;


    $scope.filterAnnotationsToShow = function(annotations) {
        return annotations.show || annotations._show;
    };

    $scope.selectedArea = -1;
    $scope.$parent.unselectArea = function(){
        $scope.selectedArea = -1;
    }
    $scope.$parent.isAreaUnselected = function(){
        return $scope.selectedArea==-1;
    }
    $scope.$watch('selectedArea', function(){
        var affectShow = function(toValue){return function(o){o.show = toValue}};
        $scope.annotations.forEach(affectShow(false));
        if($scope.selectedArea==-1)
            return;
        (($scope.areas[$scope.selectedArea]||[]).list||[]).forEach(affectShow(true));
    });

    $scope.$parent.currentPdfPage;
    var PdfSource;
    var DefaultQuality = 1.4;

    var lastRender = -1;
    var draw = function(){
        if($scope.$parent.currentPdfPage<1)
            $scope.$parent.currentPdfPage = 1;
        if($scope.$parent.currentPdfPage>PdfSource.numPages)
            $scope.$parent.currentPdfPage = PdfSource.numPages;
        lastRender = $scope.$parent.currentPdfPage;
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

    $scope.annotations = annotations;
    
    $scope.areas = [];
    var buildAreas = function(){
        while($scope.areas.length)
            $scope.areas.pop();

        $scope.annotations.forEach(function(o){
            $scope.areas.push({
                relSX: o.position.relSX, relSY: o.position.relSY, relEX: o.position.relEX, relEY: o.position.relEY,
                list: [o],
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
        input._cache.opacity = (input._show || input.newOne) ? 1 : 0.4;
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

            var getCanvas = function(callback){
                var myCanvas = CanvasFunctions.makeCanvas(width, height, nomralWidthCalc, DefaultQuality);
                CanvasFunctions.drawPdfOn(PdfSource, $scope.$parent.currentPdfPage, myCanvas.canvas, {
                    x: annotation.position.relSX,
                    y: annotation.position.relSY,
                    w: (annotation.position.relEX - annotation.position.relSX),
                    h: (annotation.position.relEY - annotation.position.relSY)
                }, {}, DefaultQuality, callback);
                return myCanvas;
            }
            var oAnnot = $scope.annotations.pop();
            myCanvas = getCanvas(function(canvas){
                oAnnot.image = canvas.toDataURL();
            });

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
                $scope.$parent.paint = paintify(div_inside);
                // console.log($scope.paint, $scope);
            });
            oAnnot.page = $scope.$parent.currentPdfPage;
            $scope.annotations.temp = oAnnot;
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

