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

require("core-js");

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

var mysql = require('mysql');
var connection = mysql.createConnection(JSON.parse(require('fs').readFileSync('config-mysql.json').toString()));
connection.connect();

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
	url: 'calendar',
	icon: 'calendar',
	title: 'Planning'
}, {
	url: 'documents',
	icon: 'book',
	title: 'Cours'
}, {
	url: 'tutoring',
	icon: 'graduation-cap',
	title: 'Tutorat & entraide'
}, {
	url: 'sign-in',
	icon: 'sign-in',
	title: 'Connexion'
}];

app.use('/api', require('./api/main.js')(express));

app.get('/', function (req, res) {
	res.redirect("/index");
});

var queries = {
	getTopics: require('fs').readFileSync('./sql/getTopics.sql').toString()
};

app.get('/forum/', function (req, res) {
	console.log(queries.getTopics);
	connection.query(queries.getTopics, function (err, results) {
		console.log(results);
		render(req, res, 'tutoring', {
			showForum: true,
			showTopic: true,
			topics: results.map(function (r) {
				return {
					id: +r.id,
					annotationId: +r.annotationId,
					userId: +r.userId,
					title: r.title,
					solved: Boolean(r.solved),
					validAnswer: Boolean(r.validAnswer)
				};
			})
		});
	});
});

function render(req, res, page, params) {
	res.render("index.jade", {
		pages: pages.map(function (page) {
			return {
				url: page.url,
				title: page.title,
				icon: page.icon,
				isActive: page.url == page
			};
		}),
		page: page,
		params: params || {},
		dbg: JSON.stringify(params)
	});
}

app.get('/:page', function (req, res) {
	if (req.params.page == 'tutoring') return res.redirect('/forum');
	if (pages.find(function (page) {
		return page.url == req.params.page;
	})) render(req, res, req.params.page);else res.redirect("/index");
});

app.listen(5765);
//# sourceMappingURL=main.js.map
