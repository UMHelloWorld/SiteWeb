'use strict';

module.exports = function (express, context) {
	var APIs = ['documents', 'courses'];

	var apiRouter = express.Router({ mergeParams: true });
	APIs.forEach(function (API) {
		apiRouter.use('/' + API, require('./' + API + '/main.js')(express, context));
	});
	return apiRouter;
};
//# sourceMappingURL=main.js.map
