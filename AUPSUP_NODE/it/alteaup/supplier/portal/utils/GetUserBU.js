/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, new-cap: 0*/
"use strict";
var express = require("express");
var stringifyObj = require("stringify-object");
var xsenv = require("@sap/xsenv");
var xssec = require("@sap/xssec");
var hdbext = require("@sap/hdbext");

module.exports = function () {
	var app = express.Router();


	//Hello Router
	app.get("/", function (req, res) {
		hdbext.createConnection(req.tenantContainer, (err, client) => {
			if (err) {
				return res.status(500).send("CREATE CONNECTION ERROR: " + stringifyObj(err));
			} else {

				hdbext.loadProcedure(client, null, "AUPSUP_DATABASE.data.procedures.Utils::getCurrentSystem", function (err, sp) {

					sp((err, parameters, results) => {

						if (err) {
							return res.status(500).send(stringifyObj(err));
						} else {
							//reqStr = stringifyObj(results);
							//var outJson = {"results":reqStr};
							var outArr = [];
							results.forEach(element => {
								outArr.push(element);
							});

							return res.status(200).send({
								"results": outArr,
								"CurrentUser": req.user.id,
								"Scope": req.authInfo.scopes
							});
						}

					});
				});
			}
		});
	});

	// Parse URL-encoded bodies (as sent by HTML forms)
	app.use(express.urlencoded());

	// Parse JSON bodies (as sent by API clients)
	app.use(express.json());


	app.post("/", function (req, res) {

		return res.status(200).send({ "POST": true});

	});

	return app;
};
