/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"it/alteaup/supplier/portal/searchHU/AUPSUP_HTML5_SEARCH_HU/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});