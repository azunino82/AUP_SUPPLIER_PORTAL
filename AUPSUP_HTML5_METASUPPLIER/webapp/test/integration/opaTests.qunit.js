/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"it/alteaup/supplier/portal/metasupplier/AUPSUP_HTML5_METASUPPLIER/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});