/*global QUnit*/

sap.ui.define([
	"it/alteaup/supplier/portal/planning/AUPSUP_HTML5_PLANNING/controller/View1.controller"
], function (Controller) {
	"use strict";

	QUnit.module("View1 Controller");

	QUnit.test("I should test the View1 controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});