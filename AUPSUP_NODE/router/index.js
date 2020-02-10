"use strict";

module.exports = function(app, server){
	app.use("/getUserBU", require("../it/alteaup/supplier/portal/utils/GetUserBU")());
};    