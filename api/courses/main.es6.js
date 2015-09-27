module.exports = (express, context) => {
	let router = express.Router({mergeParams: true});
	let connection = context.connection;

	router.route('/').get(function(req, res){
		connection.query('SELECT * FROM Course', (err, results) => {
			res.json(results.map(o =>
				({
					id: +o.id,
					idFormation: +o.idFormation,
					semester: +o.semester,
					codeUE: o.codeUE,
					name: o.name,
					description: o.description,
					linkENT: o.linkENT,
					tutorat: +o.tutorat
				})
			));
		});
	});

	return router;
};