/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"TEST_MODIF/TEST_MODIF/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});