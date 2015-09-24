var app = angular.module('app',[]);

app.controller('sign-in', function($scope) {
	$scope.connexionScreen = (window.location.hash!="#sign-up");
	$scope.gender = ["Monsieur", "Madame"];
	console.log($scope.gender);
	$scope.form = {
		surname: '',
		name: '',
		birthDate: new Date(1994, 1, 1),
		phone: {
			fixe: '',
			portable: ''
		},
		address: {
			plain: '',
			postalCode: '',
			city: ''
		},
		email: {
			perso: '',
			university: ''
		},
		complement: {
			inscription: '',
			inscriptionLastYear: '',
			experienceAssosDetails: '',
			ideeProjetsDetails: '',
			activeRoleDetails: ''
		}
	};



	// form.surname
	// form.name
	// form.birthDate
	// form.gender
	// form.phone.fixe
	// form.phone.portable
	// form.address.plain
	// form.address.postalCode
	// form.address.city
	// form.email.perso
	// form.email.university
	// form.complement.inscription
	// form.complement.inscriptionLastYear
	// form.complement.experienceAssosDetails
	// form.complement.ideeProjetsDetails
	// form.complement.activeRoleDetails

	console.log($scope);
});