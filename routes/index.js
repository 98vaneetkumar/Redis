var express = require('express');
var router = express.Router();

router.get("/", (req, res) => {
	res.render("index", { title: "Express" });
});
router.get("/documents", (req, res) => {
	let jsonData = require("../config/userSwagger.json");
	delete jsonData.host;
	jsonData.host = `${req.hostname}:${global.appPort}`;
	console.log("jsonData.host:  ", jsonData.host);
	return res.status(200).send(jsonData);
});

router.get("/club", (req, res) => {
	let jsonData = require("../config/clubSwagger.json");
	delete jsonData.host;
	jsonData.host = `${req.hostname}:${global.appPort}`;
	console.log("jsonData.host:  ", jsonData.host);
	return res.status(200).send(jsonData);
});

module.exports = router;
