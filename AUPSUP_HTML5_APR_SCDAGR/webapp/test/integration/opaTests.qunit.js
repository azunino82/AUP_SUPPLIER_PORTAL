/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"it/alteaup/supplier/portal/aprvschdagr/AUPSUP_HTML5_APR_SCDAGR/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});