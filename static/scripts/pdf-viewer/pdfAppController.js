app.controller('pdf-app', function($scope, $http) {
    scopePdfApp = $scope;
    $scope.currentPdfPage = -1;
    $scope.displayComments = true;
    $scope.ableToDrawComment = false;

    $scope.resizing = false;
    var oldW = 0;
    $scope.resize = function(e, started, negative){
    	$scope.resizing = true;
    	if(started){
    		var x = e.offsetX * (negative ? -1 : 1) + $('#rightPanel').offset().left;
    		resizeLeftPanel(x);
    	}else
    		oldW = $('#rightPanel').offset().left;
    	e.stopPropagation();
    	return false;
    }
    $scope.finishResize = function(e){
    	if($('#rightPanel').offset().left<10)
    		resizeLeftPanel(oldW);
    	$scope.resizing = false;
    	$scope.drawPdf();
    }

    function resizeLeftPanel(w){
        $('#rightPanel').css('left', w);
        $('#leftPanel').css('width', w);
    };
});


app.controller('right-panel', function($scope, $http) {

});