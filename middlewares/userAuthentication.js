const Jwt = require("jsonwebtoken");
const privateKey = "config.APP_URLS.PRIVATE_KEY_ADMIN";
const Models = require("../models/index");

const verifyToken = async(req, res, next) => {

	if (req.headers && req.headers.authorization) {
		var token = req.headers.authorization;
		token = token.replace("Bearer ", "");
		let tokenData = await Jwt.verify(token,privateKey );
		console.log(tokenData);
		
		let userData = await Models.users.findOne({where:{id:tokenData.id},raw:true})
		if (userData) {
			if (userData && userData.isBlocked === 1) {
				return res.status(401).json({
					statusCode: 401,
					message: "Your account has been blocked by the Admin. Please contact support@support.com.",
				});
			} else {
				req.user = tokenData;
				req.user.accessToken = req.headers.authorization;
				await next();
			}
		} else {
				return res.status(401).json({
					statusCode: 401,
					message: "The token is not valid or User not Found!",
				});
			}
		
	} else {
		return res.status(401).json({
            statusCode: 401,
            message: "The token is not valid or User not Found!",
        });
	}
};
module.exports = {
	verifyToken: verifyToken
};