/*
	Pour tester, lancer la commande "babel-node main.es6.js"

	Il faut avoir installé : 
	 - nodejs ;
	 - npm ;
	 - les modules listés dans package.json ;
	 - babel
	 - stylus
*/

'use strict';

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

//Pour les requêtes POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Le répertoire /static/ est considéré comme statique
app.use("/static", express['static'](__dirname + "/static"));
//Les vues sont stockées dans /views
app.set('views', __dirname + '/views');
//Les vues sont en jade, préprocesseur pour HTML
app.set('view engine', 'jade');

var pages = [{
	url: 'index',
	icon: 'home',
	title: 'Accueil'
}, {
	url: 'calender',
	icon: 'calendar',
	title: 'Planning'
}, {
	url: 'documents',
	icon: 'book',
	title: 'Cours'
}, {
	url: 'tutoring',
	icon: 'graduation-cap',
	title: 'Tutorat'
}, {
	url: 'sign-in',
	icon: 'sign-in',
	title: 'Connexion'
}];

app.get('/', function (req, res) {
	res.redirect("/index");
});
app.get('/:page', function (req, res) {
	if (pages.find(function (page) {
		return page.url == req.params.page;
	})) res.render("index.jade", {
		pages: pages.map(function (page) {
			return {
				url: page.url,
				title: page.title,
				icon: page.icon,
				isActive: page.url == req.params.page
			};
		}),
		page: req.params.page
	});else res.redirect("/index");
});

app.listen(8080);
//# sourceMappingURL=main.js.map
