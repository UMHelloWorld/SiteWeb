var app = angular.module('app',[]);

app.controller('documents', function($scope, $http) {
	
});
app.controller('list-documents', function($scope, $http) {
	$scope.activeTab = 0;

	$scope.search = '';
	$scope.UEs = [
		{name: 'Algèbre linéaire & théorie des groupes', code: 'HLMA501'},
		{name: 'Combinatoire énumérative', code: 'HLMA504'},
		{name: 'Algorithmique des graphes', code: 'HLIN501'},
		{name: 'Anglais S5', code: 'HLLV501'},
		{name: 'Langages Formels', code: 'HLIN502'},
		{name: 'Modélisation et programmation par objet', code: 'HLIN505'},
		{name: 'Concepts et programmation système', code: 'HLIN504'},
		{name: 'Réseaux', code: 'HLIN503'},
		{name: 'Techniques de com & conduite de projets', code: 'HLIN506'},
	];
	$scope.searchChanged = function(){

	}
});