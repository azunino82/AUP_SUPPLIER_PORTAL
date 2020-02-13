/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"it/alteaup/supplier/portal/planning/AUPSUP_HTML5_PLANNING/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});