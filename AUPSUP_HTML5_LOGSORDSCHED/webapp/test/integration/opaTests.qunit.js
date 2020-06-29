/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"it/aupsup/logsordsched/AUPSUP_HTML5_LOGSORDSCHED/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});