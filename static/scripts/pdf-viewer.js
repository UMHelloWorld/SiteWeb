var PDF;
var dim = {w: 0, h: 0};
var scopePdfViewer;
window.disableScrollStuff = true;
var scopePdfApp;
var quality = 1.4;
var currentPdfPage = 1;

app.controller('pdf-app', function($scope, $http) {
    scopePdfApp = $scope;
    $scope.currentPdfPage = currentPdfPage;
    $scope.$watch('currentPdfPage', function(){
        currentPdfPage = $scope.currentPdfPage;
    });
    $scope.displayComments = true;
    $scope.ableToDrawComment = false;
});
app.controller('right-panel', function($scope, $http) {
    $scope.$parent.scopeRightPanel = $scope;
    $scope.mode = 'none';
    var getImage;
    $scope.sendComment = function(description){
        $scope.commentContent.description = description;
        $scope.commentContent.image = getImage();
        addComment($scope.commentContent);
        $scope.mode = 'none';
        getImage = null;
        $scope.commentContent = null;
        $('#rightPanel .here').empty();
    };
    $scope.$parent.writeComment = function(comment){
        $scope.mode = 'compose';
        $scope.commentContent = comment;
        comment.img;
        function getNewCanvas(id, setPos, doNotCopy){
            var canvas = document.createElement('canvas');
            if(id)
                canvas.id     = id;
            canvas.width  = comment.dim[0]*quality;
            canvas.height = comment.dim[1]*quality;
            canvas.style.width  = comment.dim[0];
            canvas.style.height = comment.dim[1];
            canvas.style.opacity = 1;
            if(setPos){
                canvas.style.zIndex   = 100000;
                canvas.style.position = "absolute";
                var origin = $(pdfPlace).offset();
                canvas.style.left = origin.left + comment.visu[0]+"px";
                canvas.style.top = origin.top + comment.visu[1]+"px";
                canvas.style.boxShadow   = "0px 0px 6px #666";
                canvas.style.borderRadius   = "5px";
            }else if(!doNotCopy){
                canvas.style.borderRadius   = "0px 0px 5px 5px";
                canvas.style.boxShadow   = "0px 0px 3px #CCC";
            }
            // canvas.getContext('2d').scale(1/quality, 1/quality);
            if(!doNotCopy)
                canvas.getContext('2d').drawImage(document.getElementById('pdf'), -parseInt(comment.visu[0]*quality)+0, -parseInt(comment.visu[1]*quality)+0);
            else{
                canvas.style.position = "absolute";
                canvas.style.top = "0px";
                canvas.style.left = "0px";
            }
            return canvas;
        }
        document.body.appendChild(getNewCanvas("NewCommentImage", true));
        var dest = $('#rightPanel').offset();
        $('#NewCommentImage').animate({
            left: dest.left,
            top: dest.top,
            opacity: 0
            // height: 80
        }, 400, function(){
            $('#NewCommentImage').remove();
            var drawZoneWithTools = document.createElement('div');
            drawZoneWithTools.style.width = comment.dim[0];
            drawZoneWithTools.innerHTML = [
                '<div class="toolbox-draw" style="box-shadow: 0px 0px 3px #CCC; border-radius: 5px 5px 0px 0px;">',
                    '<div class="tool-pencil" data-color="black"></div>',
                    '<div class="tool-pencil" data-color="red"></div>',
                    '<div class="tool-pencil yellow" data-color="rgb(243, 156, 18)" data-alpha="0.3"></div>',
                    '<div class="tool-pencil" data-color="erase"></div>',
                    '<div class="tool-pencil small" data-color="black"></div>',
                    '<div class="tool-pencil small" data-color="red"></div>',
                    '<div class="tool-pencil small yellow" data-color="rgb(243, 156, 18)" data-alpha="0.3"></div>',
                    '<div class="tool-pencil small" data-color="erase"></div>',
                    '<div class="tool-pencil small" data-color="delete-all"><i data-color="delete-all" style="color: red; position: relative; top: -10px;" class="fa fa-close"></i></div>',
                '</div>'
            ].join('');
            var canvasZone = document.createElement('div');
            canvasZone.style.position='relative';
            var currentCanvas = getNewCanvas();
            var drawingCanvas = getNewCanvas(null, null, true);
            canvasZone.appendChild(currentCanvas);
            canvasZone.appendChild(drawingCanvas);
            getImage = function(){
                currentCanvas.getContext('2d').drawImage(drawingCanvas, 0, 0);
                return currentCanvas.toDataURL();
            }
            drawZoneWithTools.appendChild(canvasZone);
            $('#rightPanel .here').empty();
            $('#rightPanel .here').append(drawZoneWithTools);
            $('#rightPanel .toolbox-draw .tool-pencil').click(function(e){
                console.log(e.target.dataset.color)
                if(e.target.dataset.color=="delete-all")
                    return context.clearRect(0, 0, comment.dim[0]*quality, comment.dim[1]*quality);
                context.globalAlpha = +(e.target.dataset.alpha || 1);
                eraser = e.target.dataset.color=="erase";
                var CN = e.target.className;
                isBig = (CN.indexOf('small')==-1)+((CN.indexOf('yellow')!=-1)*7);
                if(!eraser)
                    context.strokeStyle = e.target.dataset.color;
            });
            var isBig = true;
            var write = false;
            var eraser = false;
            var state = 0;
            var len = 5;
            var context = drawingCanvas.getContext('2d');
            // context.globalCompositeOperation = 'destination-atop';
            var _draw = function(e){
                var x = parseInt(e.offsetX*quality);
                var y = parseInt(e.offsetY*quality);
                if(eraser)
                    return context.clearRect(x-3-isBig*5, y-3-isBig*5, 6+isBig*10, 6+isBig*10);
                var thin = 1;
                if(state==len){
                    context.moveTo(x, y);
                }else
                    context.lineTo(x, y)
                if(state==0){
                    context.closePath();
                    context.fill();
                    context.stroke();
                    context.beginPath();
                }
                context.moveTo(x, y);
                state = (state-1)%(len+1);
                context.lineWidth = thin*(isBig*2+1);
            }
            $(drawingCanvas).mousedown(function(e){
                write = true;
                state = len;
                console.log(e);
                _draw(e);
                return false;
            });
            $(drawingCanvas).mousemove(function(e){
                if(write)
                    _draw(e);
                return false;
            });
            $(drawingCanvas).mouseup(function(e){
                write = false;
                if(state!=len){
                    context.closePath();
                    context.fill();
                    context.stroke();
                }
                return false;
            });
        });
        $scope.$apply();
    }
});

app.controller('toolbox', function($scope, $http) {
    $scope.actions = [
        {
            icon: 'file-pdf-o',
            label: 'Télécharger',
            pressed: null,
            onPress: function(action){
                alert('Todo');
            }
        },
        {
            icon: 'pencil',
            label: 'Poser une question',
            pressed: $scope.$parent.ableToDrawComment,
            onPress: function(action){
            },
            changeState: function(action, state){
                $scope.$parent.ableToDrawComment = Boolean(state);
            }
        },
        {
            icon: 'question',
            label: 'Voir les questions',
            pressed: $scope.$parent.displayComments,
            onPress: function(action){
            },
            changeState: function(action, state){
                $scope.$parent.displayComments = Boolean(state);
            }
        },
        {
            icon: 'arrow-circle-up',
            label: '',
            pressed: null,
            onPress: function(action){
                $scope.$parent.currentPdfPage--;
                draw($scope.$parent.currentPdfPage);
            }
        },
        {
            icon: 'arrow-circle-down',
            label: '',
            pressed: null,
            onPress: function(action){
                $scope.$parent.currentPdfPage++;
                draw($scope.$parent.currentPdfPage);
            }
        }
    ];
    $scope.press = function(action){
        action.onPress(action, !action.pressed);
        if(action.pressed===null)
            return false;
        action.pressed = !action.pressed;
        ((action.changeState || [])[+action.pressed] || action.changeState || Function())(action, +action.pressed);
    }
});
app.controller('pdf-viewer', function($scope, $http) {
    scopePdfViewer = $scope;
    $scope.comments = [];
    $scope.areas = [];
    [
        {
            "from": 0.14998663895486936,
            "to": 0.20998129453681708,
            "startX": 0.08333333333333331,
            "endX": 0.9166666666666665,
            page: 6
        },
        {
            "from": 0.5099545724465558,
            "to": 0.5599501187648457,
            "startX": 0.3055555555555555,
            "endX": 0.5,
            page: 6
        },
        {
            "from": 0.5599501187648457,
            "to": 0.5699492280285036,
            "startX": 0.1111111111111111,
            "endX": 0.611111111111111,
            page: 6
        }
    ].forEach(function(o){
        $scope.comments.push(o);
    });

    var buildAreas = function(){
        while($scope.areas.length)
            $scope.areas.pop();

        $scope.comments.forEach(function(comment){
            $scope.areas.push({
                from: comment.from,
                to: comment.to,
                list: [comment],
                page: comment.page
            });
        });

        var change = true;
        var isIn = function(Obj, value){
            return (value >= Obj.from) && (value <= Obj.to);
        }
        while(change){
            change = false;
            for(var i in $scope.areas){
                var A = $scope.areas[i];
                for(var j in $scope.areas){
                    if(i!=j){
                        var B = $scope.areas[j];
                        if((isIn(A, B.from) || isIn(A, B.to)) && (A.page==B.page)){
                            if(A.from >= B.from)
                                A.from = B.from;
                            if(A.to <= B.to)
                                A.to = B.to;
                            B.list.forEach(function(o){
                                if(A.list.indexOf(o)==-1)
                                    A.list.push(o);
                            });
                            $scope.areas.splice(j, 1);
                            change = true;
                            break;
                        }
                    }
                }
                if(change)
                    break;
            }
        }
    };

    $scope.$watch('comments', buildAreas, true);
    buildAreas();

    $scope.dim = dim;
    $scope.safeApply = function(fn) {
        var phase = this.$root.$$phase;
        if(phase == '$apply' || phase == '$digest') {
            if(fn && (typeof(fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };
});

PDFJS.getDocument('/static/other/poly.pdf').then(function(pdf){
    PDF = pdf;
    draw(currentPdfPage);
});

var R = function(TR){
    // $("#pdfPlace").width($("#pdfPlace").width() + 50);
    draw(currentPdfPage, TR);
}

var draw = function(page, TR){
    PDF.getPage(page).then(function(page) {
        var scale = 1.5;
        var viewport = page.getViewport(scale);

        var canvas = document.getElementById('pdf');
        var context = canvas.getContext('2d');

        var givenWidth = $("#pdfPlace").width();

        var ratio = givenWidth / viewport.width;

        viewport.width *= ratio;
        viewport.height *= ratio;

        canvas.width = viewport.width * quality;
        canvas.height = viewport.height * quality;

        canvas.style.width = viewport.width + 'px';
        canvas.style.height = viewport.height + 'px';

        var commentCanvas = document.getElementById('makeComment');
        commentCanvas.style.width = (commentCanvas.width = viewport.width) + 'px';
        commentCanvas.style.height = (commentCanvas.height = viewport.height) + 'px';

        dim.w = viewport.width;
        dim.h = viewport.height;

        console.log(ratio);
        context.scale(ratio * quality, ratio * quality);

        var renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        scopePdfViewer.safeApply();
        page.render(renderContext);
    });
}

function addComment(o){
    scopePdfViewer.comments.push({
        from: o.from,
        to: o.to,
        startX: o.startX,
        endX: o.endX,
        description: o.description,
        image: o.image,
        page: currentPdfPage
    });
    scopePdfViewer.safeApply();
}

$(function(){
    var isActive = false;
    var start = {x: 0, y: 0};
    var end = {x: 0, y: 0};
    var grid = {w: 36, h: 100};
    var needUpdate = false;
    var routine = null;
    $('#makeComment').click(function(e){
        console.log("XXXXXX");
        isActive = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        getRealCoords();
        if(Math.abs(start.y - end.y)<5 && Math.abs(end.x - start.x)<5)
            return;
        var comment = {
            from: start.realY / dim.h,
            to: end.realY / dim.h,
            startX: start.realX / dim.w,
            endX: end.realX / dim.w,
            // img: ctx.getImageData(start.realX, start.realY, end.realX - start.realX, end.realY - start.realY),
            dim: [end.realX - start.realX, end.realY - start.realY],
            visu: [start.realX, start.realY]
        };
        scopePdfApp.writeComment(comment);
        // addComment(comment);
        clearInterval(routine);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
    $('#makeComment').mousedown(function(e){
        if(!scopePdfApp.ableToDrawComment)
            return;
        start.x = +e.offsetX;
        start.y = +e.offsetY;
        end.x   = +e.offsetX;
        end.y   = +e.offsetY;
        isActive = true;
        console.log('here i am');
        routine = setInterval(draw, 1000/30);
        return false;
    });
    $('#makeComment').mousemove(function(e){
        if(!isActive)
            return false;
        if(+e.offsetX==end.x && +e.offsetY==end.y)
            return false;
        end.x   = +e.offsetX;
        end.y   = +e.offsetY;
        needUpdate = true;
        return false;
    });

    var getRealCoords = function(){
        var deltaX = canvas.width/grid.w;
        var deltaY = canvas.height/grid.h;
        var c = {
            sx: (start.x <= end.x) ? start.x : end.x,
            sy: (start.y <= end.y) ? start.y : end.y,
            ex: (start.x <= end.x) ? end.x : start.x,
            ey: (start.y <= end.y) ? end.y : start.y
        }
        start.realX = Math.floor(c.sx/deltaX) * deltaX;
        start.realY = Math.floor(c.sy/deltaY) * deltaY;
        end.realX = Math.ceil(c.ex/deltaX) * deltaX;
        end.realY = Math.ceil(c.ey/deltaY) * deltaY;
    }

    var canvas = document.getElementById('makeComment');
    var ctx = canvas.getContext('2d');
    var drawAZone = function(startX,startY,endX,endY, fill, stroke){
        ctx.fillStyle = fill || 'rgba(0, 200, 0, 0.30)';
        ctx.strokeStyle = stroke || 'rgba(0, 0, 0, 0.30)';
        ctx.clearRect(startX, startY, endX-startX, endY-startY);
        ctx.fillRect(startX, startY, endX-startX, endY-startY);
        ctx.strokeRect(startX, startY, endX-startX, endY-startY);
    }
    var draw = function(){
        if(!needUpdate)
            return;
        needUpdate = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        getRealCoords();

        // ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        // for(var i=0; i<canvas.height; i+=deltaX)
        //     ctx.fillRect(0, i+deltaX/2, canvas.width, 1);
        // for(var i=0; i<canvas.width; i+=deltaY)
        //     ctx.fillRect(i+deltaY/2, 0, 1, canvas.height);


        // ctx.fillStyle = 'rgba(0, 200, 0, 0.15)';
        // ctx.fillRect(start.x, start.y, end.x-start.x, end.y-start.y);

        drawAZone(start.realX,start.realY,end.realX,end.realY);
    }
    scopePdfViewer.clear = function(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    scopePdfViewer.drawComment = function(o, colorFill, colorStroke){
        drawAZone(o.startX * dim.w, o.from * dim.h, o.endX * dim.w, o.to * dim.h, colorFill, colorStroke);
        return false;
    };
    scopePdfViewer.draw = function(area, colorFill, colorStroke){
        area.list.forEach(function(o){
            scopePdfViewer.drawComment(o, colorFill, colorStroke);
        });
    }
})