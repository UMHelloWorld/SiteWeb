module.exports = (express, context) => {
	var APIs = ['documents'];
	var router = express.Router({mergeParams: true});

	router.route('/').get(function(req, res){
		res.end('YEP!');
	})

	return router;
};