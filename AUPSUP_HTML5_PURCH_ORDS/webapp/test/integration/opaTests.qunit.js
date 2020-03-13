/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"it/alteaup/supplier/portal/purchords/AUPSUP_HTML5_PURCH_ORDS/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});