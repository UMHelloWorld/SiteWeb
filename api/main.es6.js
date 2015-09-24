module.exports = (express, context) => {
	var APIs = ['documents'];

	// Object.assign(context, {
	// 	mysql: null
	// });
	var apiRouter = express.Router({mergeParams: true});
	APIs.forEach((API) => {
		apiRouter.use('/'+API, require('./'+API+'/main.js')(express, context));
	});
	return apiRouter;
};