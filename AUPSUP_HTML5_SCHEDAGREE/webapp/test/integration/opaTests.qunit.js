/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"it/alteaup/supplier/portal/schedulingagreement/AUPSUP_HTML5_SCHEDAGREE/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});