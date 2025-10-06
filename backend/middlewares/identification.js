const jwt = require('jsonwebtoken');

exports.identifier = (req, res, next) => {
	let token;
	if (req.headers.client === 'not-browser') {
		token = req.headers.authorization;
	} else {
		token = req.cookies['Authorization'];
	}
	if (!token) {
		return res.status(403).json({ success: false, message: 'Unauthorized' });
	}

	try {
		const userToken = token.split(' ')[1];
		const jwtVerified = jwt.verify(userToken, process.env.JWT_TOKEN);
		if (jwtVerified) {
			req.user = jwtVerified;
			req.userId = jwtVerified.userId
			req.accountID = jwtVerified.accountID
			req.userRole = jwtVerified.role
			req.email = jwtVerified.email
			next();
		} else {
			throw new Error('error in the token');
		}
	} catch (error) {
		console.log(error);
	}
};


