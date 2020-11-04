/*global QUnit*/

sap.ui.define([
	"it/aupsup/docmanagement/AUPSUP_HTML5_DOC_MANAG/controller/App.controller"
], function (Controller) {
	"use strict";

	QUnit.module("App Controller");

	QUnit.test("I should test the App controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});