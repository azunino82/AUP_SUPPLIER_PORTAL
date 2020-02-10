"use strict";

module.exports = function(app, server){
	app.use("/Utils/GetPurchaseOrganizations", require("../it/alteaup/supplier/portal/utils/GetPurchaseOrganizations")());
};    