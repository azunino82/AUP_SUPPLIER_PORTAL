/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"it/aupsup/docmanagement/AUPSUP_HTML5_DOC_MANAG/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});