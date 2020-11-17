/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"it/aupsup/contracts/AUPSUP_HTML5_CONTRACTS/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});