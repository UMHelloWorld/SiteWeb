'use strict';

module.exports = function (express, context) {
	var router = express.Router({ mergeParams: true });
	var connection = context.connection;

	router.route('/').get(function (req, res) {
		connection.query(context.queries.getDocumentsWithCourseInfo, function (err, results) {
			res.json(results.map(function (o) {
				return {
					id: +o.id,
					courseId: +o.courseId,
					name: o.name,
					tags: o.tags.split('|'),
					courseName: o.courseName,
					courseCodeUE: o.courseCodeUE
				};
			}));
		});
	});

	return router;
};
//# sourceMappingURL=main.js.map
