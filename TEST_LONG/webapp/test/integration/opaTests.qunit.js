/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"it/alteaup/supplier/portal/testlonglonglonglong/TEST_LONG/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});