/*global QUnit*/

sap.ui.define([
	"it/alteaup/supplier/portal/customizing/AUPSUP_HTML5_CUSTOMIZING/controller/App.controller"
], function (Controller) {
	"use strict";

	QUnit.module("App Controller");

	QUnit.test("I should test the App controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});