/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"it/aupsup/conto_lav/AUPSUP_HTML5_CONTO_LAV/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});