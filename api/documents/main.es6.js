module.exports = (express, context) => {
	let router = express.Router({mergeParams: true});
	let connection = context.connection;

	router.route('/').get(function(req, res){
		connection.query(context.queries.getDocumentsWithCourseInfo, (err, results) => {
			res.json(results.map(o =>
				({
					id: +o.id,
					courseId: +o.courseId,
					name: o.name,
					tags: o.tags.split('|'),
					courseName: o.courseName,
					courseCodeUE: o.courseCodeUE
				})
			));
		});
	});

	return router;
};