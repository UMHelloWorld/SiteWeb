var PDF;
var dim = {w: 0, h: 0};
var scopePdfViewer;

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
            "$$hashKey": "object:5"
        },
        {
            "from": 0.5099545724465558,
            "to": 0.5599501187648457,
            "startX": 0.3055555555555555,
            "endX": 0.5,
            "$$hashKey": "object:12"
        },
        {
            "from": 0.5599501187648457,
            "to": 0.5699492280285036,
            "startX": 0.1111111111111111,
            "endX": 0.611111111111111,
            "$$hashKey": "object:19"
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
                list: [comment]
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
                        if(isIn(A, B.from) || isIn(A, B.to)){
                            if(A.from >= B.from)
                                A.from = B.from;
                            if(A.to <= B.to)
                                A.to = B.to;
                            B.list.forEach(function(o){
                                if(A.list.indexOf(o)==-1)
                                    A.list.push(o);
                            });
                            console.log('!!');
                            $scope.areas.splice(j, 1);
                            change = true;
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
    draw(6);
});

var R = function(TR){
    // $("#pdfPlace").width($("#pdfPlace").width() + 50);
    draw(6, TR);
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

        var quality = 2;
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

$(function(){
    var isActive = false;
    var start = {x: 0, y: 0};
    var end = {x: 0, y: 0};
    var grid = {w: 36, h: 100};
    var needUpdate = false;
    var routine = null;
    $('#makeComment').click(function(e){
        isActive = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if((start.y - end.y)<5 && (end.x - start.x)<5)
            return;
        getRealCoords();
        scopePdfViewer.comments.push({
            from: start.realY / dim.h,
            to: end.realY / dim.h,
            startX: start.realX / dim.w,
            endX: end.realX / dim.w,
        });
        scopePdfViewer.safeApply();
        clearInterval(routine);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
    $('#makeComment').mousedown(function(e){
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
        start.realX = Math.floor(start.x/deltaX) * deltaX;
        start.realY = Math.floor(start.y/deltaY) * deltaY;
        end.realX = Math.ceil(end.x/deltaX) * deltaX;
        end.realY = Math.ceil(end.y/deltaY) * deltaY;
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