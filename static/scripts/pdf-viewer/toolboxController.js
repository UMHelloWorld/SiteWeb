app.controller('toolbox', function($scope, $http) {
    $scope.isFunction = angular.isFunction;
    console.log($scope);
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
            pressed: function(){return $scope.$parent.ableToDrawComment;},
            onPress: function(action){
            },
            changeState: function(action){
                $scope.$parent.ableToDrawComment = !$scope.$parent.ableToDrawComment;
                if($scope.$parent.ableToDrawComment)
                    $scope.$parent.unselectArea();
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
            }
        },
        {
            icon: 'arrow-circle-down',
            label: '',
            pressed: null,
            onPress: function(action){
                $scope.$parent.currentPdfPage++;
            }
        }
    ];
    $scope.press = function(action){
        action.onPress(action, !action.pressed);
        if(action.pressed===null)
            return false;
        if(!angular.isFunction(action.pressed))
           action.pressed = !action.pressed;
        ((action.changeState || [])[+action.pressed] || action.changeState || Function())(action, +action.pressed);
    }
});