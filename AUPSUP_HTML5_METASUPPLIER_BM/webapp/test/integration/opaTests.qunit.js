/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"it/aupsup/metasupplier_BM/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});