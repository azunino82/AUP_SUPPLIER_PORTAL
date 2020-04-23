/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"it/aupsup/searchHU/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});