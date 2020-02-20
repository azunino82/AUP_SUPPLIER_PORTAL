/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"it/alteaup/supplier/portal/inboundDelivery/AUPSUP_HTML5_INBOUNDDELIV/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});