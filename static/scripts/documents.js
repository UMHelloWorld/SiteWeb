var app = angular.module('app',[]);

app.controller('documents', function($scope, $http) {
	
});
app.controller('list-documents', function($scope, $http) {
	console.log($scope);
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

	$scope.UeTree = {
		name: '$root',
		content: [
			{
				name: "Licence 1",
				content: [
					{
						name: 'Semestre 1',
						content: [
							{name: 'Math S1', code: 'HLMA101'},
							{name: 'Info S1', code: 'HLIN101'}
						]
					},
					{
						name: 'Semestre 2',
						content: [
							{name: 'Math S2', code: 'HLMA201'},
							{name: 'Info S2', code: 'HLIN201'}
						]
					}
				]
			},
			{
				name: "Licence 2",
				content: [
					{
						name: 'Semestre 3',
						content: [
							{name: 'Math S3', code: 'HLMA301'},
							{name: 'Info S3', code: 'HLIN301'}
						]
					},
					{
						name: 'Semestre 4',
						content: [
							{name: 'Math S4', code: 'HLMA401'},
							{name: 'Info S4', code: 'HLIN401'}
						]
					}
				]
			},
			{
				name: "Licence 3",
				mine: true,
				content: [
					{
						name: 'Semestre 5',
						content: [
							{name: 'Math S5', code: 'HLMA501'},
							{name: 'Info S5', code: 'HLIN501'}
						]
					},
					{
						name: 'Semestre 6',
						content: [
							{name: 'Math S6', code: 'HLMA601'},
							{name: 'Info S6', code: 'HLIN601'}
						]
					}
				]
			},
		]
	};

	$scope.myDocuments = [];
	function importDocuments(){
		while($scope.myDocuments.length)
			$scope.myDocuments.pop();
		var process;
		(process=function(list, isMine){
			list.forEach(function(node){
				console.log(node.name, isMine);
				isMine = isMine || node.mine || false;
				if(node.content)
					process(node.content, isMine);
				else if(isMine)
					$scope.myDocuments.push(node);
			});
		})($scope.UeTree.content);
	}
	importDocuments();
	$scope.$watch('UeTree', importDocuments, true);

	$scope.currentNode = {
		parent: [],
		node: $scope.UeTree,
		path: [],
		goParent: function(n){
			if(!this.parent.length)
				return;
			n = (n-1) || 0;
			this.path.pop();
			this.node = this.parent.pop();
			if(n>0)
				goParent(+n);
		},
		goIn: function(node){
			if(node.content && this.node.content && this.node.content.indexOf(node)!=-1){
				this.parent.push(this.node);
				this.path.push(this.node=node);
			}
		}
	};


	$scope.searchChanged = function(){

	}
});