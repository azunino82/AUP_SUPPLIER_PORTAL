/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"it/alteaup/supplier/portal/customizing/AUPSUP_HTML5_CUSTOMIZING/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});