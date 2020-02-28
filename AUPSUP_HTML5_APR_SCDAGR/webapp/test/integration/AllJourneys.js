sap.ui.define([
	"sap/ui/test/Opa5",
	"./arrangements/Startup",
	"./NavigationJourney"
], function (Opa5, Startup) {
	"use strict";

	Opa5.extendConfig({
		arrangements: new Startup(),
		viewNamespace: "it.alteaup.supplier.portal.aprvschdagr.AUPSUP_HTML5_APR_SCDAGR.view.",
		autoWait: true
	});
});