const User = require('../models/User');
const SETTINGS = require('../Settings');

module.exports = (sharedTokens) => {
	return (req, res, next) => {
		req.profileID = false;
		req.getProfile = () => null;

		if(process.env.PROFILE_ID_OVERRIDE) {
			req.profileID = process.env.PROFILE_ID_OVERRIDE;
		} else if(sharedTokens.login[req.cookies[SETTINGS.SITE.COOKIE_TOKEN_NAME]]){
			req.loginToken = sharedTokens.login[req.cookies[SETTINGS.SITE.COOKIE_TOKEN_NAME]];
			req.profileID = sharedTokens.login[req.cookies[SETTINGS.SITE.COOKIE_TOKEN_NAME]].profileID;
		}

		if(!req.profileID) return next();

		req.getProfile = async (useDocument) => {
			if(!req.profileData) req.profileData = await User.findById(req.profileID)
			.then(doc => useDocument ? doc : doc.toObject())
			.catch(err => {
				console.error(err);

				return null;
			});

			return req.profileData;
		};

		next();
	};
};