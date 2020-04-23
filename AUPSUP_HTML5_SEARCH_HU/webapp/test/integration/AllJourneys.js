sap.ui.define([
	"sap/ui/test/Opa5",
	"./arrangements/Startup",
	"./NavigationJourney"
], function (Opa5, Startup) {
	"use strict";

	Opa5.extendConfig({
		arrangements: new Startup(),
		viewNamespace: "it.aupsup.searchHU.AUPSUP_HTML5_SEARCH_HU.view.",
		autoWait: true
	});
});