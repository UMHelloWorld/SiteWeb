/*
	Pour tester, lancer la commande "babel-node main.es6.js"

	Il faut avoir installé : 
	 - nodejs ;
	 - npm ;
	 - les modules listés dans package.json ;
	 - babel
	 - stylus
*/
require("core-js");

let express = require('express');
let bodyParser = require('body-parser');
let session = require('express-session');

let generateSecretSession = (old) => {
	let r = (old||'') + parseInt(Math.random()*100000000).toString(36);
	return (r.length<25) ? generateSecretSession(r) : r;
};

let getSecretSession = () => {
	let value = '';
	try{
		value = require('fs').readFileSync('session-secret').toString();
	}catch(e){}
	if(value==''){
		value = generateSecretSession();
		require('fs').writeFileSync('session-secret', value);
	}
	return value;
};
let sha1sum = (input) => require('crypto').createHash('sha1').update(input).digest('hex');

let mysql      = require('mysql');
let connection = mysql.createConnection(JSON.parse(require('fs').readFileSync('config-mysql.json').toString()));
connection.connect();

let app = express();
app.set('trust proxy', 1);
app.use(session({
	secret: getSecretSession(),
	resave: false,
	saveUninitialized: false
}))

//Pour les requêtes POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Le répertoire /static/ est considéré comme statique
app.use("/static", express.static(__dirname + "/static"));
//Les vues sont stockées dans /views
app.set('views', __dirname + '/views')
//Les vues sont en jade, préprocesseur pour HTML
app.set('view engine', 'jade');

let pages = [
	{
		url: 'index',
		icon: 'home',
		title: 'Accueil',
		need: []
	},
	{
		url: 'calendar',
		icon: 'calendar',
		title: 'Planning',
		need: []
	},
	{
		url: 'documents',
		icon: 'book',
		title: 'Cours',
		need: []
	},
	{
		url: 'tutoring',
		icon: 'graduation-cap',
		title: 'Tutorat & entraide',
		need: []
	},
	{
		url: 'sign-in',
		icon: 'sign-in',
		title: 'Connexion',
		need: ['not-connected']
	},
	{
		url: 'sign-out',
		icon: 'sign-out',
		title: 'Déconnexion',
		need: ['connected']
	},
];


app.get('/', (req, res) => {
	res.redirect("/index");
});


let queries = {};
[
	'getTopics',
	'getDocumentsWithCourseInfo'
].forEach((name) => {queries[name] = require('fs').readFileSync('./sql/'+name+'.sql').toString()});

app.use('/api', require('./api/main.js')(express, {connection: connection, queries: queries}));

app.get('/forum/', (req, res) => {
	connection.query(queries.getTopics, function(err, results){
		render(req, res, 'tutoring', {
			showForum: true,
			showTopic: true,
			topics: results.map(r => 
				({
					id: +r.id,
					annotationId: +r.annotationId,
					userId: +r.userId,
					title: r.title,
					solved: Boolean(r.solved),
					validAnswer: Boolean(r.validAnswer)
				})
			)
		});
	});
});

function render(req, res, page, params){
	res.render("index.jade", 
		{
			pages: pages.filter((page) => page.need.filter((requirement) => {
				if(requirement=='connected' && req.session.connected)
					return false;
				if(requirement=='not-connected' && !req.session.connected)
					return false;
				return true;
			}).length==0).map(
				(page) => ({
					url: page.url,
					title: page.title,
					icon: page.icon,
					isActive: (page.url==page)
				})
			),
			page: page,
			params: params || {},
			urlParams: req.params,
			dbg: JSON.stringify(params)
		}
	);
}


app.get('/sign-out', (req, res) => {
	req.session.destroy();
	res.redirect('/');
});

app.post('/sign-in', (req, res) => {
	console.log(req.body);
	if(!req.body.mail || !req.body.password)
		return res.redirect('/sign-in');
	connection.query('SELECT * FROM User WHERE (email_perso = ? OR email_university = ?) AND password = UNHEX(?) LIMIT 1', [
			req.body.mail, req.body.mail, sha1sum(req.body.password)
		], function(err, result){
			if(result.length){
				req.session.connected = true;
				Object.assign(req.session, result.pop());
			}
			console.log(req.session);
			res.redirect(req.session.connected ? 'home' : 'sign-in');
		}
	);
});

app.get('/documents', (req, res) =>		 res.redirect('/documents/list'));
app.get('/documents/list', (req, res) => render(req, res, 'documents', { display: 'list' }) );
app.get('/course/:id-:codeUE', (req, res) => {
	connection.query('SELECT * FROM Course WHERE id = ?', [+req.params.id], (err, results) => {
		if(results.length==0)
			return res.redirect('/404/ue');
		let course = results.pop();
		connection.query('SELECT * FROM Document WHERE courseId = ?', [+course.id], (err, results) => {
			console.log(err, results);
			render(req, res, 'documents', { display: 'ue', documents: results.map(function(o){
				o.tags = o.tags.split('|');
				return o;
			}), course: course });
		})
	});
});
app.get('/document/:id-:name', (req, res) => {
	connection.query('SELECT * FROM Document WHERE id = ?', [+req.params.id], (err, results) => {
		if(results.length==0)
			return res.redirect('/404/doc');
		let doc = results.pop();
		doc.tags = doc.tags.split('|');
		render(req, res, 'documents', { display: 'pdf', document: doc, documentStr: JSON.stringify(doc) });
	});
});

app.get('/:page', (req, res) => {
	if(req.params.page=='tutoring')
		return res.redirect('/forum');
	if(pages.find((page) => page.url==req.params.page))
		render(req, res, req.params.page);
	else
		res.redirect("/index");
});

app.listen(5765);
