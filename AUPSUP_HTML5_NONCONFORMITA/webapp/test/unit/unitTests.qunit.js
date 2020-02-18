/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"it/alteaup/supplier/portal/nonConformita/AUPSUP_HTML5_NONCONFORMITA/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});