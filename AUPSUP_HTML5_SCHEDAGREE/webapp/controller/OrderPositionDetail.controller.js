sap.ui.define([
	"it/alteaup/supplier/portal/schedulingagreement/AUPSUP_HTML5_SCHEDAGREE/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter"
], function (BaseController, JSONModel, MessageBox, Filter, Sorter) {
	"use strict";

	var that = undefined;

	return BaseController.extend("it.alteaup.supplier.portal.schedulingagreement.AUPSUP_HTML5_SCHEDAGREE.controller.OrderPositionDetail", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf it.altea.portal.schedulingagreement.view.OrderPositionDetail
		 */
		onInit: function () {
			that = this;
			that.getRouter().getRoute("detail").attachPatternMatched(that._onObjectMatched, that);

		},

		_onObjectMatched: function (oControlEvent) {

			//	that.showBusyDialog();
			var sObjectId = oControlEvent.getParameter("arguments").datas;

			var datas = JSON.parse(sObjectId);
			datas = JSON.parse(datas)
			
			that.loadObject(datas, function (oData) {
				that.hideBusyDialog();
				if (oData === null || oData === undefined) {} else {
					that._completeInit("Display", oData, function () {});
				}
			});
		},

		_completeInit: function (sMode, oData, fCompletion) {

			var oModel = new JSONModel();
			oModel.setData(oData);
			that.getView().setModel(oModel, "OrderPrositionJSONModel");
			fCompletion();
		},

		loadObject: function (sObjectId, fCompletion) {
			var url = "/backend/SchedulingAgreementManagement/GetPianoConfermaDetail?I_EBELN=" + sObjectId.orderId + "&I_EBELP=" + sObjectId.posNumber;
			that.ajaxGet(url, function (oData) {
				if (oData === null || oData === undefined) {
					if (fCompletion !== undefined) {
						fCompletion();
					}
				} else {
					fCompletion(oData);
				}
			});
		},
	});

});