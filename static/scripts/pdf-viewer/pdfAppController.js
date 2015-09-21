function textAreaAdjust(o) {
    o.style.height = "1px";
    o.style.height = (25+o.scrollHeight)+"px";
}
function enableTab(el) {
    el.onkeydown = function(e) {
        if (e.keyCode === 9) {

            // get caret position/selection
            var val = this.value,
                start = this.selectionStart,
                end = this.selectionEnd;

            // set textarea value to: text before caret + tab + text after caret
            this.value = val.substring(0, start) + '\t' + val.substring(end);

            // put caret at right position again
            this.selectionStart = this.selectionEnd = start + 1;

            // prevent the focus lose
            return false;
        }else if(e.keyCode === 13){
			var val = this.value,
			    start = this.selectionStart,
			    end = this.selectionEnd;
			var before = val.substring(0, start);
			var last = before.lastIndexOf('\n')+1;
			if(last){
				var found = ((before.substring(last).match(/^\r?\t*/g)||[])[0]||"");
				if(found){
					this.value = before + '\n' + found + val.substring(end);
					this.selectionStart = this.selectionEnd = start + 1 + found.length;
					return false;
				}
			}
        }
    };
}
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
	$scope.description = [
							"# Message fantastique",
							"```",
							"void main(){",
							"	return 0;",
							"}",
							"```",
							"-----------------",
							"On a $\\lambda = 12$, bla, $v_1=(1, 1, 123i+9)$, donc bla bla :",
							"$$",
							"  A-X = \\left(\\begin{array}{ccc}",
							"    1-X & 2 & 4 \\\\\\ ",
							"    1 & 8-X & 4 \\\\\\ ",
							"    2 & 2 & 10-X",
							"  \\end{array}\\right)",
							"$$",
							"Bla bla",
							"$$\\int_8^x \\cos{\\frac{8x-x^2+3x^3+1}{2x^2+10}}dx$$",
						].join('\n');
	$scope._description = $scope.description;
	
	var refreshTimerActive = false;
	var timerId = 0;
	var compileLaTeX = function(){
		$scope._description = $scope.description+'';
		$scope.$$postDigest(function(){MathJax.Hub.Queue(["Typeset",MathJax.Hub])});
		refreshTimerActive = false;
		$scope.safeApply();
	}
	$scope.descriptionRefresh = function(){
		if(timerId)
			clearInterval(timerId);
		timerId = setInterval(function(){
			compileLaTeX();
		}, 700);
	}
    $scope.safeApply = function(fn) {var phase = this.$root.$$phase;if(phase == '$apply' || phase == '$digest') { if(fn && (typeof(fn) === 'function')) {fn();} } else {this.$apply(fn);}};
});