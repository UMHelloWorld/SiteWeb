'use strict';

module.exports = function (express, context) {
	var router = express.Router({ mergeParams: true });
	var connection = context.connection;

	router.route('/').get(function (req, res) {
		connection.query('SELECT * FROM Course', function (err, results) {
			res.json(results.map(function (o) {
				return {
					id: +o.id,
					idFormation: +o.idFormation,
					semester: +o.semester,
					codeUE: o.codeUE,
					name: o.name,
					description: o.description,
					linkENT: o.linkENT,
					tutorat: +o.tutorat
				};
			}));
		});
	});

	return router;
};
//# sourceMappingURL=main.js.map
