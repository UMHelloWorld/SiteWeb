module.exports = (express, context) => {
	var APIs = ['documents', 'courses'];

	var apiRouter = express.Router({mergeParams: true});
	APIs.forEach((API) => {
		apiRouter.use('/'+API, require('./'+API+'/main.js')(express, context));
	});
	return apiRouter;
};